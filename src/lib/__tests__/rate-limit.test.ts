import { describe, it, expect } from "vitest";
import { createRateLimiter } from "../rate-limit";

describe("createRateLimiter", () => {
  it("should allow up to the limit within the window", () => {
    const check = createRateLimiter({ limit: 3, windowMs: 60_000 });
    const now = 1_000_000;

    expect(check("ip", now).allowed).toBe(true);
    expect(check("ip", now + 1).allowed).toBe(true);
    expect(check("ip", now + 2).remaining).toBe(0);

    const blocked = check("ip", now + 3);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBe(60);
  });

  it("should track keys separately", () => {
    const check = createRateLimiter({ limit: 1, windowMs: 60_000 });

    expect(check("a", 0).allowed).toBe(true);
    expect(check("b", 0).allowed).toBe(true);
    expect(check("a", 1).allowed).toBe(false);
  });

  it("should allow requests again after the window slides", () => {
    const check = createRateLimiter({ limit: 2, windowMs: 60_000 });

    check("ip", 0);
    check("ip", 30_000);
    expect(check("ip", 59_999).allowed).toBe(false);
    expect(check("ip", 60_001).allowed).toBe(true);
  });
});
