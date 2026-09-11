"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Bell, BellRing, Globe, LogOut, Monitor, Moon, Sun, Target, Trophy, Type, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { signOutAction } from "@/app/actions/auth";
import { DAILY_GOAL_MAX, DAILY_GOAL_MIN, FONT_SIZES } from "@/lib/constants";
import { usePreferences } from "@/stores/preferences";
import { cn } from "@/lib/utils";

interface SettingsValues {
  name: string;
  dailyGoal: number;
  reminderEnabled: boolean;
  reminderTime: string;
  timezone: string;
  rankingOptIn: boolean;
}

interface Props {
  initial: SettingsValues;
  profile: { email: string; image: string | null; startedAt: string; providers: string[] };
  pushConfigured: boolean;
  vapidPublicKey: string | null;
}

type PushState = "unsupported" | "denied" | "subscribed" | "unsubscribed" | "loading";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

const PROVIDER_LABELS: Record<string, string> = { github: "GitHub", google: "Google" };

export function SettingsForm({ initial, profile, pushConfigured, vapidPublicKey }: Props) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [pushState, setPushState] = useState<PushState>("loading");
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize } = usePreferences();
  const [mounted, setMounted] = useState(false);

  const browserTimezone = mounted ? Intl.DateTimeFormat().resolvedOptions().timeZone : null;
  const update = <K extends keyof SettingsValues>(key: K, value: SettingsValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    setMounted(true);
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setPushState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setPushState("denied");
      return;
    }
    navigator.serviceWorker
      .getRegistration("/sw.js")
      .then((registration) => registration?.pushManager.getSubscription())
      .then((subscription) => setPushState(subscription ? "subscribed" : "unsubscribed"))
      .catch(() => setPushState("unsubscribed"));
  }, []);

  const save = async () => {
    if (values.dailyGoal < DAILY_GOAL_MIN || values.dailyGoal > DAILY_GOAL_MAX) {
      toast.error(`1日の目標問題数は${DAILY_GOAL_MIN}〜${DAILY_GOAL_MAX}問で設定してください`);
      return;
    }
    if (!values.name.trim()) {
      toast.error("表示名を入力してください");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, theme: theme ?? "system" }),
      });
      if (!response.ok) throw new Error(String(response.status));
      toast.success("設定を保存しました");
      router.refresh();
    } catch {
      toast.error("設定を保存できませんでした");
    } finally {
      setSaving(false);
    }
  };

  const enablePush = async () => {
    if (!vapidPublicKey) return;
    setPushState("loading");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setPushState(permission === "denied" ? "denied" : "unsubscribed");
        return;
      }
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        }));
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });
      if (!response.ok) throw new Error(String(response.status));
      setPushState("subscribed");
      toast.success("この端末でPush通知を受け取れるようになりました");
    } catch (error) {
      console.error(error);
      setPushState("unsubscribed");
      toast.error("Push通知を有効にできませんでした");
    }
  };

  const disablePush = async () => {
    setPushState("loading");
    try {
      const registration = await navigator.serviceWorker.getRegistration("/sw.js");
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setPushState("unsubscribed");
      toast.success("この端末のPush通知を解除しました");
    } catch {
      setPushState("subscribed");
      toast.error("Push通知を解除できませんでした");
    }
  };

  const sendTestPush = async () => {
    const response = await fetch("/api/push/test", { method: "POST" });
    const data = await response.json().catch(() => ({}));
    if (response.ok) toast.success("テスト通知を送信しました");
    else toast.error(data.error ?? "テスト通知を送れませんでした");
  };

  const themeOptions = [
    { value: "light", label: "ライト", icon: Sun },
    { value: "dark", label: "ダーク", icon: Moon },
    { value: "system", label: "システム", icon: Monitor },
  ];

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">設定</h1>
        <p className="text-muted-foreground">学習設定をカスタマイズしましょう</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-green-500" aria-hidden />
            <CardTitle>プロフィール</CardTitle>
          </div>
          <CardDescription>ランキングなどに表示される情報です</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={profile.image ?? undefined} alt="" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-lg">
                {values.name.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="text-muted-foreground">{profile.email}</p>
              <p className="text-muted-foreground">
                学習開始日: {new Date(profile.startedAt).toLocaleDateString("ja-JP")}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">表示名</Label>
            <Input
              id="name"
              value={values.name}
              maxLength={50}
              onChange={(e) => update("name", e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" aria-hidden />
            <CardTitle>学習目標</CardTitle>
          </div>
          <CardDescription>1日の目標問題数（デイリーチャレンジ1セッションの問題数）</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="dailyGoal">1日の目標問題数</Label>
          <div className="flex items-center gap-4">
            <Input
              id="dailyGoal"
              type="number"
              min={DAILY_GOAL_MIN}
              max={DAILY_GOAL_MAX}
              value={values.dailyGoal}
              onChange={(e) => update("dailyGoal", Number(e.target.value))}
              className="w-24"
              aria-describedby="dailyGoalHelp"
            />
            <span className="text-sm text-muted-foreground">問 / 日</span>
          </div>
          <p id="dailyGoalHelp" className="text-sm text-muted-foreground">
            推奨: 10〜20問（{DAILY_GOAL_MIN}〜{DAILY_GOAL_MAX}問）。変更は翌日のデイリーセットから反映されます。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-500" aria-hidden />
            <CardTitle>リマインダー</CardTitle>
          </div>
          <CardDescription>毎日の学習リマインドと、ストリークが途切れそうな時のアラート（21時以降）</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="reminderEnabled">毎日のリマインダー</Label>
              <p className="text-sm text-muted-foreground">設定した時間に「今日の復習問題があります」と通知します</p>
            </div>
            <Switch
              id="reminderEnabled"
              checked={values.reminderEnabled}
              onCheckedChange={(checked) => update("reminderEnabled", checked)}
            />
          </div>
          {values.reminderEnabled && (
            <div className="space-y-2 pt-2 border-t">
              <Label htmlFor="reminderTime">リマインダー時間</Label>
              <Input
                id="reminderTime"
                type="time"
                value={values.reminderTime}
                onChange={(e) => update("reminderTime", e.target.value)}
                className="w-32"
              />
            </div>
          )}

          <div className="space-y-2 pt-2 border-t">
            <Label htmlFor="timezone" className="flex items-center gap-1">
              <Globe className="h-4 w-4" aria-hidden />
              タイムゾーン
            </Label>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                id="timezone"
                value={values.timezone}
                onChange={(e) => update("timezone", e.target.value)}
                className="w-56"
                aria-describedby="timezoneHelp"
              />
              {browserTimezone && browserTimezone !== values.timezone && (
                <Button variant="outline" size="sm" onClick={() => update("timezone", browserTimezone)}>
                  この端末の設定（{browserTimezone}）を使う
                </Button>
              )}
            </div>
            <p id="timezoneHelp" className="text-sm text-muted-foreground">
              「今日」の区切り・ストリーク・リマインダー時刻の判定に使います
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <p className="text-sm font-medium flex items-center gap-1">
              <BellRing className="h-4 w-4" aria-hidden />
              この端末のPush通知
            </p>
            {!pushConfigured ? (
              <p className="text-sm text-muted-foreground">
                サーバーでPush通知が設定されていません（VAPIDキーが未設定）。
              </p>
            ) : pushState === "unsupported" ? (
              <p className="text-sm text-muted-foreground">このブラウザはPush通知に対応していません。</p>
            ) : pushState === "denied" ? (
              <p className="text-sm text-muted-foreground">
                通知がブロックされています。ブラウザのサイト設定から通知を許可してください。
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {pushState === "subscribed" ? (
                  <>
                    <Button variant="outline" size="sm" onClick={disablePush}>
                      通知を解除
                    </Button>
                    <Button variant="ghost" size="sm" onClick={sendTestPush}>
                      テスト通知を送る
                    </Button>
                  </>
                ) : (
                  <Button size="sm" onClick={enablePush} disabled={pushState === "loading"}>
                    この端末で通知を受け取る
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-yellow-500" aria-hidden />
            <CardTitle>表示</CardTitle>
          </div>
          <CardDescription>テーマとフォントサイズ（この端末に保存されます）</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium mb-2">テーマ</legend>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  aria-pressed={mounted && theme === value}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    mounted && theme === value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  )}
                >
                  <Icon className="h-6 w-6" aria-hidden />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium mb-2 flex items-center gap-1">
              <Type className="h-4 w-4" aria-hidden />
              フォントサイズ
            </legend>
            <div className="grid grid-cols-4 gap-3">
              {FONT_SIZES.map((size) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => setFontSize(size.id)}
                  aria-pressed={mounted && fontSize === size.id}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    mounted && fontSize === size.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <span style={{ fontSize: size.rootPx }} aria-hidden>
                    あA
                  </span>
                  <span className="text-xs">{size.label}</span>
                </button>
              ))}
            </div>
          </fieldset>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" aria-hidden />
            <CardTitle>ランキング</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="rankingOptIn">ランキングに参加する</Label>
              <p className="text-sm text-muted-foreground">
                参加すると、表示名・アバター・XP・連続学習日数が他のユーザーのランキングに表示されます
              </p>
            </div>
            <Switch
              id="rankingOptIn"
              checked={values.rankingOptIn}
              onCheckedChange={(checked) => update("rankingOptIn", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-green-500" aria-hidden />
            <CardTitle>アカウント</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">ログイン状態</p>
              <p className="text-sm text-muted-foreground">
                {profile.providers.length > 0
                  ? `${profile.providers.map((p) => PROVIDER_LABELS[p] ?? p).join(" / ")}でログイン中`
                  : "ログイン中"}
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => signOutAction()}>
              <LogOut className="h-4 w-4" aria-hidden />
              サインアウト
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} size="lg" disabled={saving}>
          {saving ? "保存中..." : "設定を保存"}
        </Button>
      </div>
    </div>
  );
}
