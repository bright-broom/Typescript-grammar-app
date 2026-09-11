import path from "node:path";
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

export interface TestCaseInput {
  description: string;
  code: string;
  shouldPass: boolean;
}

export interface TestCaseResult {
  description: string;
  passed: boolean;
  error?: string;
}

/** 提出コードの最大長（文字数） */
export const MAX_CODE_LENGTH = 20_000;

const INPUT_FILE = "/input.ts";

export const COMPILER_OPTIONS: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  strict: true,
  noEmit: true,
  skipLibCheck: true,
  // Monaco Editor 側と揃えて console などの DOM 型も使えるようにする
  lib: ["lib.es2022.d.ts", "lib.dom.d.ts"],
  types: [],
  // import や /// <reference path> で任意のファイルを読ませない
  noResolve: true,
};

const LIB_DIR = path.dirname(ts.getDefaultLibFilePath(COMPILER_OPTIONS));

function isLibFile(fileName: string): boolean {
  const resolved = path.resolve(fileName);
  return path.dirname(resolved) === LIB_DIR && /^lib(\.[\w.-]+)?\.d\.ts$/.test(path.basename(resolved));
}

// lib.*.d.ts のパース結果はリクエスト間で使い回す
const libSourceCache = new Map<string, ts.SourceFile>();

function getLibSourceFile(fileName: string, languageVersion: ts.ScriptTarget | ts.CreateSourceFileOptions) {
  const target = typeof languageVersion === "object" ? languageVersion.languageVersion : languageVersion;
  const key = `${target}:${fileName}`;
  const cached = libSourceCache.get(key);
  if (cached) return cached;
  const text = ts.sys.readFile(fileName);
  if (text === undefined) return undefined;
  const sourceFile = ts.createSourceFile(fileName, text, languageVersion);
  libSourceCache.set(key, sourceFile);
  return sourceFile;
}

/**
 * コードを型チェックする（ランタイム実行はしない）。
 * ファイルシステムへのアクセスは TypeScript 同梱の lib 定義のみに制限している。
 */
export function typeCheck(code: string): TypeCheckResult {
  const host: ts.CompilerHost = {
    getSourceFile: (fileName, languageVersion) => {
      if (fileName === INPUT_FILE) {
        return ts.createSourceFile(fileName, code, languageVersion, true);
      }
      return isLibFile(fileName) ? getLibSourceFile(fileName, languageVersion) : undefined;
    },
    getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
    writeFile: () => {},
    getCurrentDirectory: () => "/",
    getCanonicalFileName: (fileName) => fileName,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => "\n",
    fileExists: (fileName) => fileName === INPUT_FILE || (isLibFile(fileName) && ts.sys.fileExists(fileName)),
    readFile: (fileName) =>
      fileName === INPUT_FILE ? code : isLibFile(fileName) ? ts.sys.readFile(fileName) : undefined,
    directoryExists: () => false,
    getDirectories: () => [],
  };

  const program = ts.createProgram([INPUT_FILE], COMPILER_OPTIONS, host);
  const diagnostics = [
    ...program.getSyntacticDiagnostics(),
    ...program.getSemanticDiagnostics(),
    ...program.getGlobalDiagnostics(),
  ];

  const errors: TypeCheckError[] = diagnostics
    .filter((d) => d.category === ts.DiagnosticCategory.Error)
    .map((d) => {
      const position =
        d.file && d.start !== undefined ? d.file.getLineAndCharacterOfPosition(d.start) : { line: 0, character: 0 };
      return {
        line: position.line + 1,
        column: position.character + 1,
        message: ts.flattenDiagnosticMessageText(d.messageText, "\n"),
        code: d.code,
      };
    });

  return {
    success: errors.length === 0,
    errors,
  };
}

function formatErrors(errors: TypeCheckError[]): string {
  return errors.map((e) => `(${e.line}:${e.column}) ${e.message}`).join("\n");
}

/**
 * ユーザーコードとテストコードを結合して型チェックし、各テストケースの合否を返す。
 *
 * - ユーザーコード単体で型エラーがある場合は全テスト不合格
 * - shouldPass: true  → 結合したコードに型エラーがないこと
 * - shouldPass: false → テストコード部分で型エラーが発生すること
 *   （ユーザーコード側で無関係なエラーを起こして通過させる抜け道を防ぐ）
 */
export function runTestCases(userCode: string, testCases: TestCaseInput[]): TestCaseResult[] {
  const userResult = typeCheck(userCode);
  if (!userResult.success) {
    const message = `回答コードに型エラーがあります:\n${formatErrors(userResult.errors)}`;
    return testCases.map((testCase) => ({
      description: testCase.description,
      passed: false,
      error: message,
    }));
  }

  const userLineCount = userCode.split("\n").length;
  // `${userCode}\n\n// Test case\n` の後ろからテストコードが始まる
  const testStartLine = userLineCount + 3;

  return testCases.map((testCase) => {
    const combinedCode = `${userCode}\n\n// Test case\n${testCase.code}`;
    const result = typeCheck(combinedCode);

    if (testCase.shouldPass) {
      return {
        description: testCase.description,
        passed: result.success,
        error: result.success ? undefined : result.errors.map((e) => e.message).join("\n"),
      };
    }

    const errorsInTest = result.errors.filter((e) => e.line >= testStartLine);
    const passed = errorsInTest.length > 0;
    return {
      description: testCase.description,
      passed,
      error: passed ? undefined : "型エラーが発生するはずでしたが、発生しませんでした",
    };
  });
}
