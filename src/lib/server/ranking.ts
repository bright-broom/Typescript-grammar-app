import { prisma } from "@/lib/prisma";
import { DEFAULT_TIMEZONE, startOfMonth, startOfWeek, toDateKey } from "@/lib/dates";
import { effectiveStreak } from "@/lib/gamification";

export type RankingPeriod = "weekly" | "monthly" | "alltime";

export const RANKING_PERIODS: RankingPeriod[] = ["weekly", "monthly", "alltime"];

const RANKING_SIZE = 50;

interface RankingRow {
  user_id: string;
  name: string | null;
  image: string | null;
  xp: number;
  streak: number;
  last_active_at: Date | null;
  rank: number;
}

/**
 * XPランキング。ランキングへの参加を選んだユーザーのみ集計する。
 * 週・月の区切りはアプリ共通のタイムゾーン（Asia/Tokyo）で判定する。
 */
export async function getRanking(period: RankingPeriod, currentUserId: string | null, now = new Date()) {
  const since =
    period === "weekly"
      ? startOfWeek(now, DEFAULT_TIMEZONE)
      : period === "monthly"
        ? startOfMonth(now, DEFAULT_TIMEZONE)
        : null;

  const rows = since
    ? await prisma.$queryRaw<RankingRow[]>`
        SELECT u.id AS user_id, u.name, u.image, u.streak, u.last_active_at,
               SUM(r.xp_earned)::int AS xp,
               RANK() OVER (ORDER BY SUM(r.xp_earned) DESC)::int AS rank
        FROM responses r
        JOIN users u ON u.id = r.user_id
        JOIN user_settings s ON s.user_id = u.id
        WHERE s.ranking_opt_in = true AND r.created_at >= ${since}
        GROUP BY u.id
        HAVING SUM(r.xp_earned) > 0
        ORDER BY xp DESC, u.id
      `
    : await prisma.$queryRaw<RankingRow[]>`
        SELECT u.id AS user_id, u.name, u.image, u.streak, u.last_active_at, u.xp,
               RANK() OVER (ORDER BY u.xp DESC)::int AS rank
        FROM users u
        JOIN user_settings s ON s.user_id = u.id
        WHERE s.ranking_opt_in = true AND u.xp > 0
        ORDER BY u.xp DESC, u.id
      `;

  const todayKey = toDateKey(now, DEFAULT_TIMEZONE);
  const entries = rows.map((row) => ({
    userId: row.user_id,
    name: row.name ?? "名無しの型使い",
    image: row.image,
    xp: row.xp,
    rank: row.rank,
    streak: effectiveStreak(
      row.streak,
      row.last_active_at ? toDateKey(row.last_active_at, DEFAULT_TIMEZONE) : null,
      todayKey
    ),
    isCurrentUser: row.user_id === currentUserId,
  }));

  const currentIndex = entries.findIndex((entry) => entry.isCurrentUser);
  const current = currentIndex >= 0 ? entries[currentIndex] : null;
  const above = currentIndex > 0 ? entries[currentIndex - 1] : null;

  return {
    period,
    entries: entries.slice(0, RANKING_SIZE),
    participants: entries.length,
    currentUser: current
      ? { ...current, xpToNextRank: above && above.xp > current.xp ? above.xp - current.xp : null }
      : null,
  };
}

export type Ranking = Awaited<ReturnType<typeof getRanking>>;
