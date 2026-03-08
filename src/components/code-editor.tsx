"use client";

import { useRef, useCallback } from "react";
import Editor, { OnMount, OnChange } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: string;
  theme?: "vs-dark" | "light";
}

export function CodeEditor({
  value,
  onChange,
  language = "typescript",
  readOnly = false,
  height = "300px",
  theme = "vs-dark",
}: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;

    // TypeScript コンパイラオプションを設定
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      strict: true,
      skipLibCheck: true,
      strictNullChecks: true,
      strictFunctionTypes: true,
      strictPropertyInitialization: true,
      noImplicitAny: true,
      noImplicitReturns: true,
      noImplicitThis: true,
      noUnusedLocals: false,
      noUnusedParameters: false,
    });

    // 診断オプションを設定
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    // エディタのフォーカス
    editor.focus();
  }, []);

  const handleChange: OnChange = useCallback(
    (value) => {
      if (onChange && value !== undefined) {
        onChange(value);
      }
    },
    [onChange]
  );

  return (
    <div className="border rounded-lg overflow-hidden">
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        theme={theme}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          roundedSelection: true,
          scrollBeyondLastLine: false,
          readOnly,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
          padding: { top: 16, bottom: 16 },
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
    </div>
  );
}
