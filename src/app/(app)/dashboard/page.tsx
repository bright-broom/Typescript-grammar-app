import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SignInPrompt } from "@/components/sign-in-prompt";
import { categoryName } from "@/components/problem-badges";
import { getOrCreateDailySet } from "@/lib/server/daily";
import { getCategoryProgress, getRecentResponses, getUserStats } from "@/lib/server/stats";
import { getCurrentUserId } from "@/lib/server/user";
import { formatDuration, formatPercent } from "@/lib/format";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  Eye,
  Flame,
  Star,
  Target,
  XCircle,
  Zap,
} from "lucide-react";

export default async function DashboardPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1>
        <SignInPrompt
          title="サインインすると学習の記録が残ります"
          description="デイリーチャレンジ、連続学習日数、XP・バッジ、カテゴリ別の進捗はサインイン後に利用できます。"
        />
      </div>
    );
  }

  const [stats, categories, recent, { dailySet }] = await Promise.all([
    getUserStats(userId),
    getCategoryProgress(userId),
    getRecentResponses(userId, 5),
    getOrCreateDailySet(userId),
  ]);

  const goalPercent = Math.min(100, (stats.today.solved / Math.max(stats.today.goal, 1)) * 100);
  const remaining = Math.max(0, stats.today.goal - stats.today.solved);
  const reviewCount = dailySet.reviewIds.length;
  const newCount = dailySet.problemIds.length - reviewCount;
  const topCategories = [...categories]
    .sort((a, b) => b.attempts - a.attempts || a.name.localeCompare(b.name))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">おかえりなさい、{stats.name ?? "ゲスト"}さん</h1>
          <p className="text-muted-foreground">
            {stats.studiedToday ? "今日も学習できています。この調子！" : "今日も一緒にTypeScriptを学びましょう"}
          </p>
        </div>
        <Link href="/practice/daily" className={buttonVariants({ size: "lg", className: "gap-2 w-full sm:w-auto" })}>
          <Zap className="h-4 w-4" aria-hidden />
          今日の学習を始める
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日の進捗</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <ClipboardList className="h-4 w-4 text-blue-500" aria-hidden />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.today.solved} / {stats.today.goal}
            </div>
            <Progress value={goalPercent} className="mt-2" aria-label="今日の目標の達成率" />
            <p className="text-xs text-muted-foreground mt-2">
              {remaining > 0 ? `あと${remaining}問で目標達成` : "今日の目標達成！🎉"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">連続学習</CardTitle>
            <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
              <Flame className="h-4 w-4 text-orange-500" aria-hidden />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.streak}日</div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.streak === 0
                ? "今日から連続記録を始めましょう"
                : !stats.studiedToday
                  ? "今日解くと記録が伸びます！"
                  : stats.streak >= 7
                    ? "すごい！継続は力なり"
                    : "この調子で続けましょう！"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">レベル</CardTitle>
            <div className="h-8 w-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Star className="h-4 w-4 text-yellow-500" aria-hidden />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Lv. {stats.level.level}</div>
            <Progress value={stats.level.percent} className="mt-2" aria-label="次のレベルまでの進捗" />
            <p className="text-xs text-muted-foreground mt-2">
              {stats.xp.toLocaleString()} XP（次まで {stats.level.required - stats.level.current} XP）
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日の正答率・学習時間</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-green-500" aria-hidden />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercent(stats.today.accuracy)}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.today.attempts}回提出・{formatDuration(stats.today.studySeconds)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" aria-hidden />
              学習モード
            </CardTitle>
            <CardDescription>今日の学習を始めましょう</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/practice/daily"
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
            >
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-500" aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">デイリーチャレンジ</p>
                <p className="text-sm text-muted-foreground">
                  {dailySet.problemIds.length > 0
                    ? `復習${reviewCount}問 + 新規${newCount}問`
                    : "今日の出題はありません"}
                  {stats.dueCount > 0 && `（復習期限 ${stats.dueCount}問）`}
                </p>
              </div>
              <ArrowRight
                className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform"
                aria-hidden
              />
            </Link>
            <Link
              href="/practice/free"
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
            >
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-purple-500" aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">フリープラクティス</p>
                <p className="text-sm text-muted-foreground">好きなカテゴリ・レベルを練習</p>
              </div>
              <ArrowRight
                className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform"
                aria-hidden
              />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" aria-hidden />
              カテゴリ別進捗
            </CardTitle>
            <CardDescription>取り組みの多いカテゴリの習熟度</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topCategories.map((category) => (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{category.name}</span>
                  <Badge variant="outline" className="text-xs">
                    Lv.{category.unlockedLevel} - {category.mastery}%
                  </Badge>
                </div>
                <Progress value={category.mastery} className="h-2" aria-label={`${category.name}の習熟度`} />
              </div>
            ))}
            <Link href="/progress" className={buttonVariants({ variant: "ghost", className: "w-full mt-2 gap-2" })}>
              すべてのカテゴリを見る
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" aria-hidden />
              最近の学習
            </CardTitle>
            <CardDescription>直近で取り組んだ問題</CardDescription>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground mb-4">学習履歴がありません</p>
                <Link href="/practice/daily" className={buttonVariants({ variant: "outline", className: "gap-2" })}>
                  <Zap className="h-4 w-4" aria-hidden />
                  今日の学習を始める
                </Link>
              </div>
            ) : (
              <ul className="space-y-2">
                {recent.map((response) => (
                  <li key={response.id}>
                    <Link
                      href={`/practice/${response.problem.id}`}
                      className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors"
                    >
                      {response.wasCorrect ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" aria-label="正解" />
                      ) : response.gaveUp ? (
                        <Eye className="h-4 w-4 text-purple-500 flex-shrink-0" aria-label="模範解答を表示" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive flex-shrink-0" aria-label="不正解" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm truncate">{response.problem.promptJa}</p>
                        <p className="text-xs text-muted-foreground">
                          {categoryName(response.problem.category)} Lv.{response.problem.level}・
                          {formatDuration(response.timeSpent)}
                          {response.xpEarned > 0 && `・+${response.xpEarned} XP`}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" aria-hidden />
              最近獲得したバッジ
            </CardTitle>
            <CardDescription>{stats.badges.length}個のバッジを獲得</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.badges.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                まだバッジはありません。最初の1問に正解して「はじめの一歩」を獲得しましょう！
              </p>
            ) : (
              <ul className="space-y-2">
                {stats.badges.slice(0, 4).map((badge) => (
                  <li key={badge.id} className="flex items-center gap-3 rounded-lg border p-2">
                    <span className="text-2xl" aria-hidden>
                      {badge.icon}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{badge.name}</p>
                      <p className="text-xs text-muted-foreground">{badge.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/progress#badges"
              className={buttonVariants({ variant: "ghost", className: "w-full mt-2 gap-2" })}
            >
              すべてのバッジを見る
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
