import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { typeCheck, MAX_CODE_LENGTH } from "@/lib/typecheck";
import { checkTypecheckRateLimit, parseJson } from "@/lib/server/api";
import { getCurrentUserId } from "@/lib/server/user";

const requestSchema = z.object({
  code: z.string().max(MAX_CODE_LENGTH),
});

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  const limited = checkTypecheckRateLimit(request, userId);
  if (limited) return limited;

  const parsed = await parseJson(request, requestSchema);
  if ("response" in parsed) return parsed.response;

  return NextResponse.json(typeCheck(parsed.data.code));
}
