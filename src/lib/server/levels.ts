import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/constants";
import { calculateUnlockedLevel, type LevelStats } from "@/lib/srs";

export type CategoryLevelStats = Record<string, Partial<Record<number, LevelStats>>>;

/** カテゴリ×レベルごとの回答数・正解数（提出した回答のみ。模範解答の表示は含まない） */
export async function getCategoryLevelStats(userId: string): Promise<CategoryLevelStats> {
  const rows = await prisma.$queryRaw<{ category: string; level: number; total: number; correct: number }[]>`
    SELECT p.category, p.level,
           COUNT(*)::int AS total,
           COUNT(*) FILTER (WHERE r.was_correct)::int AS correct
    FROM responses r
    JOIN problems p ON p.id = r.problem_id
    WHERE r.user_id = ${userId} AND r.gave_up = false
    GROUP BY p.category, p.level
  `;

  const stats: CategoryLevelStats = {};
  for (const row of rows) {
    stats[row.category] ??= {};
    stats[row.category][row.level] = { correct: row.correct, total: row.total };
  }
  return stats;
}

export function unlockedLevelsFromStats(stats: CategoryLevelStats): Record<string, number> {
  return Object.fromEntries(
    CATEGORIES.map((category) => [category.id, calculateUnlockedLevel(stats[category.id] ?? {})])
  );
}

/** カテゴリごとの解放済み最高レベル（ゲストは全カテゴリ Level 1） */
export async function getUnlockedLevels(userId: string | null): Promise<Record<string, number>> {
  if (!userId) return unlockedLevelsFromStats({});
  return unlockedLevelsFromStats(await getCategoryLevelStats(userId));
}
