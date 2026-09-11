import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProblemBadges } from "@/components/problem-badges";
import { getDailyChallenge, getGuestDailyChallenge } from "@/lib/server/daily";
import { getCurrentUserId } from "@/lib/server/user";
import { cn } from "@/lib/utils";
import { ArrowRight, Calendar, CheckCircle2, RefreshCcw, Sparkles, Target, Zap } from "lucide-react";

export default async function DailyChallengePage() {
  const userId = await getCurrentUserId();
  const daily = userId ? await getDailyChallenge(userId) : await getGuestDailyChallenge();

  const totalCount = daily.items.length;
  const progressPercent = totalCount > 0 ? (daily.completedCount / totalCount) * 100 : 0;
  const allDone = totalCount > 0 && daily.completedCount === totalCount;
  const nextItem = daily.items.find((item) => !item.completed);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <span className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-500" aria-hidden />
            </span>
            デイリーチャレンジ
          </h1>
          <p className="text-muted-foreground mt-2">
            {userId
              ? `${daily.date} の学習セット：復習 ${daily.reviewCount}問 + 新規 ${daily.newCount}問（SRSが自動で選んでいます）`
              : "ゲスト用のお試しセットです（各カテゴリの Level 1 から日替わりで出題）"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-3xl font-bold">
              {daily.completedCount} <span className="text-muted-foreground text-lg">/ {totalCount}</span>
            </p>
            <p className="text-sm text-muted-foreground">完了</p>
          </div>
          {nextItem && (
            <Link
              href={`/practice/${nextItem.id}?from=daily`}
              className={buttonVariants({ size: "lg", className: "gap-2" })}
            >
              <Zap className="h-4 w-4" aria-hidden />
              {daily.completedCount > 0 ? "続きから" : "はじめる"}
            </Link>
          )}
        </div>
      </div>

      {/* Progress Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full" />
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-blue-500" aria-hidden />
            今日の進捗
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progressPercent} className="h-3" aria-label="デイリーチャレンジの進捗" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{totalCount - daily.completedCount}問 残り</span>
            <span className="font-medium">{Math.round(progressPercent)}% 完了</span>
          </div>
          {allDone && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-500 text-sm">
              <Sparkles className="h-4 w-4" aria-hidden />
              今日の目標達成！お疲れ様でした！
            </div>
          )}
        </CardContent>
      </Card>

      {/* Problem List */}
      <ol className="space-y-4">
        {daily.items.map((problem, index) => (
          <li key={problem.id}>
            <Card
              className={cn(
                "transition-all",
                problem.completed ? "opacity-60 bg-muted/20" : "hover:border-primary/50 hover:shadow-md"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold",
                      problem.completed ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {problem.completed ? (
                      <CheckCircle2 className="h-5 w-5" aria-label="完了" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {problem.isReview ? (
                        <Badge className="gap-1 bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20">
                          <RefreshCcw className="h-3 w-3" aria-hidden />
                          復習
                        </Badge>
                      ) : (
                        <Badge className="gap-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
                          <Sparkles className="h-3 w-3" aria-hidden />
                          新規
                        </Badge>
                      )}
                      <ProblemBadges
                        category={problem.category}
                        level={problem.level}
                        difficulty={problem.difficulty}
                      />
                    </div>
                    <p className="text-base">{problem.promptJa}</p>
                  </div>

                  <div className="flex-shrink-0">
                    <Link
                      href={`/practice/${problem.id}?from=daily`}
                      className={buttonVariants({
                        size: "sm",
                        variant: problem.completed ? "outline" : "default",
                        className: "gap-2",
                      })}
                      aria-label={`${index + 1}問目を${problem.completed ? "もう一度解く" : "解く"}`}
                    >
                      {problem.completed ? "もう一度" : "解く"}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>

      {totalCount === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-green-500" aria-hidden />
            </div>
            <h2 className="font-semibold text-lg mb-2">今日出題する問題はありません</h2>
            <p className="text-muted-foreground mb-4">
              復習期限の来た問題も、解放済みレベルの新しい問題もありません。フリープラクティスで追加学習しましょう。
            </p>
            <Link href="/practice/free" className={buttonVariants({ variant: "outline", className: "gap-2" })}>
              <Zap className="h-4 w-4" aria-hidden />
              フリープラクティスで追加学習
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
