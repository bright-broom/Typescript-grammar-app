import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  Flame,
  Star,
  BarChart3,
  Calendar,
  Target,
  ArrowRight,
  Zap,
  BookOpen,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userName = session?.user?.name || "ゲスト";

  // TODO: 実際のデータを取得
  const mockStats = {
    todayProblems: 3,
    todayGoal: 10,
    streak: 5,
    totalXp: 1250,
    level: 4,
    weeklyProgress: 65,
  };

  const categories = [
    { name: "基本型", progress: 80, level: 2 },
    { name: "配列・タプル", progress: 60, level: 1 },
    { name: "オブジェクト型", progress: 40, level: 1 },
    { name: "Union/Intersection", progress: 20, level: 1 },
    { name: "関数型", progress: 0, level: 1 },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            おかえりなさい、{userName}さん
          </h1>
          <p className="text-muted-foreground">
            今日も一緒にTypeScriptを学びましょう
          </p>
        </div>
        <Link href="/practice/daily">
          <Button size="lg" className="gap-2 w-full sm:w-auto">
            <Zap className="h-4 w-4" />
            今日の学習を始める
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日の進捗</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <ClipboardList className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockStats.todayProblems} / {mockStats.todayGoal}
            </div>
            <Progress
              value={(mockStats.todayProblems / mockStats.todayGoal) * 100}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              あと{mockStats.todayGoal - mockStats.todayProblems}問で目標達成
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">連続学習</CardTitle>
            <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
              <Flame className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.streak}日</div>
            <p className="text-xs text-muted-foreground mt-2">
              {mockStats.streak >= 7 ? "すごい！継続は力なり" : "この調子で続けましょう！"}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">レベル</CardTitle>
            <div className="h-8 w-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Star className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Lv. {mockStats.level}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {mockStats.totalXp.toLocaleString()} XP
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今週の進捗</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.weeklyProgress}%</div>
            <Progress value={mockStats.weeklyProgress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              学習モード
            </CardTitle>
            <CardDescription>今日の学習を始めましょう</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/practice/daily" className="block">
              <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">デイリーチャレンジ</p>
                  <p className="text-sm text-muted-foreground">復習7問 + 新規3問</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
            <Link href="/practice/free" className="block">
              <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">フリープラクティス</p>
                  <p className="text-sm text-muted-foreground">好きなカテゴリを練習</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              カテゴリ別進捗
            </CardTitle>
            <CardDescription>各カテゴリの習熟度</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categories.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{category.name}</span>
                  <Badge variant="outline" className="text-xs">
                    Lv.{category.level} - {category.progress}%
                  </Badge>
                </div>
                <Progress value={category.progress} className="h-2" />
              </div>
            ))}
            <Link href="/progress">
              <Button variant="ghost" className="w-full mt-2 gap-2">
                すべてのカテゴリを見る
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            最近の学習
          </CardTitle>
          <CardDescription>直近で取り組んだ問題</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">
              学習履歴がありません
            </p>
            <Link href="/practice/daily">
              <Button variant="outline" className="gap-2">
                <Zap className="h-4 w-4" />
                今日の学習を始める
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
