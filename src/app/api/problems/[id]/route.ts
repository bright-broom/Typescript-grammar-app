import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/server/api";
import { getProblemForSolver } from "@/lib/server/problems";
import { getCurrentUserId } from "@/lib/server/user";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const problem = await getProblemForSolver(id, await getCurrentUserId());
  if (!problem) return jsonError(404, "問題が見つかりません");
  return NextResponse.json({ problem });
}
