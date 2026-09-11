import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/server/api";
import { RANKING_PERIODS, getRanking, type RankingPeriod } from "@/lib/server/ranking";
import { getCurrentUserId } from "@/lib/server/user";

export async function GET(request: NextRequest) {
  const period = (request.nextUrl.searchParams.get("period") ?? "weekly") as RankingPeriod;
  if (!RANKING_PERIODS.includes(period)) return jsonError(400, "period must be weekly, monthly or alltime");

  return NextResponse.json(await getRanking(period, await getCurrentUserId()));
}
