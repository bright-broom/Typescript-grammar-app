"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORIES, DIFFICULTY_LABELS } from "@/lib/constants";
import { toast } from "sonner";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Eye,
  RotateCcw,
  Send,
  Loader2,
  ChevronRight,
  BookOpen,
  Code2,
  Sparkles,
  AlertCircle,
} from "lucide-react";

// Monaco Editorは動的インポート
const CodeEditor = dynamic(
  () => import("@/components/code-editor").then((mod) => mod.CodeEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] border rounded-lg bg-muted/30 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">エディタを読み込み中...</p>
      </div>
    ),
  }
);

interface TestCase {
  description: string;
  code: string;
  shouldPass: boolean;
}

interface Problem {
  id: string;
  category: string;
  level: number;
  difficulty: "easy" | "medium" | "hard";
  promptJa: string;
  starterCode: string;
  expectedAnswer: string;
  hints: string[];
  explanation: string;
  testCases: TestCase[];
}

interface TestResult {
  description: string;
  passed: boolean;
  error?: string;
}

interface Props {
  problem: Problem;
}

export function ProblemSolver({ problem }: Props) {
  const [code, setCode] = useState(problem.starterCode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);

  const categoryInfo = CATEGORIES.find((c) => c.id === problem.category);

  // タイマー
  useEffect(() => {
    if (isCorrect) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isCorrect]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setTestResults(null);

    try {
      // テストケースを実行
      const results: TestResult[] = [];

      for (const testCase of problem.testCases) {
        const combinedCode = `${code}\n\n// Test case\n${testCase.code}`;

        const response = await fetch("/api/typecheck", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: combinedCode }),
        });

        const result = await response.json();
        const hasErrors = result.errors && result.errors.length > 0;
        const passed = testCase.shouldPass ? !hasErrors : hasErrors;

        results.push({
          description: testCase.description,
          passed,
          error: !passed
            ? testCase.shouldPass
              ? result.errors?.map((e: { message: string }) => e.message).join("\n")
              : "型エラーが発生するはずでしたが、発生しませんでした"
            : undefined,
        });
      }

      setTestResults(results);

      const allPassed = results.every((r) => r.passed);
      if (allPassed) {
        setIsCorrect(true);
        setShowExplanation(true);
        toast.success("正解です！おめでとうございます！", {
          icon: <Sparkles className="h-4 w-4 text-yellow-500" />,
        });
      } else {
        toast.error("不正解です。もう一度試してみましょう。");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  }, [code, problem.testCases]);

  const handleShowHint = useCallback(() => {
    if (hintsShown < problem.hints.length) {
      setHintsShown((prev) => prev + 1);
    } else {
      setShowAnswer(true);
    }
  }, [hintsShown, problem.hints.length]);

  const handleReset = useCallback(() => {
    setCode(problem.starterCode);
    setTestResults(null);
    setHintsShown(0);
    setShowAnswer(false);
    setShowExplanation(false);
    setIsCorrect(false);
  }, [problem.starterCode]);

  const passedCount = testResults?.filter((r) => r.passed).length || 0;
  const totalTests = problem.testCases.length;

  const difficultyColors = {
    easy: "bg-green-500/10 text-green-500 border-green-500/20",
    medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    hard: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/practice/free">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              戻る
            </Button>
          </Link>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="gap-1">
              <BookOpen className="h-3 w-3" />
              {categoryInfo?.name || problem.category}
            </Badge>
            <Badge variant="outline">Level {problem.level}</Badge>
            <Badge className={difficultyColors[problem.difficulty]}>
              {DIFFICULTY_LABELS[problem.difficulty]}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="font-mono text-sm">{formatTime(elapsedTime)}</span>
          </div>
          {isCorrect && (
            <Badge className="bg-green-500 text-white gap-1">
              <CheckCircle2 className="h-3 w-3" />
              正解
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Problem */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Code2 className="h-5 w-5 text-blue-500" />
                問題
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">{problem.promptJa}</p>
            </CardContent>
          </Card>

          {/* Hints */}
          {hintsShown > 0 && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-amber-500">
                  <Lightbulb className="h-4 w-4" />
                  ヒント
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {problem.hints.slice(0, hintsShown).map((hint, index) => (
                  <div
                    key={index}
                    className="flex gap-3 p-3 rounded-lg bg-background/50"
                  >
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <p className="text-sm">{hint}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Answer */}
          {showAnswer && (
            <Card className="border-purple-500/30 bg-purple-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-purple-500">
                  <Eye className="h-4 w-4" />
                  模範解答
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CodeEditor
                  value={problem.expectedAnswer}
                  readOnly
                  height="150px"
                />
              </CardContent>
            </Card>
          )}

          {/* Explanation */}
          {showExplanation && (
            <Card className="border-green-500/30 bg-green-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-green-500">
                  <Sparkles className="h-4 w-4" />
                  解説
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed">{problem.explanation}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Editor */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Code2 className="h-4 w-4" />
                回答
              </CardTitle>
              <CardDescription>
                TypeScriptコードを入力してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeEditor
                value={code}
                onChange={setCode}
                height="300px"
                readOnly={isCorrect}
              />
            </CardContent>
          </Card>

          {/* Test Results */}
          {testResults && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    {passedCount === totalTests ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                    テスト結果
                  </span>
                  <span className="text-muted-foreground">
                    {passedCount}/{totalTests} 合格
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress
                  value={(passedCount / totalTests) * 100}
                  className="h-2"
                />
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      result.passed
                        ? "bg-green-500/5 border-green-500/20"
                        : "bg-destructive/5 border-destructive/20"
                    }`}
                  >
                    {result.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 min-w-0">
                      <p className="text-sm font-medium">{result.description}</p>
                      {result.error && (
                        <pre className="text-xs text-destructive font-mono whitespace-pre-wrap break-all">
                          {result.error}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isCorrect}
              className="flex-1 gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  チェック中...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  提出
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleShowHint}
              disabled={showAnswer || isCorrect}
              className="gap-2"
            >
              <Lightbulb className="h-4 w-4" />
              {hintsShown < problem.hints.length
                ? `ヒント (${hintsShown}/${problem.hints.length})`
                : "答えを見る"}
            </Button>
            <Button variant="ghost" onClick={handleReset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {isCorrect && (
            <div className="flex gap-2">
              <Link href="/practice/free" className="flex-1">
                <Button variant="outline" className="w-full gap-2">
                  <BookOpen className="h-4 w-4" />
                  問題一覧へ
                </Button>
              </Link>
              <Link href="/practice/daily" className="flex-1">
                <Button className="w-full gap-2">
                  次の問題へ
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
