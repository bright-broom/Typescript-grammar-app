import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CATEGORIES, LEVELS } from "@/lib/constants";
import { jsonError } from "@/lib/server/api";
import { listProblems } from "@/lib/server/problems";
import { getCurrentUserId } from "@/lib/server/user";

const querySchema = z.object({
  category: z.enum(CATEGORIES.map((c) => c.id) as [string, ...string[]]).optional(),
  level: z.coerce
    .number()
    .refine((n) => (LEVELS as readonly number[]).includes(n))
    .optional(),
  bookmarked: z.enum(["true", "false"]).optional(),
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return jsonError(400, "Invalid query", { details: parsed.error.issues });

  const userId = await getCurrentUserId();
  const problems = await listProblems(userId, {
    category: parsed.data.category,
    level: parsed.data.level,
    bookmarkedOnly: parsed.data.bookmarked === "true",
  });
  return NextResponse.json({ problems });
}
