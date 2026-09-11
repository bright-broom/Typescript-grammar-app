import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import { categoryName } from "@/components/problem-badges";
import { getProblemForSolver } from "@/lib/server/problems";
import { getCurrentUserId } from "@/lib/server/user";
import { LEVEL_UP_ACCURACY, LEVEL_UP_CLEARS } from "@/lib/srs";
import { ProblemSolver } from "./problem-solver";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}

export default async function ProblemPage({ params, searchParams }: Props) {
  const [{ id }, { from }] = await Promise.all([params, searchParams]);
  const userId = await getCurrentUserId();
  const problem = await getProblemForSolver(id, userId);

  if (!problem) {
    notFound();
  }

  if (problem.locked) {
    return (
      <Card className="max-w-xl mx-auto border-dashed">
        <CardContent className="flex flex-col items-center text-center gap-4 py-12">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
            <Lock className="h-7 w-7 text-muted-foreground" aria-hidden />
          </div>
          <h1 className="text-xl font-semibold">
            {categoryName(problem.category)} Level {problem.level} はまだ解放されていません
          </h1>
          <p className="text-muted-foreground">
            Level {problem.unlockedLevel} の問題を正答率{LEVEL_UP_ACCURACY * 100}%以上で{LEVEL_UP_CLEARS}
            回以上クリアすると、次のレベルが解放されます。
            {!userId && "（ゲストモードでは Level 1 のみ挑戦できます）"}
          </p>
          <div className="flex gap-2">
            <Link
              href={`/practice/free?category=${problem.category}`}
              className={buttonVariants({ variant: "outline" })}
            >
              Level {problem.unlockedLevel} を練習する
            </Link>
            {!userId && (
              <Link href="/auth/signin" className={buttonVariants()}>
                サインイン
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <ProblemSolver key={problem.id} problem={problem} isGuest={!userId} from={from === "daily" ? "daily" : "free"} />
  );
}
