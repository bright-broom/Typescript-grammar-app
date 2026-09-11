import { NextResponse } from "next/server";
import { unauthorized } from "@/lib/server/api";
import { getCategoryProgress, getProgressSummary, getWeeklyActivity } from "@/lib/server/stats";
import { getCurrentUserId } from "@/lib/server/user";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const [summary, categories, weeklyActivity] = await Promise.all([
    getProgressSummary(userId),
    getCategoryProgress(userId),
    getWeeklyActivity(userId),
  ]);
  return NextResponse.json({ summary, categories, weeklyActivity });
}
