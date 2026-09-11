import { prisma } from "@/lib/prisma";
import type { Difficulty } from "@/lib/constants";
import { getUnlockedLevels } from "./levels";

export interface ProblemFilter {
  category?: string;
  level?: number;
  bookmarkedOnly?: boolean;
}

/** フリープラクティス用の問題一覧（解放状況・正解済み・ブックマークの状態付き） */
export async function listProblems(userId: string | null, filter: ProblemFilter = {}) {
  const [problems, unlocked, solved, bookmarks] = await Promise.all([
    prisma.problem.findMany({
      where: {
        category: filter.category,
        level: filter.level,
        ...(filter.bookmarkedOnly && userId ? { bookmarks: { some: { userId } } } : {}),
      },
      select: { id: true, category: true, level: true, difficulty: true, promptJa: true, tags: true },
      orderBy: [{ category: "asc" }, { level: "asc" }, { id: "asc" }],
    }),
    getUnlockedLevels(userId),
    userId
      ? prisma.response.findMany({
          where: { userId, wasCorrect: true },
          distinct: ["problemId"],
          select: { problemId: true },
        })
      : Promise.resolve([]),
    userId ? prisma.bookmark.findMany({ where: { userId }, select: { problemId: true } }) : Promise.resolve([]),
  ]);

  const solvedIds = new Set(solved.map((s) => s.problemId));
  const bookmarkedIds = new Set(bookmarks.map((b) => b.problemId));

  if (filter.bookmarkedOnly && !userId) return [];

  return problems.map((problem) => ({
    ...problem,
    difficulty: problem.difficulty as Difficulty,
    locked: problem.level > (unlocked[problem.category] ?? 1),
    solved: solvedIds.has(problem.id),
    bookmarked: bookmarkedIds.has(problem.id),
  }));
}

export type ProblemListItem = Awaited<ReturnType<typeof listProblems>>[number];

/** 問題画面用。模範解答と解説は含めない（正解時・ヒント消費後にAPIから返す） */
export async function getProblemForSolver(problemId: string, userId: string | null) {
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    select: {
      id: true,
      category: true,
      level: true,
      difficulty: true,
      promptJa: true,
      promptEn: true,
      starterCode: true,
      hints: true,
      tags: true,
      testCases: { select: { id: true, description: true, code: true, shouldPass: true } },
    },
  });
  if (!problem) return null;

  const [unlocked, bookmark] = await Promise.all([
    getUnlockedLevels(userId),
    userId ? prisma.bookmark.findUnique({ where: { userId_problemId: { userId, problemId } } }) : Promise.resolve(null),
  ]);

  const { hints, ...rest } = problem;
  return {
    ...rest,
    difficulty: problem.difficulty as Difficulty,
    hintCount: hints.length,
    locked: problem.level > (unlocked[problem.category] ?? 1),
    unlockedLevel: unlocked[problem.category] ?? 1,
    bookmarked: !!bookmark,
  };
}

export type SolverProblem = NonNullable<Awaited<ReturnType<typeof getProblemForSolver>>>;
