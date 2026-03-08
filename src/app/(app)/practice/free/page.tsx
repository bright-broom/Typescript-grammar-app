import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORIES, DIFFICULTY_LABELS } from "@/lib/constants";
import {
  Code2,
  ArrowRight,
  BookOpen,
  Layers,
  Tag,
} from "lucide-react";

async function getProblems() {
  return prisma.problem.findMany({
    select: {
      id: true,
      category: true,
      level: true,
      difficulty: true,
      promptJa: true,
      tags: true,
    },
    orderBy: [{ category: "asc" }, { level: "asc" }],
  });
}

export default async function FreePracticePage() {
  const problems = await getProblems();

  // カテゴリごとにグループ化
  const problemsByCategory = problems.reduce(
    (acc, problem) => {
      if (!acc[problem.category]) {
        acc[problem.category] = [];
      }
      acc[problem.category].push(problem);
      return acc;
    },
    {} as Record<string, typeof problems>
  );

  const difficultyColors = {
    easy: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    medium: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    hard: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-purple-500" />
          </div>
          フリープラクティス
        </h1>
        <p className="text-muted-foreground mt-2">
          カテゴリ・レベルを選んで自由に練習しましょう
        </p>
      </div>

      <Tabs defaultValue={CATEGORIES[0].id} className="space-y-6">
        <div className="overflow-x-auto pb-2 -mb-2">
          <TabsList className="inline-flex h-auto gap-1 p-1 bg-muted/50">
            {CATEGORIES.map((category) => {
              const count = problemsByCategory[category.id]?.length || 0;
              return (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="text-sm px-3 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap"
                >
                  {category.name}
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                    {count}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {CATEGORIES.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Layers className="h-4 w-4" />
              <span>{category.name}</span>
              <span>・</span>
              <span>{problemsByCategory[category.id]?.length || 0} 問</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {problemsByCategory[category.id]?.map((problem) => (
                <Link key={problem.id} href={`/practice/${problem.id}`}>
                  <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="gap-1">
                          <Code2 className="h-3 w-3" />
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
                      <CardTitle className="text-base line-clamp-2 leading-snug">
                        {problem.promptJa}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {problem.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {problem.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                            >
                              <Tag className="h-2.5 w-2.5" />
                              {tag}
                            </span>
                          ))}
                          {problem.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground px-1">
                              +{problem.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      <Button
                        size="sm"
                        className="w-full gap-2 group-hover:gap-3 transition-all"
                      >
                        解く
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}

              {(!problemsByCategory[category.id] ||
                problemsByCategory[category.id].length === 0) && (
                <div className="col-span-full">
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <BookOpen className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">
                        このカテゴリにはまだ問題がありません
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
