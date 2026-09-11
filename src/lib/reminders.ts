import { diffDateKeys, minutesSinceStartOfDay, parseTimeOfDay, toDateKey } from "./dates";

/** この時刻（ユーザーのタイムゾーン）を過ぎても今日未学習ならストリーク途切れアラートを送る */
export const STREAK_ALERT_MINUTES = 21 * 60;

export interface ReminderState {
  timezone: string;
  reminderEnabled: boolean;
  reminderTime: string | null;
  lastReminderSentAt: Date | null;
  lastStreakAlertSentAt: Date | null;
  streak: number;
  lastActiveAt: Date | null;
  solvedToday: number;
  dailyGoal: number;
  dueCount: number;
}

export interface ReminderNotification {
  kind: "reminder" | "streak";
  title: string;
  body: string;
  url: string;
}

/**
 * 今送るべき通知を判定する（cron の実行間隔に依存しないよう「その日まだ送っていなければ送る」方式）。
 */
export function decideNotifications(state: ReminderState, now: Date): ReminderNotification[] {
  if (!state.reminderEnabled) return [];

  const todayKey = toDateKey(now, state.timezone);
  const minutesNow = minutesSinceStartOfDay(now, state.timezone);
  const sentToday = (date: Date | null) => !!date && toDateKey(date, state.timezone) === todayKey;
  const lastActiveKey = state.lastActiveAt ? toDateKey(state.lastActiveAt, state.timezone) : null;
  const studiedToday = lastActiveKey === todayKey;
  const goalReached = state.solvedToday >= state.dailyGoal;
  const notifications: ReminderNotification[] = [];

  const reminderMinutes = state.reminderTime ? parseTimeOfDay(state.reminderTime) : null;
  if (
    reminderMinutes !== null &&
    minutesNow >= reminderMinutes &&
    !sentToday(state.lastReminderSentAt) &&
    !goalReached
  ) {
    notifications.push({
      kind: "reminder",
      title: "TS Grammar Dojo",
      body:
        state.dueCount > 0
          ? `今日の復習問題が${state.dueCount}問あります。忘れる前に復習しましょう！`
          : "今日の学習を始めましょう！デイリーチャレンジが待っています。",
      url: "/practice/daily",
    });
  }

  const streakAtRisk =
    state.streak > 0 && !studiedToday && lastActiveKey !== null && diffDateKeys(lastActiveKey, todayKey) === 1;
  if (streakAtRisk && minutesNow >= STREAK_ALERT_MINUTES && !sentToday(state.lastStreakAlertSentAt)) {
    notifications.push({
      kind: "streak",
      title: `🔥 ${state.streak}日連続の記録が途切れそうです`,
      body: "今日のうちに1問だけでも解いて、ストリークを守りましょう！",
      url: "/practice/daily",
    });
  }

  return notifications;
}
