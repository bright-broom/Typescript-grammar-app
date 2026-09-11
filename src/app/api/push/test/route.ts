import { NextResponse } from "next/server";
import { jsonError, unauthorized } from "@/lib/server/api";
import { isPushConfigured, sendPushToUser } from "@/lib/server/push";
import { getCurrentUserId } from "@/lib/server/user";

export async function POST() {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();
  if (!isPushConfigured()) return jsonError(503, "サーバーでPush通知が設定されていません");

  const sent = await sendPushToUser(userId, {
    title: "TS Grammar Dojo",
    body: "通知のテストです。この通知が届いていればリマインダーを受け取れます。",
    url: "/settings",
  });
  if (sent === 0) return jsonError(404, "通知を送信できませんでした（登録済みの端末がないか、送信に失敗しました）");
  return NextResponse.json({ sent });
}
