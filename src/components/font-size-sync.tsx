"use client";

import { useEffect } from "react";
import { getFontSize, usePreferences } from "@/stores/preferences";

/** 設定されたフォントサイズをルート要素に反映する（rem 基準のUI全体が拡大縮小する） */
export function FontSizeSync() {
  const fontSize = usePreferences((state) => state.fontSize);

  useEffect(() => {
    document.documentElement.style.fontSize = `${getFontSize(fontSize).rootPx}px`;
  }, [fontSize]);

  return null;
}
