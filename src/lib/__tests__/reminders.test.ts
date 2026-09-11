import { describe, it, expect } from "vitest";
import { decideNotifications, type ReminderState } from "../reminders";

// JST 2026-03-10 09:30
const now = new Date("2026-03-10T00:30:00Z");

const base: ReminderState = {
  timezone: "Asia/Tokyo",
  reminderEnabled: true,
  reminderTime: "09:00",
  lastReminderSentAt: null,
  lastStreakAlertSentAt: null,
  streak: 0,
  lastActiveAt: null,
  solvedToday: 0,
  dailyGoal: 10,
  dueCount: 4,
};

describe("decideNotifications", () => {
  it("should send the daily reminder once the reminder time has passed", () => {
    const result = decideNotifications(base, now);

    expect(result).toHaveLength(1);
    expect(result[0].kind).toBe("reminder");
    expect(result[0].body).toContain("4問");
  });

  it("should not send before the reminder time", () => {
    expect(decideNotifications({ ...base, reminderTime: "10:00" }, now)).toEqual([]);
  });

  it("should not send twice on the same day", () => {
    const sentEarlierToday = new Date("2026-03-10T00:05:00Z");
    expect(decideNotifications({ ...base, lastReminderSentAt: sentEarlierToday }, now)).toEqual([]);
  });

  it("should not send when disabled or the goal is reached", () => {
    expect(decideNotifications({ ...base, reminderEnabled: false }, now)).toEqual([]);
    expect(decideNotifications({ ...base, solvedToday: 10 }, now)).toEqual([]);
  });

  it("should alert in the evening when a streak is about to break", () => {
    // JST 2026-03-10 21:30、最後の学習は前日
    const evening = new Date("2026-03-10T12:30:00Z");
    const state = {
      ...base,
      reminderTime: null,
      streak: 5,
      lastActiveAt: new Date("2026-03-09T10:00:00Z"),
    };

    const result = decideNotifications(state, evening);
    expect(result.map((n) => n.kind)).toEqual(["streak"]);
    expect(decideNotifications(state, now)).toEqual([]);
    expect(decideNotifications({ ...state, lastActiveAt: new Date("2026-03-10T05:00:00Z") }, evening)).toEqual([]);
  });
});
