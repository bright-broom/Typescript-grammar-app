import { NextRequest, NextResponse } from "next/server";
import { unauthorized } from "@/lib/server/api";
import { getHeatmap } from "@/lib/server/stats";
import { getCurrentUserId } from "@/lib/server/user";

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const days = Math.min(Math.max(Number(request.nextUrl.searchParams.get("days")) || 365, 7), 730);
  return NextResponse.json({ days: await getHeatmap(userId, days) });
}
