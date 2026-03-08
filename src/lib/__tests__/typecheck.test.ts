import { describe, it, expect } from "vitest";
import { typeCheck, runTestCases } from "../typecheck";

describe("TypeCheck", () => {
  describe("typeCheck", () => {
    it("should pass valid TypeScript code", () => {
      const code = `
        const x: number = 42;
        const y: string = "hello";
      `;
      const result = typeCheck(code);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should fail on type errors", () => {
      const code = `
        const x: number = "hello";
      `;
      const result = typeCheck(code);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should check type definitions", () => {
      const code = `
        type Person = { name: string; age: number };
        const p: Person = { name: "Taro", age: 25 };
      `;
      const result = typeCheck(code);

      expect(result.success).toBe(true);
    });

    it("should catch missing properties", () => {
      const code = `
        type Person = { name: string; age: number };
        const p: Person = { name: "Taro" };
      `;
      const result = typeCheck(code);

      expect(result.success).toBe(false);
    });

    it("should handle generic types", () => {
      const code = `
        type Box<T> = { value: T };
        const numBox: Box<number> = { value: 42 };
        const strBox: Box<string> = { value: "hello" };
      `;
      const result = typeCheck(code);

      expect(result.success).toBe(true);
    });

    it("should catch generic type mismatches", () => {
      const code = `
        type Box<T> = { value: T };
        const numBox: Box<number> = { value: "not a number" };
      `;
      const result = typeCheck(code);

      expect(result.success).toBe(false);
    });
  });

  describe("runTestCases", () => {
    it("should pass all test cases for correct type definition", () => {
      const userCode = `type Person = { name: string; age: number }`;
      const testCases = [
        {
          description: "正しいPersonが代入できること",
          code: `const p: Person = { name: "Taro", age: 25 }`,
          shouldPass: true,
        },
        {
          description: "ageが文字列だとエラーになること",
          code: `const p: Person = { name: "Taro", age: "25" }`,
          shouldPass: false,
        },
      ];

      const results = runTestCases(userCode, testCases);

      expect(results).toHaveLength(2);
      expect(results[0].passed).toBe(true);
      expect(results[1].passed).toBe(true);
    });

    it("should detect failing test cases", () => {
      const userCode = `type Person = { name: string }`;
      const testCases = [
        {
          description: "nameとageを持つオブジェクトが代入できること",
          code: `const p: Person = { name: "Taro", age: 25 }`,
          shouldPass: true,
        },
      ];

      const results = runTestCases(userCode, testCases);

      expect(results[0].passed).toBe(false);
    });
  });
});
