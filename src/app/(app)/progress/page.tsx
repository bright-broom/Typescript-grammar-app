import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CATEGORIES } from "@/lib/constants";
import {
  TrendingUp,
  BookOpen,
  CheckCircle2,
  Clock,
  Target,
  BarChart3,
  Calendar,
  AlertTriangle,
  Zap,
} from "lucide-react";

// TODO: 実際のデータを取得
const mockCategoryProgress = CATEGORIES.map((category, index) => ({
  ...category,
  level: Math.floor(Math.random() * 3) + 1,
  progress: Math.floor(Math.random() * 100),
  problemsSolved: Math.floor(Math.random() * 20),
  totalProblems: 20,
}));

const mockWeeklyActivity = [
  { day: "月", count: 5 },
  { day: "火", count: 8 },
  { day: "水", count: 3 },
  { day: "木", count: 10 },
  { day: "金", count: 7 },
  { day: "土", count: 2 },
  { day: "日", count: 0 },
];

const mockHeatmapData = Array.from({ length: 52 * 7 }, () =>
  Math.floor(Math.random() * 5)
);

export default function ProgressPage() {
  const maxActivity = Math.max(...mockWeeklyActivity.map((d) => d.count));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          進捗
        </h1>
        <p className="text-muted-foreground mt-2">
          あなたの学習進捗を確認しましょう
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                総学習問題数
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-blue-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">127</p>
            <p className="text-xs text-muted-foreground mt-1">
              +12 今週
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                習熟カテゴリ
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">3 <span className="text-lg text-muted-foreground">/ 10</span></p>
            <Progress value={30} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                平均正答率
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Target className="h-4 w-4 text-yellow-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">78%</p>
            <p className="text-xs text-green-500 mt-1">
              +5% 先週比
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                平均回答時間
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-purple-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">45<span className="text-lg text-muted-foreground">秒</span></p>
            <p className="text-xs text-green-500 mt-1">
              -8秒 改善
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            学習カレンダー
          </CardTitle>
          <CardDescription>過去1年間の学習履歴</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-[3px] flex-wrap min-w-[700px]">
              {mockHeatmapData.map((value, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-sm transition-colors ${
                    value === 0
                      ? "bg-muted"
                      : value === 1
                        ? "bg-green-200 dark:bg-green-900"
                        : value === 2
                          ? "bg-green-300 dark:bg-green-800"
                          : value === 3
                            ? "bg-green-400 dark:bg-green-700"
                            : "bg-green-500 dark:bg-green-600"
                  }`}
                  title={`${value}問解答`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-muted" />
              <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900" />
              <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-800" />
              <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700" />
              <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-600" />
            </div>
            <span>More</span>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            今週の活動
          </CardTitle>
          <CardDescription>日別の学習問題数</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-40 gap-2">
            {mockWeeklyActivity.map((day) => {
              const height = maxActivity > 0 ? (day.count / maxActivity) * 100 : 0;
              const isToday = day.day === "日"; // Example: Sunday is today

              return (
                <div key={day.day} className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-xs text-muted-foreground mb-1">
                    {day.count}
                  </span>
                  <div
                    className={`w-full max-w-[40px] rounded-t transition-all ${
                      isToday
                        ? "bg-gradient-to-t from-blue-500 to-blue-400"
                        : "bg-gradient-to-t from-primary/80 to-primary/60"
                    }`}
                    style={{
                      height: `${Math.max(height, 4)}%`,
                    }}
                  />
                  <span className={`text-xs ${isToday ? "font-bold text-blue-500" : "text-muted-foreground"}`}>
                    {day.day}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Category Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            カテゴリ別進捗
          </CardTitle>
          <CardDescription>各カテゴリの習熟度</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {mockCategoryProgress.map((category) => (
            <div key={category.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{category.name}</span>
                  <Badge variant="outline" className="h-5 text-xs">
                    Lv.{category.level}
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">
                  {category.problemsSolved}/{category.totalProblems}問
                </span>
              </div>
              <div className="relative">
                <Progress value={category.progress} className="h-2" />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{category.progress}% 習熟</span>
                <span className="text-right opacity-60">{category.nameEn}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Weakness Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            弱点分析
          </CardTitle>
          <CardDescription>正答率が低いカテゴリ・問題</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-red-500/5 border border-red-500/20">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">条件型</p>
                <p className="text-sm text-muted-foreground">
                  特にinferの使い方に課題があります
                </p>
              </div>
              <Badge className="bg-red-500/10 text-red-500 border-red-500/20 flex-shrink-0">
                正答率 45%
              </Badge>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                <Zap className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">Mapped Types</p>
                <p className="text-sm text-muted-foreground">
                  キーリマッピングの理解を深めましょう
                </p>
              </div>
              <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 flex-shrink-0">
                正答率 62%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
