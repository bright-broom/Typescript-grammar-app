import { describe, it, expect } from "vitest";
import { problems } from "../../../prisma/data";
import { CATEGORIES, LEVELS } from "../constants";
import { runTestCases } from "../typecheck";

describe("問題シードデータ", () => {
  it("IDが一意で命名規則に従っていること", () => {
    const ids = problems.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of problems) {
      expect(p.id).toMatch(new RegExp(`^${p.category}-${p.level}-\\d{2}$`));
    }
  });

  it("各カテゴリのLevel 1に5問以上、合計50問以上あること", () => {
    expect(problems.length).toBeGreaterThanOrEqual(50);
    for (const category of CATEGORIES) {
      const count = problems.filter((p) => p.category === category.id && p.level === 1).length;
      expect(count, category.id).toBeGreaterThanOrEqual(5);
    }
  });

  it("必須項目が埋まっていること", () => {
    for (const p of problems) {
      expect(LEVELS, p.id).toContain(p.level);
      expect(p.hints.length, p.id).toBeGreaterThan(0);
      expect(p.testCases.length, p.id).toBeGreaterThan(0);
      expect(
        p.testCases.some((t) => t.shouldPass),
        `${p.id}: shouldPass:true のテストが必要`
      ).toBe(true);
      expect(p.explanation.length, p.id).toBeGreaterThan(0);
    }
  });

  describe.each(problems.map((p) => [p.id, p] as const))("%s", (_id, problem) => {
    it("模範解答がすべてのテストケースに合格すること", () => {
      const results = runTestCases(problem.expectedAnswer, problem.testCases);
      const failed = results.filter((r) => !r.passed);
      expect(failed).toEqual([]);
    });

    it("スターターコードのままでは正解にならないこと", () => {
      const results = runTestCases(problem.starterCode, problem.testCases);
      expect(results.every((r) => r.passed)).toBe(false);
    });
  });
});
