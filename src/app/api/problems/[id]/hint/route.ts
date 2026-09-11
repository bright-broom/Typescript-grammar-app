import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { MAX_CODE_LENGTH } from "@/lib/typecheck";
import { jsonError, parseJson } from "@/lib/server/api";
import { ProblemLockedError, ProblemNotFoundError, getHint } from "@/lib/server/submissions";
import { getCurrentUserId } from "@/lib/server/user";

const requestSchema = z.object({
  /** 取得するヒントの番号（0始まり）。ヒント数以上なら模範解答を返す */
  index: z.number().int().min(0).max(20),
  code: z.string().max(MAX_CODE_LENGTH).default(""),
  timeSpent: z
    .number()
    .int()
    .min(0)
    .transform((n) => Math.min(n, 60 * 60))
    .default(0),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = await parseJson(request, requestSchema);
  if ("response" in parsed) return parsed.response;

  try {
    const result = await getHint({ userId: await getCurrentUserId(), problemId: id, ...parsed.data });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ProblemNotFoundError) return jsonError(404, "問題が見つかりません");
    if (error instanceof ProblemLockedError) return jsonError(403, "この問題のレベルはまだ解放されていません");
    throw error;
  }
}
