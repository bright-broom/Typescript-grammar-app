import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { MAX_CODE_LENGTH } from "@/lib/typecheck";
import { checkTypecheckRateLimit, jsonError, parseJson } from "@/lib/server/api";
import { ProblemLockedError, ProblemNotFoundError, submitAnswer } from "@/lib/server/submissions";
import { getCurrentUserId } from "@/lib/server/user";

const requestSchema = z.object({
  code: z.string().max(MAX_CODE_LENGTH),
  /** 回答にかかった秒数 */
  timeSpent: z
    .number()
    .int()
    .min(0)
    .transform((n) => Math.min(n, 60 * 60)),
  hintsUsed: z.number().int().min(0).max(20).default(0),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  const limited = checkTypecheckRateLimit(request, userId);
  if (limited) return limited;

  const parsed = await parseJson(request, requestSchema);
  if ("response" in parsed) return parsed.response;

  try {
    const result = await submitAnswer({ userId, problemId: id, ...parsed.data });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ProblemNotFoundError) return jsonError(404, "問題が見つかりません");
    if (error instanceof ProblemLockedError) return jsonError(403, "この問題のレベルはまだ解放されていません");
    throw error;
  }
}
