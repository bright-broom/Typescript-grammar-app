import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, parseJson, unauthorized } from "@/lib/server/api";
import { isPushConfigured } from "@/lib/server/push";
import { getCurrentUserId } from "@/lib/server/user";

const subscriptionSchema = z.object({
  endpoint: z.string().url().max(2000),
  keys: z.object({ p256dh: z.string().max(200), auth: z.string().max(100) }),
});

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();
  if (!isPushConfigured()) return jsonError(503, "サーバーでPush通知が設定されていません");

  const parsed = await parseJson(request, subscriptionSchema);
  if ("response" in parsed) return parsed.response;
  const { endpoint, keys } = parsed.data;

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: { userId, endpoint, p256dh: keys.p256dh, auth: keys.auth },
    update: { userId, p256dh: keys.p256dh, auth: keys.auth },
  });
  return NextResponse.json({ subscribed: true });
}

export async function DELETE(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const parsed = await parseJson(request, z.object({ endpoint: z.string().max(2000) }));
  if ("response" in parsed) return parsed.response;

  await prisma.pushSubscription.deleteMany({ where: { userId, endpoint: parsed.data.endpoint } });
  return NextResponse.json({ subscribed: false });
}
