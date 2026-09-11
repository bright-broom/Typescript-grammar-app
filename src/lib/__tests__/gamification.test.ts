import { describe, it, expect } from "vitest";
import {
  BADGES,
  calculateXP,
  effectiveStreak,
  findNewBadges,
  levelFromXP,
  levelProgress,
  updateStreak,
  xpRequiredForLevel,
  type BadgeStats,
} from "../gamification";

describe("gamification", () => {
  describe("calculateXP", () => {
    it("should give base XP for correct answers", () => {
      expect(calculateXP("easy", 4, 0)).toBe(10);
      expect(calculateXP("medium", 4, 0)).toBe(20);
      expect(calculateXP("hard", 4, 0)).toBe(30);
    });

    it("should give bonus XP for streaks", () => {
      expect(calculateXP("easy", 4, 10)).toBe(11); // 10% bonus
      expect(calculateXP("easy", 4, 20)).toBe(12); // 20% bonus
    });

    it("should give a speed bonus for instant answers", () => {
      expect(calculateXP("easy", 5, 0)).toBe(15);
    });

    it("should reduce XP for low quality answers", () => {
      expect(calculateXP("easy", 3, 0)).toBe(8);
      expect(calculateXP("easy", 2, 0)).toBe(5);
    });
  });

  describe("levels", () => {
    it("should map XP to levels", () => {
      expect(xpRequiredForLevel(1)).toBe(0);
      expect(xpRequiredForLevel(2)).toBe(100);
      expect(levelFromXP(0)).toBe(1);
      expect(levelFromXP(99)).toBe(1);
      expect(levelFromXP(100)).toBe(2);
      expect(levelFromXP(1250)).toBe(5);
    });

    it("should report progress within the current level", () => {
      expect(levelProgress(150)).toEqual({ level: 2, current: 50, required: 200, percent: 25 });
    });
  });

  describe("streak", () => {
    it("should start a streak on the first day", () => {
      expect(updateStreak(0, null, "2026-03-10")).toBe(1);
    });

    it("should keep the streak on the same day", () => {
      expect(updateStreak(4, "2026-03-10", "2026-03-10")).toBe(4);
    });

    it("should extend on consecutive days and reset after a gap", () => {
      expect(updateStreak(4, "2026-03-09", "2026-03-10")).toBe(5);
      expect(updateStreak(4, "2026-03-07", "2026-03-10")).toBe(1);
    });

    it("should show a broken streak as 0", () => {
      expect(effectiveStreak(5, "2026-03-09", "2026-03-10")).toBe(5);
      expect(effectiveStreak(5, "2026-03-08", "2026-03-10")).toBe(0);
    });
  });

  describe("badges", () => {
    const baseStats: BadgeStats = {
      streak: 0,
      userLevel: 1,
      solvedProblems: 0,
      perfectAnswers: 0,
      dailyGoalsCompleted: 0,
      categorySolved: {},
    };

    it("should have unique ids", () => {
      const ids = BADGES.map((b) => b.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("should award newly earned badges only", () => {
      const stats = { ...baseStats, solvedProblems: 10, streak: 7 };
      const ids = findNewBadges(stats, ["first-solve"]).map((b) => b.id);

      expect(ids).toEqual(expect.arrayContaining(["solved-10", "streak-3", "streak-7"]));
      expect(ids).not.toContain("first-solve");
      expect(ids).not.toContain("streak-30");
    });

    it("should award a category master badge when every problem is solved", () => {
      const stats = {
        ...baseStats,
        categorySolved: { generics: { solved: 15, total: 15 }, "mapped-types": { solved: 3, total: 15 } },
      };
      const ids = findNewBadges(stats, []).map((b) => b.id);

      expect(ids).toContain("master-generics");
      expect(ids).not.toContain("master-mapped-types");
    });
  });
});
