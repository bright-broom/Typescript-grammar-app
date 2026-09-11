"use client";

import { useCallback, useEffect, useRef } from "react";
import Editor, { type OnChange, type OnMount } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { getFontSize, usePreferences } from "@/stores/preferences";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  /** Ctrl/Cmd + Enter で呼ばれる */
  onSubmit?: () => void;
  language?: string;
  readOnly?: boolean;
  height?: string;
  ariaLabel?: string;
  autoFocus?: boolean;
}

export function CodeEditor({
  value,
  onChange,
  onSubmit,
  language = "typescript",
  readOnly = false,
  height = "300px",
  ariaLabel = "TypeScriptコードエディタ",
  autoFocus = false,
}: CodeEditorProps) {
  const { resolvedTheme } = useTheme();
  const fontSize = usePreferences((state) => getFontSize(state.fontSize).editorPx);
  const onSubmitRef = useRef(onSubmit);

  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  const handleEditorDidMount: OnMount = useCallback(
    (editor, monaco) => {
      const ts = monaco.languages.typescript;

      // サーバー側の正解判定（src/lib/typecheck.ts）と同じ設定にそろえる
      ts.typescriptDefaults.setCompilerOptions({
        target: ts.ScriptTarget.ES2022,
        lib: ["es2022", "dom"],
        module: ts.ModuleKind.ESNext,
        allowNonTsExtensions: true,
        noEmit: true,
        strict: true,
        noUnusedLocals: false,
        noUnusedParameters: false,
      });
      ts.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });
      editor.addAction({
        id: "submit-answer",
        label: "回答を提出",
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
        run: () => onSubmitRef.current?.(),
      });
      if (autoFocus) editor.focus();
    },
    [autoFocus]
  );

  const handleChange: OnChange = useCallback(
    (next) => {
      if (onChange && next !== undefined) onChange(next);
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
        theme={resolvedTheme === "light" ? "light" : "vs-dark"}
        options={{
          ariaLabel,
          minimap: { enabled: false },
          fontSize,
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
          accessibilitySupport: "auto",
        }}
      />
    </div>
  );
}
