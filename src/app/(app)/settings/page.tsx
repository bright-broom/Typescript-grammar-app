import { prisma } from "@/lib/prisma";
import { SignInPrompt } from "@/components/sign-in-prompt";
import { getCurrentUserId, getSettings } from "@/lib/server/user";
import { isPushConfigured } from "@/lib/server/push";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return (
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight">設定</h1>
        <SignInPrompt
          title="設定を保存するにはサインインしてください"
          description="1日の目標問題数、リマインダー通知、ランキングへの参加はサインイン後に設定できます。テーマとフォントサイズは画面右上から変更できます。"
        />
      </div>
    );
  }

  const [settings, user] = await Promise.all([
    getSettings(userId),
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { name: true, email: true, image: true, createdAt: true, accounts: { select: { provider: true } } },
    }),
  ]);

  return (
    <SettingsForm
      initial={{
        name: user.name ?? "",
        dailyGoal: settings.dailyGoal,
        reminderEnabled: settings.reminderEnabled,
        reminderTime: settings.reminderTime ?? "09:00",
        timezone: settings.timezone,
        rankingOptIn: settings.rankingOptIn,
      }}
      profile={{
        email: user.email,
        image: user.image,
        startedAt: user.createdAt.toISOString(),
        providers: user.accounts.map((account) => account.provider),
      }}
      pushConfigured={isPushConfigured()}
      vapidPublicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null}
    />
  );
}
