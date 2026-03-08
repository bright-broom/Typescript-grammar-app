import ts from "typescript";

export interface TypeCheckResult {
  success: boolean;
  errors: TypeCheckError[];
}

export interface TypeCheckError {
  line: number;
  column: number;
  message: string;
  code: number;
}

export interface TestCaseResult {
  description: string;
  passed: boolean;
  error?: string;
}

export function typeCheck(code: string): TypeCheckResult {
  const filename = "input.ts";

  const compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.CommonJS,
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    noEmit: true,
    lib: ["lib.es2020.d.ts"],
  };

  const host = ts.createCompilerHost(compilerOptions);

  const originalGetSourceFile = host.getSourceFile;
  host.getSourceFile = (fileName, languageVersion, onError) => {
    if (fileName === filename) {
      return ts.createSourceFile(fileName, code, languageVersion, true);
    }
    return originalGetSourceFile(fileName, languageVersion, onError);
  };

  host.fileExists = (fileName) => {
    if (fileName === filename) return true;
    return ts.sys.fileExists(fileName);
  };

  host.readFile = (fileName) => {
    if (fileName === filename) return code;
    return ts.sys.readFile(fileName);
  };

  const program = ts.createProgram([filename], compilerOptions, host);
  const diagnostics = ts.getPreEmitDiagnostics(program);

  const errors: TypeCheckError[] = diagnostics
    .filter((d) => d.file?.fileName === filename)
    .map((d) => {
      const { line, character } = d.file!.getLineAndCharacterOfPosition(d.start!);
      return {
        line: line + 1,
        column: character + 1,
        message: ts.flattenDiagnosticMessageText(d.messageText, "\n"),
        code: d.code,
      };
    });

  return {
    success: errors.length === 0,
    errors,
  };
}

export function runTestCases(
  userCode: string,
  testCases: { description: string; code: string; shouldPass: boolean }[]
): TestCaseResult[] {
  return testCases.map((testCase) => {
    // ユーザーコードとテストコードを結合
    const combinedCode = `${userCode}\n\n// Test case\n${testCase.code}`;
    const result = typeCheck(combinedCode);

    const hasErrors = result.errors.length > 0;
    const passed = testCase.shouldPass ? !hasErrors : hasErrors;

    return {
      description: testCase.description,
      passed,
      error: !passed
        ? testCase.shouldPass
          ? result.errors.map((e) => e.message).join("\n")
          : "型エラーが発生するはずでしたが、発生しませんでした"
        : undefined,
    };
  });
}
