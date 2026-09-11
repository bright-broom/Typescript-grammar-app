import { NextResponse } from "next/server";
import { unauthorized } from "@/lib/server/api";
import { getWeakness } from "@/lib/server/stats";
import { getCurrentUserId } from "@/lib/server/user";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  return NextResponse.json(await getWeakness(userId));
}
