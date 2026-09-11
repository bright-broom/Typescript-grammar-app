/**
 * スライディングウィンドウ方式のインメモリ Rate Limiter。
 * サーバーインスタンスごとに状態を持つため、複数インスタンス構成では上限はインスタンス単位になる。
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** 次にリクエスト可能になるまでの秒数（allowed のときは 0） */
  retryAfter: number;
}

export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, number[]>();
  let lastSweep = 0;

  function sweep(now: number) {
    if (now - lastSweep < windowMs) return;
    lastSweep = now;
    for (const [key, timestamps] of hits) {
      if (timestamps.every((t) => t <= now - windowMs)) hits.delete(key);
    }
  }

  return function check(key: string, now = Date.now()): RateLimitResult {
    sweep(now);
    const windowStart = now - windowMs;
    const timestamps = (hits.get(key) ?? []).filter((t) => t > windowStart);

    if (timestamps.length >= limit) {
      hits.set(key, timestamps);
      return {
        allowed: false,
        remaining: 0,
        retryAfter: Math.max(1, Math.ceil((timestamps[0] + windowMs - now) / 1000)),
      };
    }

    timestamps.push(now);
    hits.set(key, timestamps);
    return { allowed: true, remaining: limit - timestamps.length, retryAfter: 0 };
  };
}

/** 型チェックAPI（提出を含む）: 1分あたり30リクエスト */
export const typecheckRateLimiter = createRateLimiter({ limit: 30, windowMs: 60_000 });
