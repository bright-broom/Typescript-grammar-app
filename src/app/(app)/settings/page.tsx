"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Sun, Moon, Monitor, Bell, Target, User, LogOut } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const [dailyGoal, setDailyGoal] = useState(10);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const { theme, setTheme } = useTheme();

  const handleSave = () => {
    toast.success("設定を保存しました");
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">設定</h1>
        <p className="text-muted-foreground">
          学習設定をカスタマイズしましょう
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            <CardTitle>学習目標</CardTitle>
          </div>
          <CardDescription>
            1日の目標問題数を設定します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dailyGoal">1日の目標問題数</Label>
            <div className="flex items-center gap-4">
              <Input
                id="dailyGoal"
                type="number"
                min={1}
                max={50}
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">問 / 日</span>
            </div>
            <p className="text-sm text-muted-foreground">
              推奨: 10〜20問
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-500" />
            <CardTitle>リマインダー</CardTitle>
          </div>
          <CardDescription>
            学習リマインダーの設定
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reminderEnabled">毎日のリマインダー</Label>
              <p className="text-sm text-muted-foreground">
                設定した時間に通知でお知らせします
              </p>
            </div>
            <Switch
              id="reminderEnabled"
              checked={reminderEnabled}
              onCheckedChange={setReminderEnabled}
            />
          </div>
          {reminderEnabled && (
            <div className="space-y-2 pl-0 pt-2 border-t">
              <Label htmlFor="reminderTime">リマインダー時間</Label>
              <Input
                id="reminderTime"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-32"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-yellow-500" />
            <CardTitle>テーマ</CardTitle>
          </div>
          <CardDescription>
            アプリの外観を設定します
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setTheme("light")}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                theme === "light"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Sun className="h-6 w-6" />
              <span className="text-sm font-medium">ライト</span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                theme === "dark"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Moon className="h-6 w-6" />
              <span className="text-sm font-medium">ダーク</span>
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                theme === "system"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Monitor className="h-6 w-6" />
              <span className="text-sm font-medium">システム</span>
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-green-500" />
            <CardTitle>アカウント</CardTitle>
          </div>
          <CardDescription>
            アカウント情報
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">ログイン状態</p>
              <p className="text-sm text-muted-foreground">
                GitHubでログイン中
              </p>
            </div>
            <Link href="/api/auth/signout">
              <Button variant="outline" size="sm" className="gap-2">
                <LogOut className="h-4 w-4" />
                サインアウト
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          設定を保存
        </Button>
      </div>
    </div>
  );
}
