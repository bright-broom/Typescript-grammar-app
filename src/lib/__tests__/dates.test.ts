import { describe, it, expect } from "vitest";
import {
  addDaysToKey,
  diffDateKeys,
  isValidTimeZone,
  minutesSinceStartOfDay,
  parseTimeOfDay,
  startOfDateKey,
  startOfDay,
  startOfMonth,
  startOfWeek,
  toDateKey,
} from "../dates";

describe("dates", () => {
  it("タイムゾーンでの暦日を返すこと", () => {
    // UTC 15:30 は JST 翌日 0:30
    const date = new Date("2026-03-08T15:30:00Z");
    expect(toDateKey(date, "UTC")).toBe("2026-03-08");
    expect(toDateKey(date, "Asia/Tokyo")).toBe("2026-03-09");
  });

  it("暦日の加算と差分", () => {
    expect(addDaysToKey("2026-02-28", 1)).toBe("2026-03-01");
    expect(addDaysToKey("2026-01-01", -1)).toBe("2025-12-31");
    expect(diffDateKeys("2026-02-27", "2026-03-02")).toBe(3);
  });

  it("タイムゾーンでの 0:00 を返すこと", () => {
    expect(startOfDateKey("2026-03-09", "Asia/Tokyo").toISOString()).toBe("2026-03-08T15:00:00.000Z");
    expect(startOfDay(new Date("2026-03-08T15:30:00Z"), "Asia/Tokyo").toISOString()).toBe("2026-03-08T15:00:00.000Z");
  });

  it("夏時間の切り替え日でも 0:00 を返すこと", () => {
    // 2026-03-08 は米国の夏時間開始日（0:00 時点では PST = UTC-8）
    expect(startOfDateKey("2026-03-08", "America/Los_Angeles").toISOString()).toBe("2026-03-08T08:00:00.000Z");
    expect(startOfDateKey("2026-03-09", "America/Los_Angeles").toISOString()).toBe("2026-03-09T07:00:00.000Z");
  });

  it("週の始まりは月曜、月の始まりは1日", () => {
    // 2026-03-11 は水曜
    const date = new Date("2026-03-11T03:00:00Z");
    expect(toDateKey(startOfWeek(date, "Asia/Tokyo"), "Asia/Tokyo")).toBe("2026-03-09");
    expect(toDateKey(startOfMonth(date, "Asia/Tokyo"), "Asia/Tokyo")).toBe("2026-03-01");
  });

  it("時刻のパース", () => {
    expect(parseTimeOfDay("09:30")).toBe(570);
    expect(parseTimeOfDay("24:00")).toBeNull();
    expect(parseTimeOfDay("9:30")).toBeNull();
    expect(minutesSinceStartOfDay(new Date("2026-03-08T00:30:00Z"), "Asia/Tokyo")).toBe(9 * 60 + 30);
  });

  it("タイムゾーン名の検証", () => {
    expect(isValidTimeZone("Asia/Tokyo")).toBe(true);
    expect(isValidTimeZone("Mars/Olympus")).toBe(false);
  });
});
