import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CATEGORIES, DIFFICULTY_LABELS } from "@/lib/constants";
import {
  Calendar,
  CheckCircle2,
  ArrowRight,
  Zap,
  Target,
  Code2,
  BookOpen,
  Sparkles,
} from "lucide-react";

async function getDailyProblems() {
  // TODO: 実際にはSRSに基づいて問題を選択
  // 現在はランダムに10問選択
  const problems = await prisma.problem.findMany({
    select: {
      id: true,
      category: true,
      level: true,
      difficulty: true,
      promptJa: true,
    },
    take: 10,
    orderBy: {
      createdAt: "asc",
    },
  });

  return problems;
}

export default async function DailyChallengePage() {
  const problems = await getDailyProblems();

  // TODO: ユーザーの進捗を取得
  const completedCount = 0;
  const totalCount = problems.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const difficultyColors = {
    easy: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    medium: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    hard: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
            デイリーチャレンジ
          </h1>
          <p className="text-muted-foreground mt-2">
            今日の学習セット：新規30% + 復習70%
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-3xl font-bold">
              {completedCount} <span className="text-muted-foreground text-lg">/ {totalCount}</span>
            </p>
            <p className="text-sm text-muted-foreground">完了</p>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full" />
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-blue-500" />
            今日の進捗
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progressPercent} className="h-3" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {totalCount - completedCount}問 残り
            </span>
            <span className="font-medium">
              {Math.round(progressPercent)}% 完了
            </span>
          </div>
          {completedCount === totalCount && totalCount > 0 && (
            <div className="flex items-center gap-2 text-green-500 text-sm">
              <Sparkles className="h-4 w-4" />
              今日の目標達成！お疲れ様でした！
            </div>
          )}
        </CardContent>
      </Card>

      {/* Problem List */}
      <div className="space-y-4">
        {problems.map((problem, index) => {
          const categoryInfo = CATEGORIES.find((c) => c.id === problem.category);
          const isCompleted = index < completedCount;

          return (
            <Card
              key={problem.id}
              className={`transition-all ${
                isCompleted
                  ? "opacity-60 bg-muted/20"
                  : "hover:border-primary/50 hover:shadow-md"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Number Circle */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      isCompleted
                        ? "bg-green-500/10 text-green-500"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="outline" className="gap-1">
                        <BookOpen className="h-3 w-3" />
                        {categoryInfo?.name || problem.category}
                      </Badge>
                      <Badge variant="outline">
                        <Code2 className="h-3 w-3 mr-1" />
                        Level {problem.level}
                      </Badge>
                      <Badge
                        className={
                          difficultyColors[
                            problem.difficulty as keyof typeof difficultyColors
                          ]
                        }
                      >
                        {DIFFICULTY_LABELS[problem.difficulty as keyof typeof DIFFICULTY_LABELS]}
                      </Badge>
                    </div>
                    <p className="text-base">{problem.promptJa}</p>
                  </div>

                  {/* Action */}
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        完了
                      </Badge>
                    ) : (
                      <Link href={`/practice/${problem.id}`}>
                        <Button size="sm" className="gap-2">
                          解く
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {problems.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                今日の問題はすべて完了しました！
              </h3>
              <p className="text-muted-foreground mb-4">
                素晴らしい！明日もがんばりましょう。
              </p>
              <Link href="/practice/free">
                <Button variant="outline" className="gap-2">
                  <Zap className="h-4 w-4" />
                  フリープラクティスで追加学習
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
