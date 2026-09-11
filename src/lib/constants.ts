export const CATEGORIES = [
  { id: "primitive-types", name: "基本型", nameEn: "Primitive Types" },
  { id: "arrays-tuples", name: "配列・タプル", nameEn: "Arrays & Tuples" },
  { id: "object-types", name: "オブジェクト型", nameEn: "Object Types" },
  { id: "union-intersection", name: "Union/Intersection", nameEn: "Union/Intersection" },
  { id: "function-types", name: "関数型", nameEn: "Function Types" },
  { id: "generics", name: "ジェネリクス", nameEn: "Generics" },
  { id: "utility-types", name: "ユーティリティ型", nameEn: "Utility Types" },
  { id: "conditional-types", name: "条件型", nameEn: "Conditional Types" },
  { id: "mapped-types", name: "Mapped Types", nameEn: "Mapped Types" },
  { id: "advanced-patterns", name: "型パズル", nameEn: "Advanced Patterns" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const DIFFICULTY_LABELS = {
  easy: "初級",
  medium: "中級",
  hard: "上級",
} as const;

export type Difficulty = keyof typeof DIFFICULTY_LABELS;

export const LEVELS = [1, 2, 3] as const;
export type Level = (typeof LEVELS)[number];

export const XP_PER_CORRECT = {
  easy: 10,
  medium: 20,
  hard: 30,
} as const;

export const XP_SPEED_BONUS = {
  fast: 5, // 平均の半分以下
  normal: 0,
} as const;

export const STREAK_BONUS_MULTIPLIER = 0.1; // 10日連続で+10%

/** 1日の目標問題数（= デイリーチャレンジ1セッションの問題数）の範囲 */
export const DAILY_GOAL_MIN = 5;
export const DAILY_GOAL_MAX = 30;

export const FONT_SIZES = [
  { id: "small", label: "小", rootPx: 14, editorPx: 13 },
  { id: "medium", label: "中", rootPx: 16, editorPx: 14 },
  { id: "large", label: "大", rootPx: 18, editorPx: 16 },
  { id: "xlarge", label: "特大", rootPx: 20, editorPx: 18 },
] as const;

export type FontSizeId = (typeof FONT_SIZES)[number]["id"];
