import { prisma } from "@/lib/prisma";
import { CATEGORIES, type Difficulty } from "@/lib/constants";
import { calculateXP, findNewBadges, levelFromXP, updateStreak, type BadgeDefinition } from "@/lib/gamification";
import {
  INITIAL_EASE_FACTOR,
  MASTERED_CATEGORY_INTERVAL_MODIFIER,
  MAX_LEVEL,
  calculateQuality,
  calculateSRS,
  type Quality,
} from "@/lib/srs";
import { toDateKey } from "@/lib/dates";
import { runTestCases, type TestCaseResult } from "@/lib/typecheck";
import { getCategoryLevelStats, getUnlockedLevels, unlockedLevelsFromStats } from "./levels";
import { getDayContext, getSettings, type DayContext } from "./user";

/** 同じ問題の平均回答時間を使う最低サンプル数 */
const MIN_SAMPLES_FOR_AVERAGE = 3;

export interface SubmissionInput {
  userId: string | null;
  problemId: string;
  code: string;
  timeSpent: number;
  hintsUsed: number;
}

export interface LevelUnlock {
  category: string;
  categoryName: string;
  level: number;
}

export interface SubmissionResult {
  correct: boolean;
  results: TestCaseResult[];
  /** 正解時のみ */
  explanation?: string;
  expectedAnswer?: string;
  saved: boolean;
  xpEarned: number;
  quality?: Quality;
  totalXp?: number;
  userLevel?: number;
  userLeveledUp?: boolean;
  streak?: number;
  newBadges: Pick<BadgeDefinition, "id" | "name" | "description" | "icon">[];
  levelUnlocks: LevelUnlock[];
}

export class ProblemNotFoundError extends Error {}

/** 未解放レベルの問題（ゲストは Level 1 のみ） */
export class ProblemLockedError extends Error {}

async function getAverageTime(problemId: string, userId: string): Promise<number | undefined> {
  const problemAverage = await prisma.response.aggregate({
    where: { problemId, wasCorrect: true },
    _avg: { timeSpent: true },
    _count: true,
  });
  if (problemAverage._count >= MIN_SAMPLES_FOR_AVERAGE && problemAverage._avg.timeSpent) {
    return problemAverage._avg.timeSpent;
  }
  const userAverage = await prisma.response.aggregate({
    where: { userId, wasCorrect: true },
    _avg: { timeSpent: true },
    _count: true,
  });
  if (userAverage._count >= MIN_SAMPLES_FOR_AVERAGE && userAverage._avg.timeSpent) {
    return userAverage._avg.timeSpent;
  }
  return undefined;
}

interface AttemptInput {
  userId: string;
  problem: { id: string; category: string; level: number; difficulty: string };
  code: string;
  timeSpent: number;
  hintsUsed: number;
  wasCorrect: boolean;
  gaveUp: boolean;
}

/**
 * 回答（または諦め）を記録し、SRS・XP・ストリーク・バッジ・レベル解放を更新する。
 * SRS カードの更新は、その問題に対するその日最初の回答だけで行う（SM-2 の想起は1日1回）。
 */
async function recordAttempt(input: AttemptInput) {
  const { userId, problem, code, timeSpent, hintsUsed, wasCorrect, gaveUp } = input;
  const settings = await getSettings(userId);
  const day = getDayContext(settings.timezone);

  const [user, todaysResponses, statsBefore, averageTime, card] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { xp: true, streak: true, lastActiveAt: true } }),
    prisma.response.findMany({
      where: { userId, problemId: problem.id, createdAt: { gte: day.startOfToday } },
      select: { wasCorrect: true },
    }),
    getCategoryLevelStats(userId),
    getAverageTime(problem.id, userId),
    prisma.sRSCard.findUnique({ where: { userId_problemId: { userId, problemId: problem.id } } }),
  ]);
  const unlockedBefore = unlockedLevelsFromStats(statsBefore);

  const baseQuality = gaveUp
    ? hintsUsed > 0
      ? 0
      : 1
    : calculateQuality(wasCorrect, timeSpent, hintsUsed, averageTime);
  const srs = calculateSRS(
    card ?? { easeFactor: INITIAL_EASE_FACTOR, interval: 0, repetitions: 0 },
    { quality: baseQuality, timeSpent, averageTime },
    {
      startOfToday: day.startOfToday,
      intervalModifier: unlockedBefore[problem.category] >= MAX_LEVEL ? MASTERED_CATEGORY_INTERVAL_MODIFIER : undefined,
    }
  );

  const isFirstAttemptToday = todaysResponses.length === 0;
  const alreadySolvedToday = todaysResponses.some((response) => response.wasCorrect);
  const lastActiveKey = user.lastActiveAt ? toDateKey(user.lastActiveAt, day.timezone) : null;
  const streak = updateStreak(user.streak, lastActiveKey, day.todayKey);

  // 同じ問題を同じ日に何度解いてもXPは1回だけ
  const xpEarned =
    wasCorrect && !alreadySolvedToday ? calculateXP(problem.difficulty as Difficulty, srs.quality, streak) : 0;
  const totalXp = user.xp + xpEarned;
  const userLevel = levelFromXP(totalXp);

  await prisma.$transaction([
    prisma.response.create({
      data: {
        userId,
        problemId: problem.id,
        quality: srs.quality,
        timeSpent,
        wasCorrect,
        gaveUp,
        hintsUsed,
        xpEarned,
        userAnswer: code,
      },
    }),
    ...(isFirstAttemptToday
      ? [
          prisma.sRSCard.upsert({
            where: { userId_problemId: { userId, problemId: problem.id } },
            create: {
              userId,
              problemId: problem.id,
              easeFactor: srs.easeFactor,
              interval: srs.interval,
              repetitions: srs.repetitions,
              nextReviewDate: srs.nextReviewDate,
              lastReviewDate: day.now,
            },
            update: {
              easeFactor: srs.easeFactor,
              interval: srs.interval,
              repetitions: srs.repetitions,
              nextReviewDate: srs.nextReviewDate,
              lastReviewDate: day.now,
            },
          }),
        ]
      : []),
    prisma.user.update({
      where: { id: userId },
      data: { xp: totalXp, level: userLevel, streak, lastActiveAt: day.now },
    }),
  ]);

  const statsAfter = await getCategoryLevelStats(userId);
  const unlockedAfter = unlockedLevelsFromStats(statsAfter);
  const levelUnlocks: LevelUnlock[] = CATEGORIES.filter(
    (category) => unlockedAfter[category.id] > unlockedBefore[category.id]
  ).map((category) => ({ category: category.id, categoryName: category.name, level: unlockedAfter[category.id] }));

  const newBadges = await awardBadges(userId, { streak, userLevel, dailyGoal: settings.dailyGoal, day });

  return {
    quality: srs.quality,
    xpEarned,
    totalXp,
    userLevel,
    userLeveledUp: userLevel > levelFromXP(user.xp),
    streak,
    levelUnlocks,
    newBadges,
  };
}

async function awardBadges(
  userId: string,
  { streak, userLevel, dailyGoal, day }: { streak: number; userLevel: number; dailyGoal: number; day: DayContext }
) {
  const [earned, solvedRows, perfectAnswers, totals, solvedToday] = await Promise.all([
    prisma.userBadge.findMany({ where: { userId }, select: { badgeId: true } }),
    prisma.$queryRaw<{ category: string; solved: number }[]>`
      SELECT p.category, COUNT(DISTINCT r.problem_id)::int AS solved
      FROM responses r JOIN problems p ON p.id = r.problem_id
      WHERE r.user_id = ${userId} AND r.was_correct
      GROUP BY p.category
    `,
    prisma.response.count({ where: { userId, wasCorrect: true, quality: 5 } }),
    prisma.problem.groupBy({ by: ["category"], _count: true }),
    prisma.response.findMany({
      where: { userId, wasCorrect: true, createdAt: { gte: day.startOfToday } },
      distinct: ["problemId"],
      select: { problemId: true },
    }),
  ]);

  const categorySolved = Object.fromEntries(
    totals.map((row) => [
      row.category,
      { solved: solvedRows.find((s) => s.category === row.category)?.solved ?? 0, total: row._count },
    ])
  );

  const newBadges = findNewBadges(
    {
      streak,
      userLevel,
      solvedProblems: solvedRows.reduce((sum, row) => sum + row.solved, 0),
      perfectAnswers,
      dailyGoalsCompleted: solvedToday.length >= dailyGoal ? 1 : 0,
      categorySolved,
    },
    earned.map((badge) => badge.badgeId)
  );

  if (newBadges.length > 0) {
    await prisma.userBadge.createMany({
      data: newBadges.map((badge) => ({ userId, badgeId: badge.id })),
      skipDuplicates: true,
    });
  }

  return newBadges.map(({ id, name, description, icon }) => ({ id, name, description, icon }));
}

async function findUnlockedProblem(problemId: string, userId: string | null) {
  const [problem, unlocked] = await Promise.all([
    prisma.problem.findUnique({ where: { id: problemId }, include: { testCases: true } }),
    getUnlockedLevels(userId),
  ]);
  if (!problem) throw new ProblemNotFoundError(problemId);
  if (problem.level > (unlocked[problem.category] ?? 1)) throw new ProblemLockedError(problemId);
  return problem;
}

/** 回答を型チェックして判定し、ログイン中なら学習記録を更新する */
export async function submitAnswer(input: SubmissionInput): Promise<SubmissionResult> {
  const problem = await findUnlockedProblem(input.problemId, input.userId);
  const results = runTestCases(input.code, problem.testCases);
  const correct = results.length > 0 && results.every((result) => result.passed);
  const reveal = correct ? { explanation: problem.explanation, expectedAnswer: problem.expectedAnswer } : {};

  if (!input.userId) {
    return { correct, results, ...reveal, saved: false, xpEarned: 0, newBadges: [], levelUnlocks: [] };
  }

  const recorded = await recordAttempt({
    userId: input.userId,
    problem,
    code: input.code,
    timeSpent: input.timeSpent,
    hintsUsed: input.hintsUsed,
    wasCorrect: correct,
    gaveUp: false,
  });

  return { correct, results, ...reveal, saved: true, ...recorded };
}

export type HintResult =
  | { type: "hint"; index: number; total: number; hint: string }
  | { type: "answer"; total: number; expectedAnswer: string; explanation: string };

/**
 * ヒントを1つ返す。全ヒントを使い切ったら模範解答を返す。
 * ログイン中に回答を1度も提出せず模範解答を見た場合は「諦め」として記録する。
 */
export async function getHint(input: {
  userId: string | null;
  problemId: string;
  index: number;
  code: string;
  timeSpent: number;
}): Promise<HintResult> {
  const problem = await findUnlockedProblem(input.problemId, input.userId);
  const total = problem.hints.length;

  if (input.index < total) {
    return { type: "hint", index: input.index, total, hint: problem.hints[input.index] };
  }

  if (input.userId) {
    const settings = await getSettings(input.userId);
    const day = getDayContext(settings.timezone);
    const attemptedToday = await prisma.response.count({
      where: { userId: input.userId, problemId: problem.id, createdAt: { gte: day.startOfToday } },
    });
    if (attemptedToday === 0) {
      await recordAttempt({
        userId: input.userId,
        problem,
        code: input.code,
        timeSpent: input.timeSpent,
        hintsUsed: total,
        wasCorrect: false,
        gaveUp: true,
      });
    } else {
      // 提出済みならSRS・XPは更新せず、デイリーの「完了」扱いにするための記録だけ残す
      await prisma.response.create({
        data: {
          userId: input.userId,
          problemId: problem.id,
          quality: 0,
          timeSpent: input.timeSpent,
          wasCorrect: false,
          gaveUp: true,
          hintsUsed: total,
          userAnswer: input.code,
        },
      });
    }
  }

  return { type: "answer", total, expectedAnswer: problem.expectedAnswer, explanation: problem.explanation };
}
