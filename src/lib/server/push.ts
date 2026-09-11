import webpush, { WebPushError } from "web-push";
import { prisma } from "@/lib/prisma";
import { decideNotifications, type ReminderNotification } from "@/lib/reminders";
import { getDayContext } from "./user";

let configured: boolean | null = null;

export function isPushConfigured(): boolean {
  if (configured !== null) return configured;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    configured = false;
    return false;
  }
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:admin@example.com", publicKey, privateKey);
  configured = true;
  return true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

/** ユーザーの全デバイスに通知を送る。失効した購読は削除する。送信できた件数を返す */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<number> {
  if (!isPushConfigured()) return 0;
  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });
  let sent = 0;

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
          JSON.stringify(payload),
          { TTL: 60 * 60 }
        );
        sent += 1;
      } catch (error) {
        if (error instanceof WebPushError && (error.statusCode === 404 || error.statusCode === 410)) {
          await prisma.pushSubscription.delete({ where: { id: subscription.id } }).catch(() => {});
        } else {
          console.error("Failed to send push notification:", error);
        }
      }
    })
  );

  return sent;
}

/** cron から呼ばれる: リマインダーとストリーク途切れアラートを送信する */
export async function sendDueReminders(now = new Date()) {
  if (!isPushConfigured()) return { checked: 0, sent: [] as { userId: string; kind: ReminderNotification["kind"] }[] };

  const users = await prisma.user.findMany({
    where: { pushSubscriptions: { some: {} }, settings: { reminderEnabled: true } },
    select: { id: true, streak: true, lastActiveAt: true, settings: true },
  });

  const sent: { userId: string; kind: ReminderNotification["kind"] }[] = [];
  for (const user of users) {
    const settings = user.settings;
    if (!settings) continue;
    const day = getDayContext(settings.timezone, now);
    const [solvedToday, dueCount] = await Promise.all([
      prisma.response.findMany({
        where: { userId: user.id, wasCorrect: true, createdAt: { gte: day.startOfToday } },
        distinct: ["problemId"],
        select: { problemId: true },
      }),
      prisma.sRSCard.count({ where: { userId: user.id, nextReviewDate: { lt: day.startOfTomorrow } } }),
    ]);

    const notifications = decideNotifications(
      {
        timezone: day.timezone,
        reminderEnabled: settings.reminderEnabled,
        reminderTime: settings.reminderTime,
        lastReminderSentAt: settings.lastReminderSentAt,
        lastStreakAlertSentAt: settings.lastStreakAlertSentAt,
        streak: user.streak,
        lastActiveAt: user.lastActiveAt,
        solvedToday: solvedToday.length,
        dailyGoal: settings.dailyGoal,
        dueCount,
      },
      now
    );

    for (const notification of notifications) {
      // 1台にも届かなかった場合は送信済みにせず、次回の cron で再送する
      if ((await sendPushToUser(user.id, notification)) === 0) continue;
      await prisma.userSettings.update({
        where: { userId: user.id },
        data: notification.kind === "reminder" ? { lastReminderSentAt: now } : { lastStreakAlertSentAt: now },
      });
      sent.push({ userId: user.id, kind: notification.kind });
    }
  }

  return { checked: users.length, sent };
}
