import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, unauthorized } from "@/lib/server/api";
import { getCurrentUserId } from "@/lib/server/user";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: Context) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();
  const { id } = await params;

  const problem = await prisma.problem.findUnique({ where: { id }, select: { id: true } });
  if (!problem) return jsonError(404, "問題が見つかりません");

  await prisma.bookmark.upsert({
    where: { userId_problemId: { userId, problemId: id } },
    create: { userId, problemId: id },
    update: {},
  });
  return NextResponse.json({ bookmarked: true });
}

export async function DELETE(_request: NextRequest, { params }: Context) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();
  const { id } = await params;

  await prisma.bookmark.deleteMany({ where: { userId, problemId: id } });
  return NextResponse.json({ bookmarked: false });
}
