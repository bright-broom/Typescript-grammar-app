/**
 * タイムゾーンを考慮した日付ユーティリティ。
 * 「今日」「ストリーク」「リマインダー」はユーザーのタイムゾーンでの暦日で判定する。
 */

export const DEFAULT_TIMEZONE = "Asia/Tokyo";

const DAY_MS = 24 * 60 * 60 * 1000;

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    formatterCache.set(timeZone, formatter);
  }
  return formatter;
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    getFormatter(timeZone);
    return true;
  } catch {
    return false;
  }
}

interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export function getZonedParts(date: Date, timeZone: string): ZonedParts {
  const parts = Object.fromEntries(
    getFormatter(timeZone)
      .formatToParts(date)
      .map((p) => [p.type, p.value])
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

/** タイムゾーンでの暦日 "YYYY-MM-DD" */
export function toDateKey(date: Date, timeZone: string): string {
  const { year, month, day } = getZonedParts(date, timeZone);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** "YYYY-MM-DD" に日数を足した暦日 */
export function addDaysToKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

/** 2つの暦日の差（b - a の日数） */
export function diffDateKeys(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / DAY_MS);
}

function timeZoneOffsetMs(date: Date, timeZone: string): number {
  const p = getZonedParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - (date.getTime() - date.getMilliseconds());
}

/** タイムゾーンでの暦日 "YYYY-MM-DD" の 0:00 を表す Date */
export function startOfDateKey(dateKey: string, timeZone: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d);
  // オフセットはその瞬間によって変わる（夏時間）ため2回補正する
  let result = guess - timeZoneOffsetMs(new Date(guess), timeZone);
  result = guess - timeZoneOffsetMs(new Date(result), timeZone);
  return new Date(result);
}

/** date が属するタイムゾーンでの暦日の 0:00 */
export function startOfDay(date: Date, timeZone: string): Date {
  return startOfDateKey(toDateKey(date, timeZone), timeZone);
}

/** date から n 日後（タイムゾーンでの暦日）の 0:00 */
export function startOfDayAfter(date: Date, days: number, timeZone: string): Date {
  return startOfDateKey(addDaysToKey(toDateKey(date, timeZone), days), timeZone);
}

/** タイムゾーンでの週の始まり（月曜 0:00） */
export function startOfWeek(date: Date, timeZone: string): Date {
  const key = toDateKey(date, timeZone);
  const [y, m, d] = key.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=日
  const daysSinceMonday = (weekday + 6) % 7;
  return startOfDateKey(addDaysToKey(key, -daysSinceMonday), timeZone);
}

/** タイムゾーンでの月初 0:00 */
export function startOfMonth(date: Date, timeZone: string): Date {
  const key = toDateKey(date, timeZone);
  return startOfDateKey(`${key.slice(0, 8)}01`, timeZone);
}

/** "HH:mm" 形式の時刻を、その日の 0:00 からの分に変換 */
export function parseTimeOfDay(value: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

/** タイムゾーンでの現在時刻（0:00 からの分） */
export function minutesSinceStartOfDay(date: Date, timeZone: string): number {
  const { hour, minute } = getZonedParts(date, timeZone);
  return hour * 60 + minute;
}
