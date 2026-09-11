import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/server/api";
import { sendDueReminders } from "@/lib/server/push";

/**
 * リマインダー送信（外部の cron から定期的に呼ぶ）。
 * `Authorization: Bearer ${CRON_SECRET}` が必要。
 */
async function handle(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return jsonError(503, "CRON_SECRET is not configured");
  if (request.headers.get("authorization") !== `Bearer ${secret}`) return jsonError(401, "Unauthorized");

  const result = await sendDueReminders();
  return NextResponse.json({ checked: result.checked, sent: result.sent.length });
}

export const GET = handle;
export const POST = handle;
