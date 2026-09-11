import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/constants";
import { addDaysToKey, startOfDateKey, startOfWeek, toDateKey } from "@/lib/dates";
import { effectiveStreak, getBadge, levelProgress } from "@/lib/gamification";
import { LEVEL_UP_ACCURACY, LEVEL_UP_CLEARS, MAX_LEVEL, calculateUnlockedLevel, levelUpProgress } from "@/lib/srs";
import { getCategoryLevelStats } from "./levels";
import { getDayContext, getSettings } from "./user";

const DAY_MS = 24 * 60 * 60 * 1000;

function ratio(numerator: number, denominator: number): number | null {
  return denominator > 0 ? numerator / denominator : null;
}

/** ダッシュボード・ヘッダー用のユーザー統計 */
export async function getUserStats(userId: string) {
  const settings = await getSettings(userId);
  const day = getDayContext(settings.timezone);

  const [user, todayResponses, badges, dueCount] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { name: true, image: true, xp: true, streak: true, lastActiveAt: true, createdAt: true },
    }),
    prisma.response.findMany({
      where: { userId, createdAt: { gte: day.startOfToday } },
      select: { problemId: true, wasCorrect: true, gaveUp: true, timeSpent: true },
    }),
    prisma.userBadge.findMany({ where: { userId }, orderBy: { earnedAt: "desc" } }),
    prisma.sRSCard.count({ where: { userId, nextReviewDate: { lt: day.startOfTomorrow } } }),
  ]);

  const submissions = todayResponses.filter((r) => !r.gaveUp);
  const solvedToday = new Set(todayResponses.filter((r) => r.wasCorrect).map((r) => r.problemId));
  const lastActiveKey = user.lastActiveAt ? toDateKey(user.lastActiveAt, day.timezone) : null;

  return {
    name: user.name,
    image: user.image,
    startedAt: user.createdAt,
    timezone: day.timezone,
    today: {
      solved: solvedToday.size,
      goal: settings.dailyGoal,
      attempts: submissions.length,
      accuracy: ratio(submissions.filter((r) => r.wasCorrect).length, submissions.length),
      studySeconds: todayResponses.reduce((sum, r) => sum + r.timeSpent, 0),
    },
    streak: effectiveStreak(user.streak, lastActiveKey, day.todayKey),
    studiedToday: lastActiveKey === day.todayKey,
    xp: user.xp,
    level: levelProgress(user.xp),
    dueCount,
    badges: badges.flatMap((badge) => {
      const definition = getBadge(badge.badgeId);
      return definition
        ? [
            {
              id: definition.id,
              name: definition.name,
              description: definition.description,
              icon: definition.icon,
              earnedAt: badge.earnedAt,
            },
          ]
        : [];
    }),
  };
}

export type UserStats = Awaited<ReturnType<typeof getUserStats>>;

/** カテゴリ別の進捗（解放レベル、正解済み問題数、習熟度） */
export async function getCategoryProgress(userId: string | null) {
  const [levelStats, totals, solvedRows] = await Promise.all([
    userId ? getCategoryLevelStats(userId) : Promise.resolve({}),
    prisma.problem.groupBy({ by: ["category", "level"], _count: true }),
    userId
      ? prisma.$queryRaw<{ category: string; solved: number }[]>`
          SELECT p.category, COUNT(DISTINCT r.problem_id)::int AS solved
          FROM responses r JOIN problems p ON p.id = r.problem_id
          WHERE r.user_id = ${userId} AND r.was_correct
          GROUP BY p.category
        `
      : Promise.resolve([]),
  ]);

  return CATEGORIES.map((category) => {
    const stats = (levelStats as Awaited<ReturnType<typeof getCategoryLevelStats>>)[category.id] ?? {};
    const unlockedLevel = calculateUnlockedLevel(stats);
    const totalProblems = totals.filter((t) => t.category === category.id).reduce((sum, t) => sum + t._count, 0);
    const solved = solvedRows.find((row) => row.category === category.id)?.solved ?? 0;
    const attempts = Object.values(stats).reduce((sum, s) => sum + (s?.total ?? 0), 0);
    const correct = Object.values(stats).reduce((sum, s) => sum + (s?.correct ?? 0), 0);

    return {
      id: category.id,
      name: category.name,
      nameEn: category.nameEn,
      unlockedLevel,
      totalProblems,
      problemsByLevel: Object.fromEntries(
        totals.filter((t) => t.category === category.id).map((t) => [t.level, t._count])
      ) as Record<number, number>,
      solved,
      mastery: totalProblems > 0 ? Math.round((solved / totalProblems) * 100) : 0,
      attempts,
      accuracy: ratio(correct, attempts),
      nextLevel:
        unlockedLevel < MAX_LEVEL
          ? {
              level: unlockedLevel + 1,
              progress: Math.round(levelUpProgress(stats[unlockedLevel]) * 100),
              correct: stats[unlockedLevel]?.correct ?? 0,
              total: stats[unlockedLevel]?.total ?? 0,
              requiredClears: LEVEL_UP_CLEARS,
              requiredAccuracy: LEVEL_UP_ACCURACY,
            }
          : null,
    };
  });
}

export type CategoryProgress = Awaited<ReturnType<typeof getCategoryProgress>>[number];

/** GitHub風の学習カレンダー（直近 days 日の日別回答数） */
export async function getHeatmap(userId: string, days = 365) {
  const settings = await getSettings(userId);
  const day = getDayContext(settings.timezone);
  const firstKey = addDaysToKey(day.todayKey, -(days - 1));
  const responses = await prisma.response.findMany({
    where: { userId, gaveUp: false, createdAt: { gte: startOfDateKey(firstKey, day.timezone) } },
    select: { createdAt: true },
  });

  const counts = new Map<string, number>();
  for (const response of responses) {
    const key = toDateKey(response.createdAt, day.timezone);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from({ length: days }, (_, i) => {
    const date = addDaysToKey(firstKey, i);
    return { date, count: counts.get(date) ?? 0 };
  });
}

/** 今週と先週のサマリー */
export async function getProgressSummary(userId: string) {
  const settings = await getSettings(userId);
  const day = getDayContext(settings.timezone);
  const thisWeekStart = startOfWeek(day.now, day.timezone);
  const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * DAY_MS);

  const [allTime, solved, thisWeek, lastWeek] = await Promise.all([
    prisma.response.aggregate({ where: { userId, gaveUp: false }, _count: true, _avg: { timeSpent: true } }),
    prisma.response.findMany({
      where: { userId, wasCorrect: true },
      distinct: ["problemId"],
      select: { problemId: true },
    }),
    prisma.response.findMany({
      where: { userId, gaveUp: false, createdAt: { gte: thisWeekStart } },
      select: { wasCorrect: true, timeSpent: true },
    }),
    prisma.response.findMany({
      where: { userId, gaveUp: false, createdAt: { gte: lastWeekStart, lt: thisWeekStart } },
      select: { wasCorrect: true, timeSpent: true },
    }),
  ]);
  const allCorrect = await prisma.response.count({ where: { userId, gaveUp: false, wasCorrect: true } });

  const summarize = (rows: { wasCorrect: boolean; timeSpent: number }[]) => ({
    attempts: rows.length,
    accuracy: ratio(rows.filter((r) => r.wasCorrect).length, rows.length),
    averageTime: rows.length > 0 ? rows.reduce((sum, r) => sum + r.timeSpent, 0) / rows.length : null,
  });

  return {
    totalAttempts: allTime._count,
    solvedProblems: solved.length,
    accuracy: ratio(allCorrect, allTime._count),
    averageTime: allTime._avg.timeSpent,
    thisWeek: summarize(thisWeek),
    lastWeek: summarize(lastWeek),
  };
}

/** 直近7日間の日別回答数 */
export async function getWeeklyActivity(userId: string) {
  const heatmap = await getHeatmap(userId, 7);
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  return heatmap.map(({ date, count }) => {
    const [y, m, d] = date.split("-").map(Number);
    return { date, count, label: weekdays[new Date(Date.UTC(y, m - 1, d)).getUTCDay()] };
  });
}

const MIN_ATTEMPTS_CATEGORY = 3;
const MIN_ATTEMPTS_PROBLEM = 2;
const MIN_ATTEMPTS_TAG = 3;
const WEAK_ACCURACY = 0.7;

/** 弱点分析: 正答率が低いカテゴリ・問題、時間がかかる問題、苦手な型パターン（タグ） */
export async function getWeakness(userId: string) {
  const [problemRows, globalTimes] = await Promise.all([
    prisma.$queryRaw<
      {
        problem_id: string;
        category: string;
        level: number;
        prompt_ja: string;
        tags: string[];
        attempts: number;
        correct: number;
        avg_time: number;
      }[]
    >`
      SELECT r.problem_id, p.category, p.level, p.prompt_ja, p.tags,
             COUNT(*)::int AS attempts,
             COUNT(*) FILTER (WHERE r.was_correct)::int AS correct,
             AVG(r.time_spent)::float AS avg_time
      FROM responses r JOIN problems p ON p.id = r.problem_id
      WHERE r.user_id = ${userId} AND r.gave_up = false
      GROUP BY r.problem_id, p.category, p.level, p.prompt_ja, p.tags
    `,
    prisma.$queryRaw<{ avg_time: number | null }[]>`
      SELECT AVG(time_spent)::float AS avg_time FROM responses WHERE user_id = ${userId} AND gave_up = false AND was_correct
    `,
  ]);

  const userAverageTime = globalTimes[0]?.avg_time ?? null;

  const categoryTotals = new Map<string, { attempts: number; correct: number }>();
  const tagTotals = new Map<string, { attempts: number; correct: number }>();
  for (const row of problemRows) {
    const c = categoryTotals.get(row.category) ?? { attempts: 0, correct: 0 };
    c.attempts += row.attempts;
    c.correct += row.correct;
    categoryTotals.set(row.category, c);
    for (const tag of row.tags) {
      const t = tagTotals.get(tag) ?? { attempts: 0, correct: 0 };
      t.attempts += row.attempts;
      t.correct += row.correct;
      tagTotals.set(tag, t);
    }
  }

  const weakCategories = CATEGORIES.flatMap((category) => {
    const totals = categoryTotals.get(category.id);
    if (!totals || totals.attempts < MIN_ATTEMPTS_CATEGORY) return [];
    const accuracy = totals.correct / totals.attempts;
    return accuracy < WEAK_ACCURACY
      ? [{ id: category.id, name: category.name, accuracy, attempts: totals.attempts }]
      : [];
  }).sort((a, b) => a.accuracy - b.accuracy);

  const weakProblems = problemRows
    .filter((row) => row.attempts >= MIN_ATTEMPTS_PROBLEM && row.correct / row.attempts < WEAK_ACCURACY)
    .map((row) => ({
      id: row.problem_id,
      category: row.category,
      level: row.level,
      promptJa: row.prompt_ja,
      accuracy: row.correct / row.attempts,
      attempts: row.attempts,
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5);

  const slowProblems =
    userAverageTime && userAverageTime > 0
      ? problemRows
          .filter((row) => row.avg_time >= userAverageTime * 1.5)
          .map((row) => ({
            id: row.problem_id,
            category: row.category,
            level: row.level,
            promptJa: row.prompt_ja,
            averageTime: row.avg_time,
            ratio: row.avg_time / userAverageTime,
          }))
          .sort((a, b) => b.ratio - a.ratio)
          .slice(0, 5)
      : [];

  const weakTags = [...tagTotals.entries()]
    .filter(([, totals]) => totals.attempts >= MIN_ATTEMPTS_TAG && totals.correct / totals.attempts < WEAK_ACCURACY)
    .map(([tag, totals]) => ({ tag, accuracy: totals.correct / totals.attempts, attempts: totals.attempts }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 6);

  // 苦手なタグを含み、まだ正解していない問題をおすすめする
  const solvedIds = new Set(problemRows.filter((row) => row.correct > 0).map((row) => row.problem_id));
  const recommendations =
    weakTags.length > 0
      ? (
          await prisma.problem.findMany({
            where: { tags: { hasSome: weakTags.map((t) => t.tag) } },
            select: { id: true, category: true, level: true, promptJa: true, tags: true },
            orderBy: [{ level: "asc" }, { id: "asc" }],
          })
        )
          .filter((problem) => !solvedIds.has(problem.id))
          .slice(0, 5)
      : [];

  return { userAverageTime, weakCategories, weakProblems, slowProblems, weakTags, recommendations };
}

export async function getRecentResponses(userId: string, take = 5) {
  return prisma.response.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      wasCorrect: true,
      gaveUp: true,
      xpEarned: true,
      timeSpent: true,
      createdAt: true,
      problem: { select: { id: true, category: true, level: true, promptJa: true } },
    },
  });
}
