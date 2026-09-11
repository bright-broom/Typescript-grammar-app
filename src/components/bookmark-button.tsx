"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function BookmarkButton({
  problemId,
  initialBookmarked,
  size = "sm",
}: {
  problemId: string;
  initialBookmarked: boolean;
  size?: "sm" | "icon-sm";
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [pending, setPending] = useState(false);

  const toggle = async () => {
    setPending(true);
    const next = !bookmarked;
    setBookmarked(next);
    try {
      const response = await fetch(`/api/problems/${problemId}/bookmark`, { method: next ? "POST" : "DELETE" });
      if (!response.ok) throw new Error(String(response.status));
      toast.success(next ? "苦手問題にブックマークしました" : "ブックマークを外しました");
    } catch {
      setBookmarked(!next);
      toast.error("ブックマークを更新できませんでした");
    } finally {
      setPending(false);
    }
  };

  const Icon = bookmarked ? BookmarkCheck : Bookmark;
  const label = bookmarked ? "ブックマークを外す" : "ブックマークする";

  return (
    <Button
      variant={bookmarked ? "secondary" : "ghost"}
      size={size}
      onClick={toggle}
      disabled={pending}
      aria-pressed={bookmarked}
      aria-label={label}
      title={label}
      className="gap-1"
    >
      <Icon className={bookmarked ? "text-amber-500" : undefined} aria-hidden />
      {size === "sm" && (bookmarked ? "ブックマーク済み" : "ブックマーク")}
    </Button>
  );
}
