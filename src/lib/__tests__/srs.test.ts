import { describe, it, expect } from "vitest";
import {
  calculateSRS,
  isDueForReview,
  calculateQuality,
  calculateDailySetSize,
  calculateXP,
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

    it("should decrease quality by 1 if answer time is more than 2x average", () => {
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

    it("should reduce XP for low quality answers", () => {
      expect(calculateXP("easy", 2, 0)).toBe(5); // 50% of base
    });
  });
});
