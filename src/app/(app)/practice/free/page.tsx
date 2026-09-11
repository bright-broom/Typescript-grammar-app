import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DifficultyBadge } from "@/components/problem-badges";
import { CATEGORIES, LEVELS } from "@/lib/constants";
import { listProblems, type ProblemListItem } from "@/lib/server/problems";
import { getCurrentUserId } from "@/lib/server/user";
import { cn } from "@/lib/utils";
import { ArrowRight, BookmarkCheck, BookOpen, CheckCircle2, Code2, Lock, Tag } from "lucide-react";

interface Props {
  searchParams: Promise<{ category?: string; level?: string; view?: string }>;
}

const BOOKMARKS_VIEW = "bookmarks";

function buildHref(params: { category?: string; level?: number; view?: string }) {
  const search = new URLSearchParams();
  if (params.view) search.set("view", params.view);
  if (params.category) search.set("category", params.category);
  if (params.level) search.set("level", String(params.level));
  const query = search.toString();
  return query ? `/practice/free?${query}` : "/practice/free";
}

export default async function FreePracticePage({ searchParams }: Props) {
  const params = await searchParams;
  const userId = await getCurrentUserId();
  const isBookmarksView = params.view === BOOKMARKS_VIEW;
  const category =
    CATEGORIES.find((c) => c.id === params.category)?.id ?? (isBookmarksView ? undefined : CATEGORIES[0].id);
  const level = LEVELS.find((l) => String(l) === params.level);

  const allProblems = await listProblems(userId, { bookmarkedOnly: isBookmarksView });
  const countsByCategory = new Map<string, number>();
  for (const problem of allProblems) {
    countsByCategory.set(problem.category, (countsByCategory.get(problem.category) ?? 0) + 1);
  }
  const bookmarkCount = isBookmarksView ? allProblems.length : allProblems.filter((p) => p.bookmarked).length;

  const problems = allProblems.filter(
    (problem) => (!category || problem.category === category) && (!level || problem.level === level)
  );
  const categoryProblems = allProblems.filter((problem) => !category || problem.category === category);
  const unlockedLevel = Math.max(1, ...categoryProblems.filter((p) => !p.locked).map((p) => p.level));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <span className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-purple-500" aria-hidden />
          </span>
          フリープラクティス
        </h1>
        <p className="text-muted-foreground mt-2">
          カテゴリ・レベルを選んで自由に練習しましょう（SRSのスケジュール外の追加練習です）
        </p>
      </div>

      {/* Category tabs */}
      <nav aria-label="カテゴリ" className="overflow-x-auto pb-2 -mb-2">
        <ul className="inline-flex h-auto gap-1 p-1 rounded-lg bg-muted/50">
          {userId && (
            <li>
              <Link
                href={buildHref({ view: BOOKMARKS_VIEW })}
                aria-current={isBookmarksView ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md text-sm px-3 py-2 whitespace-nowrap transition-colors",
                  isBookmarksView
                    ? "bg-background shadow-sm font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <BookmarkCheck className="h-4 w-4 text-amber-500" aria-hidden />
                ブックマーク
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {bookmarkCount}
                </Badge>
              </Link>
            </li>
          )}
          {CATEGORIES.map((c) => {
            const active = !isBookmarksView && c.id === category;
            return (
              <li key={c.id}>
                <Link
                  href={buildHref({ category: c.id })}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center rounded-md text-sm px-3 py-2 whitespace-nowrap transition-colors",
                    active ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {c.name}
                  {!isBookmarksView && (
                    <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                      {countsByCategory.get(c.id) ?? 0}
                    </Badge>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Level filter */}
      {!isBookmarksView && (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="レベルで絞り込む">
          <span className="text-sm text-muted-foreground mr-1">レベル:</span>
          <Link
            href={buildHref({ category })}
            aria-current={!level ? "true" : undefined}
            className={buttonVariants({ size: "sm", variant: !level ? "default" : "outline" })}
          >
            すべて
          </Link>
          {LEVELS.map((l) => (
            <Link
              key={l}
              href={buildHref({ category, level: l })}
              aria-current={level === l ? "true" : undefined}
              className={buttonVariants({
                size: "sm",
                variant: level === l ? "default" : "outline",
                className: "gap-1",
              })}
            >
              {l > unlockedLevel && <Lock className="h-3 w-3" aria-label="未解放" />}
              Level {l}
            </Link>
          ))}
          <span className="text-xs text-muted-foreground ml-2">
            {userId
              ? "Level N を正答率80%以上で5回クリアすると次のレベルが解放されます"
              : "ゲストモードでは Level 1 のみ挑戦できます"}
          </span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {problems.map((problem) => (
          <ProblemCard key={problem.id} problem={problem} showCategory={isBookmarksView} />
        ))}

        {problems.length === 0 && (
          <div className="col-span-full">
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-muted-foreground" aria-hidden />
                </div>
                <p className="text-muted-foreground">
                  {isBookmarksView
                    ? "ブックマークした問題はありません。苦手な問題は問題画面からブックマークできます。"
                    : "条件に合う問題はまだありません"}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function ProblemCard({ problem, showCategory }: { problem: ProblemListItem; showCategory: boolean }) {
  const categoryInfo = CATEGORIES.find((c) => c.id === problem.category);

  return (
    <Card
      className={cn(
        "h-full flex flex-col transition-all",
        problem.locked ? "opacity-60" : "hover:border-primary/50 hover:shadow-md"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {showCategory && <Badge variant="outline">{categoryInfo?.name ?? problem.category}</Badge>}
          <Badge variant="outline" className="gap-1">
            <Code2 className="h-3 w-3" aria-hidden />
            Level {problem.level}
          </Badge>
          <DifficultyBadge difficulty={problem.difficulty} />
          {problem.solved && (
            <Badge className="gap-1 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
              <CheckCircle2 className="h-3 w-3" aria-hidden />
              正解済み
            </Badge>
          )}
          {problem.bookmarked && <BookmarkCheck className="h-4 w-4 text-amber-500" aria-label="ブックマーク済み" />}
        </div>
        <CardTitle className="text-base line-clamp-2 leading-snug">{problem.promptJa}</CardTitle>
      </CardHeader>
      <CardContent className="mt-auto">
        {problem.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {problem.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
              >
                <Tag className="h-2.5 w-2.5" aria-hidden />
                {tag}
              </span>
            ))}
            {problem.tags.length > 3 && (
              <span className="text-xs text-muted-foreground px-1">+{problem.tags.length - 3}</span>
            )}
          </div>
        )}
        {problem.locked ? (
          <span
            className={buttonVariants({
              size: "sm",
              variant: "outline",
              className: "w-full gap-2 pointer-events-none",
            })}
            aria-disabled
          >
            <Lock className="h-4 w-4" aria-hidden />
            未解放
          </span>
        ) : (
          <Link href={`/practice/${problem.id}`} className={buttonVariants({ size: "sm", className: "w-full gap-2" })}>
            {problem.solved ? "もう一度解く" : "解く"}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
