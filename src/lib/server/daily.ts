import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/constants";
import { selectDailyProblems } from "@/lib/srs";
import { getUnlockedLevels } from "./levels";
import { getDayContext, getSettings } from "./user";

const categoryOrder = CATEGORIES.map((category) => category.id);

/**
 * 今日のデイリーセットを取得する（なければSRSで生成して保存する）。
 * 1日の途中で出題が変わらないよう、日付ごとに保存しておく。
 */
export async function getOrCreateDailySet(userId: string, now = new Date()) {
  const settings = await getSettings(userId);
  const day = getDayContext(settings.timezone, now);

  const existing = await prisma.dailySet.findUnique({
    where: { userId_date: { userId, date: day.todayKey } },
  });
  if (existing) return { dailySet: existing, settings, day };

  const [unlocked, cards, problems] = await Promise.all([
    getUnlockedLevels(userId),
    prisma.sRSCard.findMany({
      where: { userId },
      select: {
        problemId: true,
        interval: true,
        nextReviewDate: true,
        lastReviewDate: true,
        problem: { select: { category: true } },
      },
    }),
    prisma.problem.findMany({ select: { id: true, category: true, level: true } }),
  ]);

  const startedIds = new Set(cards.map((card) => card.problemId));
  const selection = selectDailyProblems({
    dailyGoal: settings.dailyGoal,
    cards: cards.map((card) => ({ ...card, category: card.problem.category })),
    newProblems: problems.filter(
      (problem) => !startedIds.has(problem.id) && problem.level <= (unlocked[problem.category] ?? 1)
    ),
    categoryOrder,
    now: day.now,
    startOfTomorrow: day.startOfTomorrow,
  });

  const dailySet = await prisma.dailySet.upsert({
    where: { userId_date: { userId, date: day.todayKey } },
    create: {
      userId,
      date: day.todayKey,
      problemIds: selection.problemIds,
      reviewIds: selection.reviewIds,
    },
    update: {},
  });

  return { dailySet, settings, day };
}

/** デイリーセットのうち、今日完了した（正解した or 模範解答を見た）問題 */
export async function getCompletedProblemIds(userId: string, problemIds: string[], startOfToday: Date) {
  if (problemIds.length === 0) return new Set<string>();
  const responses = await prisma.response.findMany({
    where: {
      userId,
      problemId: { in: problemIds },
      createdAt: { gte: startOfToday },
      OR: [{ wasCorrect: true }, { gaveUp: true }],
    },
    select: { problemId: true },
  });
  return new Set(responses.map((response) => response.problemId));
}

export async function getDailyChallenge(userId: string) {
  const { dailySet, settings, day } = await getOrCreateDailySet(userId);
  const [problems, completed] = await Promise.all([
    prisma.problem.findMany({
      where: { id: { in: dailySet.problemIds } },
      select: { id: true, category: true, level: true, difficulty: true, promptJa: true, tags: true },
    }),
    getCompletedProblemIds(userId, dailySet.problemIds, day.startOfToday),
  ]);

  const byId = new Map(problems.map((problem) => [problem.id, problem]));
  const reviewIds = new Set(dailySet.reviewIds);
  const items = dailySet.problemIds.flatMap((id) => {
    const problem = byId.get(id);
    return problem ? [{ ...problem, isReview: reviewIds.has(id), completed: completed.has(id) }] : [];
  });

  return {
    date: dailySet.date,
    dailyGoal: settings.dailyGoal,
    items,
    completedCount: items.filter((item) => item.completed).length,
    reviewCount: items.filter((item) => item.isReview).length,
    newCount: items.filter((item) => !item.isReview).length,
  };
}

/** ゲスト用のお試しセット（日替わりで Level 1 から選ぶ。進捗は保存しない） */
export async function getGuestDailyChallenge(now = new Date()) {
  const day = getDayContext(null, now);
  const problems = await prisma.problem.findMany({
    where: { level: 1 },
    select: { id: true, category: true, level: true, difficulty: true, promptJa: true, tags: true },
    orderBy: { id: "asc" },
  });
  const seed = Number(day.todayKey.replaceAll("-", ""));
  const byCategory = categoryOrder.map((category) => problems.filter((p) => p.category === category));
  const items = byCategory
    .filter((list) => list.length > 0)
    .map((list) => list[seed % list.length])
    .map((problem) => ({ ...problem, isReview: false, completed: false }));

  return {
    date: day.todayKey,
    dailyGoal: items.length,
    items,
    completedCount: 0,
    reviewCount: 0,
    newCount: items.length,
  };
}

/** デイリーセット内で、指定した問題の次の未完了問題 */
export async function getNextDailyProblemId(userId: string, currentProblemId: string) {
  const { dailySet, day } = await getOrCreateDailySet(userId);
  const index = dailySet.problemIds.indexOf(currentProblemId);
  if (index === -1) return null;
  const completed = await getCompletedProblemIds(userId, dailySet.problemIds, day.startOfToday);
  const ordered = [...dailySet.problemIds.slice(index + 1), ...dailySet.problemIds.slice(0, index)];
  return ordered.find((id) => !completed.has(id)) ?? null;
}
