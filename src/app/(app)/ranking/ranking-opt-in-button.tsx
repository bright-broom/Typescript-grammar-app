"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function RankingOptInButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const join = async () => {
    setPending(true);
    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rankingOptIn: true }),
      });
      if (!response.ok) throw new Error(String(response.status));
      toast.success("ランキングに参加しました");
      router.refresh();
    } catch {
      toast.error("設定を更新できませんでした");
    } finally {
      setPending(false);
    }
  };

  return (
    <Button onClick={join} disabled={pending}>
      ランキングに参加する
    </Button>
  );
}
