import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BadgeList } from "@/components/badge-list";
import { Heatmap } from "@/components/heatmap";
import { SignInPrompt } from "@/components/sign-in-prompt";
import { categoryName } from "@/components/problem-badges";
import { MAX_LEVEL } from "@/lib/srs";
import {
  getCategoryProgress,
  getHeatmap,
  getProgressSummary,
  getUserStats,
  getWeakness,
  getWeeklyActivity,
} from "@/lib/server/stats";
import { getCurrentUserId } from "@/lib/server/user";
import { formatDuration, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Lightbulb,
  Lock,
  Tag,
  Target,
  TrendingUp,
  Turtle,
} from "lucide-react";

function Delta({
  current,
  previous,
  unit,
  invert = false,
}: {
  current: number | null;
  previous: number | null;
  unit: "pt" | "秒" | "回";
  invert?: boolean;
}) {
  if (current === null || previous === null) return <span className="text-muted-foreground">先週のデータなし</span>;
  const diff = unit === "pt" ? Math.round((current - previous) * 100) : Math.round(current - previous);
  if (diff === 0) return <span className="text-muted-foreground">先週と同じ</span>;
  const good = invert ? diff < 0 : diff > 0;
  return (
    <span className={good ? "text-green-600 dark:text-green-500" : "text-orange-600 dark:text-orange-500"}>
      {diff > 0 ? "+" : ""}
      {diff}
      {unit === "pt" ? "%" : unit} 先週比
    </span>
  );
}

export default async function ProgressPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">進捗</h1>
        <SignInPrompt
          title="進捗を記録するにはサインインしてください"
          description="学習カレンダー、カテゴリ別の習熟度、弱点分析、バッジはサインイン後に確認できます。"
        />
      </div>
    );
  }

  const [summary, categories, heatmap, weekly, weakness, stats] = await Promise.all([
    getProgressSummary(userId),
    getCategoryProgress(userId),
    getHeatmap(userId, 365),
    getWeeklyActivity(userId),
    getWeakness(userId),
    getUserStats(userId),
  ]);

  const masteredCategories = categories.filter((c) => c.unlockedLevel >= MAX_LEVEL).length;
  const maxActivity = Math.max(1, ...weekly.map((d) => d.count));
  const hasWeakness =
    weakness.weakCategories.length > 0 || weakness.weakProblems.length > 0 || weakness.slowProblems.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <span className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-green-500" aria-hidden />
          </span>
          進捗
        </h1>
        <p className="text-muted-foreground mt-2">あなたの学習進捗を確認しましょう</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">正解した問題</CardTitle>
              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-blue-500" aria-hidden />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.solvedProblems}</p>
            <p className="text-xs text-muted-foreground mt-1">
              総提出 {summary.totalAttempts}回・今週 {summary.thisWeek.attempts}回
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">全レベル解放カテゴリ</CardTitle>
              <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {masteredCategories} <span className="text-lg text-muted-foreground">/ {categories.length}</span>
            </p>
            <Progress
              value={(masteredCategories / categories.length) * 100}
              className="h-1 mt-2"
              aria-label="全レベル解放済みカテゴリの割合"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">正答率（今週）</CardTitle>
              <div className="h-8 w-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Target className="h-4 w-4 text-yellow-500" aria-hidden />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatPercent(summary.thisWeek.accuracy ?? summary.accuracy)}</p>
            <p className="text-xs mt-1">
              <Delta current={summary.thisWeek.accuracy} previous={summary.lastWeek.accuracy} unit="pt" />
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">平均回答時間（今週）</CardTitle>
              <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-purple-500" aria-hidden />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatDuration(summary.thisWeek.averageTime ?? summary.averageTime)}</p>
            <p className="text-xs mt-1">
              <Delta current={summary.thisWeek.averageTime} previous={summary.lastWeek.averageTime} unit="秒" invert />
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" aria-hidden />
            学習カレンダー
          </CardTitle>
          <CardDescription>過去1年間の学習履歴（🔥 {stats.streak}日連続）</CardDescription>
        </CardHeader>
        <CardContent>
          <Heatmap days={heatmap} />
        </CardContent>
      </Card>

      {/* Weekly Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" aria-hidden />
            直近7日間の活動
          </CardTitle>
          <CardDescription>日別の回答数</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex items-end justify-between h-40 gap-2">
            {weekly.map((day, index) => {
              const isToday = index === weekly.length - 1;
              return (
                <li key={day.date} className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                  <span className="text-xs text-muted-foreground">{day.count}</span>
                  <div
                    className={cn(
                      "w-full max-w-[40px] rounded-t",
                      isToday
                        ? "bg-gradient-to-t from-blue-500 to-blue-400"
                        : "bg-gradient-to-t from-primary/80 to-primary/60"
                    )}
                    style={{ height: `${Math.max((day.count / maxActivity) * 100, 4)}%` }}
                    aria-hidden
                  />
                  <span className={cn("text-xs", isToday ? "font-bold text-blue-500" : "text-muted-foreground")}>
                    {day.label}
                    <span className="sr-only">
                      （{day.date}）{day.count}回答
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      {/* Category Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" aria-hidden />
            カテゴリ別進捗
          </CardTitle>
          <CardDescription>
            習熟度 = 正解済みの問題数 / 全問題数。Level N を正答率80%以上で5回クリアすると次のレベルが解放されます
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {categories.map((category) => (
            <div key={category.id} className="space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/practice/free?category=${category.id}`}
                    className="font-medium hover:underline underline-offset-4"
                  >
                    {category.name}
                  </Link>
                  <div className="flex gap-1" aria-label={`Level ${category.unlockedLevel} まで解放済み`}>
                    {[1, 2, 3].map((level) => (
                      <Badge
                        key={level}
                        variant={level <= category.unlockedLevel ? "default" : "outline"}
                        className="h-5 text-xs gap-0.5"
                      >
                        {level > category.unlockedLevel && <Lock className="h-2.5 w-2.5" aria-hidden />}
                        Lv.{level}
                      </Badge>
                    ))}
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {category.solved}/{category.totalProblems}問・正答率 {formatPercent(category.accuracy)}
                </span>
              </div>
              <Progress value={category.mastery} className="h-2" aria-label={`${category.name}の習熟度`} />
              <div className="flex justify-between text-xs text-muted-foreground gap-2">
                <span>{category.mastery}% 習熟</span>
                <span className="text-right">
                  {category.nextLevel
                    ? `Lv.${category.nextLevel.level} 解放まで ${category.nextLevel.progress}%（${category.nextLevel.correct}/${category.nextLevel.requiredClears}回クリア）`
                    : "全レベル解放済み"}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Weakness Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" aria-hidden />
            弱点分析
          </CardTitle>
          <CardDescription>正答率が低いカテゴリ・問題、時間がかかっている問題、苦手な型パターン</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!hasWeakness && weakness.weakTags.length === 0 && (
            <p className="text-sm text-muted-foreground">
              今のところ目立った弱点はありません。問題を解くほど分析の精度が上がります。
            </p>
          )}

          {weakness.weakCategories.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold">正答率が低いカテゴリ</h3>
              {weakness.weakCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-red-500/5 border border-red-500/20"
                >
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" aria-hidden />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-muted-foreground">{category.attempts}回提出</p>
                  </div>
                  <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 flex-shrink-0">
                    正答率 {formatPercent(category.accuracy)}
                  </Badge>
                </div>
              ))}
            </section>
          )}

          {weakness.weakProblems.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-sm font-semibold">つまずいている問題</h3>
              <ul className="space-y-2">
                {weakness.weakProblems.map((problem) => (
                  <li key={problem.id}>
                    <Link
                      href={`/practice/${problem.id}`}
                      className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm truncate">{problem.promptJa}</p>
                        <p className="text-xs text-muted-foreground">
                          {categoryName(problem.category)} Lv.{problem.level}・{problem.attempts}回提出
                        </p>
                      </div>
                      <Badge variant="outline">{formatPercent(problem.accuracy)}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {weakness.slowProblems.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-1">
                <Turtle className="h-4 w-4" aria-hidden />
                平均回答時間が長い問題（あなたの平均 {formatDuration(weakness.userAverageTime)}）
              </h3>
              <ul className="space-y-2">
                {weakness.slowProblems.map((problem) => (
                  <li key={problem.id}>
                    <Link
                      href={`/practice/${problem.id}`}
                      className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm truncate">{problem.promptJa}</p>
                        <p className="text-xs text-muted-foreground">
                          {categoryName(problem.category)} Lv.{problem.level}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {formatDuration(problem.averageTime)}（{problem.ratio.toFixed(1)}倍）
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {weakness.weakTags.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-1">
                <Lightbulb className="h-4 w-4 text-amber-500" aria-hidden />
                苦手な型パターン
              </h3>
              <div className="flex flex-wrap gap-2">
                {weakness.weakTags.map((tag) => (
                  <Badge key={tag.tag} variant="outline" className="gap-1">
                    <Tag className="h-3 w-3" aria-hidden />
                    {tag.tag}（{formatPercent(tag.accuracy)}）
                  </Badge>
                ))}
              </div>
              {weakness.recommendations.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">おすすめの練習問題</p>
                  <ul className="space-y-2">
                    {weakness.recommendations.map((problem) => (
                      <li key={problem.id}>
                        <Link
                          href={`/practice/${problem.id}`}
                          className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 hover:bg-amber-500/10"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm truncate">{problem.promptJa}</p>
                            <p className="text-xs text-muted-foreground">
                              {categoryName(problem.category)} Lv.{problem.level}・{problem.tags.join(", ")}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}
        </CardContent>
      </Card>

      {/* Badges */}
      <Card id="badges">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" aria-hidden />
            バッジ
          </CardTitle>
          <CardDescription>{stats.badges.length}個獲得済み</CardDescription>
        </CardHeader>
        <CardContent>
          <BadgeList earned={stats.badges} />
        </CardContent>
      </Card>
    </div>
  );
}
