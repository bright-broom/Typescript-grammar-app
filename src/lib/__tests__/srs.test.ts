import { describe, it, expect } from "vitest";
import {
  calculateSRS,
  isDueForReview,
  calculateQuality,
  calculateDailySetSize,
  calculateUnlockedLevel,
  adjustQualityForTime,
  levelUpProgress,
  selectDailyProblems,
  type CardForSelection,
  type ProblemForSelection,
} from "../srs";

describe("SRS Algorithm", () => {
  describe("calculateSRS", () => {
    it("should initialize card with interval=1 on first correct answer", () => {
      const card = { easeFactor: 2.5, interval: 0, repetitions: 0 };
      const result = calculateSRS(card, { quality: 4, timeSpent: 30 });

      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(1);
    });

    it("should set interval=6 on second correct answer", () => {
      const card = { easeFactor: 2.5, interval: 1, repetitions: 1 };
      const result = calculateSRS(card, { quality: 4, timeSpent: 30 });

      expect(result.interval).toBe(6);
      expect(result.repetitions).toBe(2);
    });

    it("should multiply interval by easeFactor on subsequent correct answers", () => {
      const card = { easeFactor: 2.5, interval: 6, repetitions: 2 };
      const result = calculateSRS(card, { quality: 4, timeSpent: 30 });

      expect(result.interval).toBe(15); // 6 * 2.5 = 15
      expect(result.repetitions).toBe(3);
    });

    it("should reset on incorrect answer (quality < 3)", () => {
      const card = { easeFactor: 2.5, interval: 15, repetitions: 5 };
      const result = calculateSRS(card, { quality: 2, timeSpent: 30 });

      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(0);
    });

    it("should decrease easeFactor on low quality answers", () => {
      const card = { easeFactor: 2.5, interval: 6, repetitions: 2 };
      const result = calculateSRS(card, { quality: 3, timeSpent: 30 });

      expect(result.easeFactor).toBeLessThan(2.5);
    });

    it("should not let easeFactor go below 1.3", () => {
      const card = { easeFactor: 1.4, interval: 1, repetitions: 0 };
      const result = calculateSRS(card, { quality: 0, timeSpent: 30 });

      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it("should decrease quality by 1 if answer time is 2x average or more", () => {
      const card = { easeFactor: 2.5, interval: 6, repetitions: 2 };
      const normalResult = calculateSRS(card, {
        quality: 5,
        timeSpent: 30,
        averageTime: 30,
      });
      const slowResult = calculateSRS(card, {
        quality: 5,
        timeSpent: 70,
        averageTime: 30,
      });

      // Slow answer should have higher easeFactor decrease
      expect(slowResult.easeFactor).toBeLessThan(normalResult.easeFactor);
      expect(slowResult.quality).toBe(4);
    });

    it("should keep a slow correct answer counted as correct", () => {
      const card = { easeFactor: 2.5, interval: 6, repetitions: 2 };
      const result = calculateSRS(card, { quality: 3, timeSpent: 100, averageTime: 30 });

      expect(result.quality).toBe(3);
      expect(result.repetitions).toBe(3);
    });

    it("should schedule the next review relative to the given start of day", () => {
      const startOfToday = new Date("2026-03-08T15:00:00Z");
      const result = calculateSRS(
        { easeFactor: 2.5, interval: 1, repetitions: 1 },
        { quality: 4, timeSpent: 30 },
        { startOfToday }
      );

      expect(result.nextReviewDate.getTime() - startOfToday.getTime()).toBe(6 * 24 * 60 * 60 * 1000);
    });

    it("should stretch intervals for mastered categories", () => {
      const card = { easeFactor: 2.5, interval: 6, repetitions: 2 };
      const normal = calculateSRS(card, { quality: 4, timeSpent: 30 });
      const mastered = calculateSRS(card, { quality: 4, timeSpent: 30 }, { intervalModifier: 1.3 });

      expect(mastered.interval).toBeGreaterThan(normal.interval);
    });
  });

  describe("adjustQualityForTime", () => {
    it("should not change incorrect answers", () => {
      expect(adjustQualityForTime(2, 500, 30)).toBe(2);
    });

    it("should not change answers when there is no average", () => {
      expect(adjustQualityForTime(5, 500)).toBe(5);
    });

    it("should lower quality exactly at 2x", () => {
      expect(adjustQualityForTime(5, 60, 30)).toBe(4);
      expect(adjustQualityForTime(5, 59, 30)).toBe(5);
    });
  });

  describe("isDueForReview", () => {
    it("should return true for past dates", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      expect(isDueForReview(yesterday)).toBe(true);
    });

    it("should return true for today", () => {
      const today = new Date();

      expect(isDueForReview(today)).toBe(true);
    });

    it("should use the given start of tomorrow", () => {
      const startOfTomorrow = new Date("2026-03-09T15:00:00Z");

      expect(isDueForReview(new Date("2026-03-09T14:59:59Z"), startOfTomorrow)).toBe(true);
      expect(isDueForReview(startOfTomorrow, startOfTomorrow)).toBe(false);
    });

    it("should return false for future dates", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      expect(isDueForReview(tomorrow)).toBe(false);
    });
  });

  describe("calculateQuality", () => {
    it("should return 5 for quick correct answer without hints", () => {
      const quality = calculateQuality(true, 10, 0, 30);
      expect(quality).toBe(5);
    });

    it("should return 4 for normal speed correct answer without hints", () => {
      const quality = calculateQuality(true, 30, 0, 30);
      expect(quality).toBe(4);
    });

    it("should not penalize slow answers itself (calculateSRS does)", () => {
      expect(calculateQuality(true, 300, 0, 30)).toBe(4);
    });

    it("should return 3 for correct answer with one hint", () => {
      const quality = calculateQuality(true, 30, 1, 30);
      expect(quality).toBe(3);
    });

    it("should return 0 for incorrect answer with many hints", () => {
      const quality = calculateQuality(false, 30, 3, 30);
      expect(quality).toBe(0);
    });

    it("should return 2 for incorrect answer with one hint", () => {
      const quality = calculateQuality(false, 30, 1, 30);
      expect(quality).toBe(2);
    });
  });

  describe("calculateDailySetSize", () => {
    it("should respect 30/70 ratio for new/review", () => {
      const { newCount, reviewCount } = calculateDailySetSize(10, 100, 100);

      expect(newCount).toBe(3);
      expect(reviewCount).toBe(7);
    });

    it("should increase new problems if not enough reviews", () => {
      const { newCount, reviewCount } = calculateDailySetSize(10, 2, 100);

      expect(reviewCount).toBe(2);
      expect(newCount).toBe(8);
    });

    it("should increase reviews if not enough new problems", () => {
      const { newCount, reviewCount } = calculateDailySetSize(10, 100, 1);

      expect(newCount).toBe(1);
      expect(reviewCount).toBe(9);
    });
  });

  describe("calculateUnlockedLevel", () => {
    it("should start at level 1", () => {
      expect(calculateUnlockedLevel({})).toBe(1);
    });

    it("should unlock the next level with 5+ clears at 80%+ accuracy", () => {
      expect(calculateUnlockedLevel({ 1: { correct: 5, total: 6 } })).toBe(2);
      expect(calculateUnlockedLevel({ 1: { correct: 4, total: 4 } })).toBe(1);
      expect(calculateUnlockedLevel({ 1: { correct: 5, total: 7 } })).toBe(1);
    });

    it("should unlock up to level 3", () => {
      expect(
        calculateUnlockedLevel({
          1: { correct: 10, total: 10 },
          2: { correct: 8, total: 10 },
          3: { correct: 9, total: 9 },
        })
      ).toBe(3);
    });

    it("should report progress towards the next level", () => {
      expect(levelUpProgress(undefined)).toBe(0);
      expect(levelUpProgress({ correct: 5, total: 5 })).toBe(1);
      expect(levelUpProgress({ correct: 2, total: 2 })).toBeCloseTo(0.4);
    });
  });

  describe("selectDailyProblems", () => {
    const now = new Date("2026-03-20T03:00:00Z");
    const startOfTomorrow = new Date("2026-03-20T15:00:00Z");
    const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);
    const categoryOrder = ["a", "b", "c"];

    const card = (
      problemId: string,
      category: string,
      overrides: Partial<CardForSelection> = {}
    ): CardForSelection => ({
      problemId,
      category,
      interval: 6,
      nextReviewDate: daysAgo(-3),
      lastReviewDate: daysAgo(2),
      ...overrides,
    });
    const problem = (id: string, category: string, level = 1): ProblemForSelection => ({ id, category, level });

    it("should mix due reviews and new problems at 70/30", () => {
      const cards = Array.from({ length: 10 }, (_, i) => card(`r${i}`, "a", { nextReviewDate: daysAgo(i) }));
      const newProblems = Array.from({ length: 10 }, (_, i) => problem(`n${i}`, "b"));

      const result = selectDailyProblems({ dailyGoal: 10, cards, newProblems, categoryOrder, now, startOfTomorrow });

      expect(result.reviewIds).toHaveLength(7);
      expect(result.newIds).toHaveLength(3);
      // 期限が古い順
      expect(result.reviewIds[0]).toBe("r9");
    });

    it("should not include cards that are not due yet", () => {
      const cards = [card("future", "a", { nextReviewDate: startOfTomorrow })];

      const result = selectDailyProblems({
        dailyGoal: 10,
        cards,
        newProblems: [],
        categoryOrder,
        now,
        startOfTomorrow,
      });

      expect(result.problemIds).toEqual([]);
    });

    it("should force a review from a category untouched for 14+ days", () => {
      const cards = [
        card("short", "c", { interval: 10, nextReviewDate: daysAgo(-20), lastReviewDate: daysAgo(15) }),
        card("long", "c", { interval: 40, nextReviewDate: daysAgo(-25), lastReviewDate: daysAgo(20) }),
        card("recent", "a", { interval: 50, nextReviewDate: daysAgo(-30), lastReviewDate: daysAgo(3) }),
      ];

      const result = selectDailyProblems({
        dailyGoal: 10,
        cards,
        newProblems: [],
        categoryOrder,
        now,
        startOfTomorrow,
      });

      expect(result.forcedReviewIds).toEqual(["long"]);
      expect(result.reviewIds).toEqual(["long"]);
    });

    it("should spread new problems across categories, lower levels first", () => {
      const newProblems = [
        problem("a-2", "a", 2),
        problem("a-1", "a", 1),
        problem("b-1", "b", 1),
        problem("c-1", "c", 1),
        problem("a-1b", "a", 1),
      ];

      const result = selectDailyProblems({ dailyGoal: 4, cards: [], newProblems, categoryOrder, now, startOfTomorrow });

      expect(result.newIds).toEqual(["a-1", "b-1", "c-1", "a-1b"]);
    });

    it("should never exceed the daily goal", () => {
      const cards = Array.from({ length: 30 }, (_, i) => card(`r${i}`, "a", { nextReviewDate: daysAgo(1) }));
      const newProblems = Array.from({ length: 30 }, (_, i) => problem(`n${i}`, "b"));

      const result = selectDailyProblems({ dailyGoal: 15, cards, newProblems, categoryOrder, now, startOfTomorrow });

      expect(result.problemIds).toHaveLength(15);
      expect(new Set(result.problemIds).size).toBe(15);
    });
  });
});
