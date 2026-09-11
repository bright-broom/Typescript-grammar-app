import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { typecheckRateLimiter } from "@/lib/rate-limit";

export function jsonError(status: number, error: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error, ...extra }, { status });
}

export const unauthorized = () => jsonError(401, "ログインが必要です");

/** JSONボディをスキーマで検証する。失敗時は 400 レスポンスを返す */
export async function parseJson<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): Promise<{ data: z.infer<T> } | { response: NextResponse }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { response: jsonError(400, "Invalid JSON body") };
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    return { response: jsonError(400, "Invalid request body", { details: result.error.issues }) };
  }
  return { data: result.data };
}

function clientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

/** 型チェックを伴うAPIの Rate Limit（1分あたり30リクエスト）。超過時は 429 レスポンスを返す */
export function checkTypecheckRateLimit(request: NextRequest, userId: string | null): NextResponse | null {
  const key = userId ? `user:${userId}` : `ip:${clientIp(request)}`;
  const result = typecheckRateLimiter(key);
  if (result.allowed) return null;
  return NextResponse.json(
    { error: `リクエストが多すぎます。${result.retryAfter}秒後にもう一度お試しください。` },
    { status: 429, headers: { "Retry-After": String(result.retryAfter) } }
  );
}
