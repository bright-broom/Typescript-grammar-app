import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_TIMEZONE, addDaysToKey, isValidTimeZone, startOfDateKey, toDateKey } from "@/lib/dates";

/** ログイン中のユーザーID（ゲストは null） */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function getSettings(userId: string) {
  return prisma.userSettings.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

export interface DayContext {
  timezone: string;
  now: Date;
  todayKey: string;
  startOfToday: Date;
  startOfTomorrow: Date;
}

/** ユーザーのタイムゾーンでの「今日」 */
export function getDayContext(timezone: string | null | undefined, now = new Date()): DayContext {
  const tz = timezone && isValidTimeZone(timezone) ? timezone : DEFAULT_TIMEZONE;
  const todayKey = toDateKey(now, tz);
  return {
    timezone: tz,
    now,
    todayKey,
    startOfToday: startOfDateKey(todayKey, tz),
    startOfTomorrow: startOfDateKey(addDaysToKey(todayKey, 1), tz),
  };
}
