"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Eye,
  FlaskConical,
  Lightbulb,
  Loader2,
  RotateCcw,
  Send,
  Sparkles,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookmarkButton } from "@/components/bookmark-button";
import { ProblemBadges } from "@/components/problem-badges";
import type { SolverProblem } from "@/lib/server/problems";
import type { HintResult, SubmissionResult } from "@/lib/server/submissions";
import type { TestCaseResult } from "@/lib/typecheck";
import { cn } from "@/lib/utils";

// Monaco Editorは動的インポート
const CodeEditor = dynamic(() => import("@/components/code-editor").then((mod) => mod.CodeEditor), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] border rounded-lg bg-muted/30 flex flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
      <p className="text-sm text-muted-foreground">エディタを読み込み中...</p>
    </div>
  ),
});

interface Props {
  problem: SolverProblem;
  isGuest: boolean;
  from: "daily" | "free";
}

interface Answer {
  expectedAnswer: string;
  explanation: string;
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function ProblemSolver({ problem, isGuest, from }: Props) {
  const [code, setCode] = useState(problem.starterCode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<TestCaseResult[] | null>(null);
  const [hints, setHints] = useState<string[]>([]);
  const [hintLoading, setHintLoading] = useState(false);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [outcome, setOutcome] = useState<SubmissionResult | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [nextHref, setNextHref] = useState<string | null>(null);
  const startTime = useRef<number>(0);

  const isCorrect = !!outcome?.correct;
  const isFinished = isCorrect || !!answer;
  const backHref = from === "daily" ? "/practice/daily" : `/practice/free?category=${problem.category}`;

  useEffect(() => {
    startTime.current = Date.now();
  }, []);

  // タイマー（回答速度の記録用）
  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished]);

  const secondsSpent = useCallback(() => Math.floor((Date.now() - startTime.current) / 1000), []);

  // 解き終わったら次の問題を探す
  useEffect(() => {
    if (!isFinished) return;
    let cancelled = false;
    (async () => {
      try {
        if (from === "daily") {
          const response = await fetch("/api/practice/daily");
          const daily: { items: { id: string; completed: boolean }[] } = await response.json();
          const index = daily.items.findIndex((item) => item.id === problem.id);
          const ordered = [...daily.items.slice(index + 1), ...daily.items.slice(0, Math.max(index, 0))];
          const next = ordered.find((item) => item.id !== problem.id && !item.completed);
          if (!cancelled) setNextHref(next ? `/practice/${next.id}?from=daily` : "/practice/daily");
        } else {
          const response = await fetch(`/api/practice/free?category=${problem.category}`);
          const { problems }: { problems: { id: string; locked: boolean; solved: boolean }[] } = await response.json();
          const index = problems.findIndex((item) => item.id === problem.id);
          const next = problems.slice(index + 1).find((item) => !item.locked);
          if (!cancelled) setNextHref(next ? `/practice/${next.id}` : backHref);
        }
      } catch {
        if (!cancelled) setNextHref(backHref);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isFinished, from, problem.id, problem.category, backHref]);

  const requestHint = useCallback(
    async (index: number) => {
      setHintLoading(true);
      try {
        const response = await fetch(`/api/problems/${problem.id}/hint`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ index, code, timeSpent: secondsSpent() }),
        });
        if (!response.ok) throw new Error(String(response.status));
        const result: HintResult = await response.json();
        if (result.type === "hint") {
          setHints((prev) => (prev.length === result.index ? [...prev, result.hint] : prev));
        } else {
          setAnswer({ expectedAnswer: result.expectedAnswer, explanation: result.explanation });
        }
      } catch {
        toast.error("ヒントを取得できませんでした");
      } finally {
        setHintLoading(false);
      }
    },
    [problem.id, code, secondsSpent]
  );

  /** 次のヒントを表示。ヒントを使い切っていたら模範解答を表示する */
  const revealNext = useCallback(() => {
    if (answer || hintLoading) return;
    return requestHint(Math.min(hints.length, problem.hintCount));
  }, [answer, hintLoading, hints.length, problem.hintCount, requestHint]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || isCorrect) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/problems/${problem.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, timeSpent: secondsSpent(), hintsUsed: hints.length }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error ?? "エラーが発生しました。もう一度お試しください。");
        return;
      }

      const result = data as SubmissionResult;
      setTestResults(result.results);

      if (result.correct) {
        setOutcome(result);
        toast.success(result.xpEarned > 0 ? `正解です！ +${result.xpEarned} XP` : "正解です！おめでとうございます！", {
          icon: <Sparkles className="h-4 w-4 text-yellow-500" />,
        });
        if (result.userLeveledUp) toast.success(`レベルアップ！ Lv.${result.userLevel} になりました`);
        for (const unlock of result.levelUnlocks) {
          toast.success(`🔓 ${unlock.categoryName} Level ${unlock.level} が解放されました！`);
        }
        for (const badge of result.newBadges) {
          toast.success(`${badge.icon} バッジ獲得: ${badge.name}`, { description: badge.description });
        }
      } else {
        setWrongAttempts((n) => n + 1);
        toast.error("不正解です。ヒントを参考にもう一度試してみましょう。");
        // 不正解のたびにヒントを1つずつ表示し、使い切ったら模範解答を提示する
        if (!answer) void revealNext();
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, isCorrect, problem.id, code, secondsSpent, hints.length, answer, revealNext]);

  // エディタ外でも Ctrl/Cmd + Enter で提出できるようにする
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        if ((event.target as HTMLElement | null)?.closest?.(".monaco-editor")) return;
        event.preventDefault();
        void handleSubmit();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleSubmit]);

  const handleReset = () => {
    setCode(problem.starterCode);
    setTestResults(null);
  };

  const passedCount = testResults?.filter((r) => r.passed).length ?? 0;
  const totalTests = problem.testCases.length;
  const explanation = outcome?.explanation ?? answer?.explanation;
  const expectedAnswer = outcome?.expectedAnswer ?? answer?.expectedAnswer;
  const hintButtonLabel =
    hints.length < problem.hintCount ? `ヒント (${hints.length}/${problem.hintCount})` : "答えを見る";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Link href={backHref} className={buttonVariants({ variant: "ghost", size: "sm", className: "gap-1" })}>
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {from === "daily" ? "デイリーに戻る" : "問題一覧"}
          </Link>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <ProblemBadges category={problem.category} level={problem.level} difficulty={problem.difficulty} />
        </div>
        <div className="flex items-center gap-3">
          {!isGuest && <BookmarkButton problemId={problem.id} initialBookmarked={problem.bookmarked} />}
          <div
            className="flex items-center gap-2 text-muted-foreground"
            aria-label={`経過時間 ${formatTime(elapsedTime)}`}
          >
            <Clock className="h-4 w-4" aria-hidden />
            <span className="font-mono text-sm tabular-nums">{formatTime(elapsedTime)}</span>
          </div>
          {isCorrect && (
            <Badge className="bg-green-500 text-white gap-1">
              <CheckCircle2 className="h-3 w-3" aria-hidden />
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
                <Code2 className="h-5 w-5 text-blue-500" aria-hidden />
                <h1>問題</h1>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-lg leading-relaxed">{problem.promptJa}</p>
              {problem.promptEn && <p className="text-sm text-muted-foreground">{problem.promptEn}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <FlaskConical className="h-4 w-4 text-sky-500" aria-hidden />
                テストケース
              </CardTitle>
              <CardDescription>すべてのテストに合格すれば正解です（模範解答と完全一致でなくてOK）</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {problem.testCases.map((testCase) => (
                <details key={testCase.id} className="group rounded-lg border px-3 py-2">
                  <summary className="cursor-pointer text-sm flex items-center gap-2 list-none [&::-webkit-details-marker]:hidden">
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-open:rotate-90" aria-hidden />
                    <span className="flex-1">{testCase.description}</span>
                    <Badge variant="outline" className="text-[0.7rem]">
                      {testCase.shouldPass ? "型チェックが通る" : "型エラーになる"}
                    </Badge>
                  </summary>
                  <pre className="mt-2 text-xs font-mono whitespace-pre-wrap break-all bg-muted/50 rounded p-2">
                    {testCase.code}
                  </pre>
                </details>
              ))}
            </CardContent>
          </Card>

          {hints.length > 0 && (
            <Card className="border-amber-500/30 bg-amber-500/5" aria-live="polite">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500">
                  <Lightbulb className="h-4 w-4" aria-hidden />
                  ヒント
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {hints.map((hint, index) => (
                  <div key={index} className="flex gap-3 p-3 rounded-lg bg-background/50">
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-500 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <p className="text-sm">{hint}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {expectedAnswer && (
            <Card className="border-purple-500/30 bg-purple-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                  <Eye className="h-4 w-4" aria-hidden />
                  模範解答
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm font-mono whitespace-pre-wrap break-all rounded-lg border bg-background p-4">
                  {expectedAnswer}
                </pre>
              </CardContent>
            </Card>
          )}

          {explanation && (
            <Card className="border-green-500/30 bg-green-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-green-600 dark:text-green-500">
                  <Sparkles className="h-4 w-4" aria-hidden />
                  解説
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed">{explanation}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Editor */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Code2 className="h-4 w-4" aria-hidden />
                回答
              </CardTitle>
              <CardDescription>
                TypeScriptコードを入力してください（
                <kbd className="font-mono text-xs">Ctrl</kbd>/<kbd className="font-mono text-xs">⌘</kbd> +{" "}
                <kbd className="font-mono text-xs">Enter</kbd> で提出、
                <kbd className="font-mono text-xs">Ctrl</kbd> + <kbd className="font-mono text-xs">M</kbd> で Tab
                によるフォーカス移動を切り替え）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeEditor
                value={code}
                onChange={setCode}
                onSubmit={handleSubmit}
                height="300px"
                readOnly={isCorrect}
                autoFocus
              />
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={isSubmitting || isCorrect} className="flex-1 gap-2" size="lg">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  チェック中...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" aria-hidden />
                  提出
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={revealNext}
              disabled={isFinished || hintLoading}
              className="gap-2"
            >
              {hintLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Lightbulb className="h-4 w-4" aria-hidden />
              )}
              {hintButtonLabel}
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={handleReset}
              disabled={isCorrect}
              aria-label="コードを初期状態に戻す"
              title="コードを初期状態に戻す"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
            </Button>
          </div>

          {wrongAttempts > 0 && !isFinished && (
            <p className="text-xs text-muted-foreground">
              不正解 {wrongAttempts} 回。不正解のたびにヒントが1つずつ表示され、使い切ると模範解答が表示されます。
            </p>
          )}

          {testResults && (
            <Card aria-live="polite">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    {passedCount === totalTests ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-destructive" aria-hidden />
                    )}
                    テスト結果
                  </span>
                  <span className="text-muted-foreground">
                    {passedCount}/{totalTests} 合格
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={(passedCount / Math.max(totalTests, 1)) * 100} className="h-2" />
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border",
                      result.passed ? "bg-green-500/5 border-green-500/20" : "bg-destructive/5 border-destructive/20"
                    )}
                  >
                    {result.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" aria-label="合格" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" aria-label="不合格" />
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

          {outcome?.saved && (
            <Card className="border-yellow-500/30 bg-yellow-500/5">
              <CardContent className="py-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <span className="flex items-center gap-1 font-medium">
                  <Zap className="h-4 w-4 text-yellow-500" aria-hidden />+{outcome.xpEarned} XP
                  {outcome.xpEarned === 0 && (
                    <span className="text-muted-foreground font-normal">（今日は獲得済み）</span>
                  )}
                </span>
                <span className="flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-yellow-500" aria-hidden />
                  Lv.{outcome.userLevel}（累計 {outcome.totalXp?.toLocaleString()} XP）
                </span>
                <span>🔥 {outcome.streak}日連続</span>
              </CardContent>
            </Card>
          )}

          {isFinished && (
            <div className="flex gap-2">
              <Link href={backHref} className={buttonVariants({ variant: "outline", className: "flex-1 gap-2" })}>
                <BookOpen className="h-4 w-4" aria-hidden />
                {from === "daily" ? "デイリー一覧へ" : "問題一覧へ"}
              </Link>
              <Link
                href={nextHref ?? backHref}
                className={buttonVariants({ className: "flex-1 gap-2" })}
                aria-disabled={!nextHref}
              >
                次の問題へ
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
