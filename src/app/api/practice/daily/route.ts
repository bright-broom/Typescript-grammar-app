import { NextResponse } from "next/server";
import { getDailyChallenge, getGuestDailyChallenge } from "@/lib/server/daily";
import { getCurrentUserId } from "@/lib/server/user";

export async function GET() {
  const userId = await getCurrentUserId();
  const daily = userId ? await getDailyChallenge(userId) : await getGuestDailyChallenge();
  return NextResponse.json({ ...daily, guest: !userId });
}
