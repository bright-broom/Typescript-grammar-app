import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  RefreshCcw,
  TrendingUp,
  Zap,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const features = [
  {
    title: "フラッシュトランスレーション",
    description: "日本語の型説明から即座にTypeScriptコードをタイピング。実践的なアウトプット重視の学習。",
    icon: Target,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "スパイラル学習",
    description: "忘却曲線に基づく間隔反復システム(SRS)で、効率的に記憶を定着。",
    icon: RefreshCcw,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    title: "段階的カリキュラム",
    description: "基礎から応用まで、10カテゴリ×3レベルで体系的に学習。",
    icon: TrendingUp,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    title: "リアルタイム型チェック",
    description: "Monaco Editor搭載。VSCode同等の補完と型チェックでコーディング体験を提供。",
    icon: Zap,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
];

const categories = [
  "基本型", "配列・タプル", "オブジェクト型", "Union/Intersection",
  "関数型", "ジェネリクス", "ユーティリティ型", "条件型",
  "Mapped Types", "型パズル",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10" />
        <div className="container relative py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4 gap-1">
              <Sparkles className="h-3 w-3" />
              TypeScript文法マスター
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              TS Grammar Dojo
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              アクエスメソッドを応用した、新しいTypeScript学習体験。
              <br />
              日本語の説明からTypeScriptコードを即座に書く
              「フラッシュトランスレーション」と
              <br />
              忘却曲線に基づく「スパイラル学習」で、型システムを体に染み込ませよう。
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/signin">
                <Button size="lg" className="px-8 gap-2 w-full sm:w-auto">
                  学習を始める
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/practice/free">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  お試しで解いてみる
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              アクエスメソッド × TypeScript
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              英会話スクールで実証された学習メソッドを
              TypeScript文法学習に応用
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="grid gap-6 md:grid-cols-2">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="bg-card/50 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className={`h-12 w-12 rounded-lg ${feature.bg} flex items-center justify-center mb-3`}>
                        <Icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 sm:py-32 bg-muted/50">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              10カテゴリの体系的カリキュラム
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              各カテゴリをLevel 1→2→3とスパイラル的に深掘り
            </p>
          </div>
          <div className="mx-auto mt-12 flex flex-wrap justify-center gap-3 max-w-3xl">
            {categories.map((category) => (
              <Badge key={category} variant="outline" className="text-sm py-2 px-4 hover:bg-primary/10 transition-colors">
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              今日から始めよう
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              毎日少しずつ、TypeScriptの型システムをマスターしていこう。
              デイリーチャレンジで習慣化。
            </p>
            <div className="mt-10">
              <Link href="/auth/signin">
                <Button size="lg" className="px-8 gap-2">
                  無料で始める
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>TS Grammar Dojo - TypeScript文法マスター</p>
        </div>
      </footer>
    </div>
  );
}
