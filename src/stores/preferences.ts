"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FONT_SIZES, type FontSizeId } from "@/lib/constants";

interface PreferencesState {
  fontSize: FontSizeId;
  setFontSize: (fontSize: FontSizeId) => void;
}

/** 端末ごとの表示設定（ゲストでも使えるよう localStorage に保存） */
export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      fontSize: "medium",
      setFontSize: (fontSize) => set({ fontSize }),
    }),
    { name: "ts-dojo-preferences" }
  )
);

export function getFontSize(id: FontSizeId) {
  return FONT_SIZES.find((size) => size.id === id) ?? FONT_SIZES[1];
}
