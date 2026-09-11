import { CATEGORIES, XP_PER_CORRECT, XP_SPEED_BONUS, type Difficulty } from "./constants";
import { diffDateKeys } from "./dates";

// ---------------------------------------------------------------------------
// XP / レベル
// ---------------------------------------------------------------------------

/**
 * 正解時に獲得するXP。
 * 難易度ごとの基本XP × quality補正 × ストリークボーナス（10日ごとに+10%）+ 速度ボーナス（即答時）
 */
export function calculateXP(difficulty: Difficulty, quality: number, streak: number): number {
  const baseXP = XP_PER_CORRECT[difficulty];
  const qualityMultiplier = quality >= 4 ? 1.0 : quality >= 3 ? 0.8 : 0.5;
  const streakBonus = 1 + Math.floor(streak / 10) * 0.1;
  const speedBonus = quality >= 5 ? XP_SPEED_BONUS.fast : XP_SPEED_BONUS.normal;

  return Math.round(baseXP * qualityMultiplier * streakBonus) + speedBonus;
}

/** レベル n に到達するのに必要な累計XP（Lv1: 0, Lv2: 100, Lv3: 300, Lv4: 600, ...） */
export function xpRequiredForLevel(level: number): number {
  return 50 * level * (level - 1);
}

export function levelFromXP(xp: number): number {
  let level = 1;
  while (xpRequiredForLevel(level + 1) <= xp) level += 1;
  return level;
}

export function levelProgress(xp: number): { level: number; current: number; required: number; percent: number } {
  const level = levelFromXP(xp);
  const floor = xpRequiredForLevel(level);
  const ceil = xpRequiredForLevel(level + 1);
  const current = xp - floor;
  const required = ceil - floor;
  return { level, current, required, percent: Math.round((current / required) * 100) };
}

// ---------------------------------------------------------------------------
// ストリーク
// ---------------------------------------------------------------------------

/**
 * 学習した日にストリークを更新する。
 * @param lastActiveKey 前回学習した日（ユーザーのタイムゾーンでの "YYYY-MM-DD"）
 */
export function updateStreak(currentStreak: number, lastActiveKey: string | null, todayKey: string): number {
  if (!lastActiveKey) return 1;
  const days = diffDateKeys(lastActiveKey, todayKey);
  if (days <= 0) return Math.max(currentStreak, 1);
  if (days === 1) return currentStreak + 1;
  return 1;
}

/** 表示用のストリーク（昨日も今日も学習していなければ途切れている） */
export function effectiveStreak(streak: number, lastActiveKey: string | null, todayKey: string): number {
  if (!lastActiveKey) return 0;
  return diffDateKeys(lastActiveKey, todayKey) <= 1 ? streak : 0;
}

// ---------------------------------------------------------------------------
// バッジ
// ---------------------------------------------------------------------------

export interface BadgeStats {
  streak: number;
  userLevel: number;
  /** 一度でも正解した問題数 */
  solvedProblems: number;
  /** quality 5（即答）の回数 */
  perfectAnswers: number;
  /** デイリーの目標を達成した日数 */
  dailyGoalsCompleted: number;
  /** カテゴリごとの [正解済み問題数, 全問題数] */
  categorySolved: Record<string, { solved: number; total: number }>;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  isEarned: (stats: BadgeStats) => boolean;
}

const categoryBadges: BadgeDefinition[] = CATEGORIES.map((category) => ({
  id: `master-${category.id}`,
  name: `${category.name}マスター`,
  description: `「${category.name}」の全問題に正解する`,
  icon: "🎓",
  isEarned: (stats) => {
    const entry = stats.categorySolved[category.id];
    return !!entry && entry.total > 0 && entry.solved >= entry.total;
  },
}));

export const BADGES: BadgeDefinition[] = [
  {
    id: "first-solve",
    name: "はじめの一歩",
    description: "初めて問題に正解する",
    icon: "🌱",
    isEarned: (s) => s.solvedProblems >= 1,
  },
  {
    id: "solved-10",
    name: "型の見習い",
    description: "10問に正解する",
    icon: "📘",
    isEarned: (s) => s.solvedProblems >= 10,
  },
  {
    id: "solved-50",
    name: "型の使い手",
    description: "50問に正解する",
    icon: "📗",
    isEarned: (s) => s.solvedProblems >= 50,
  },
  {
    id: "solved-100",
    name: "型の達人",
    description: "100問に正解する",
    icon: "📕",
    isEarned: (s) => s.solvedProblems >= 100,
  },
  {
    id: "streak-3",
    name: "三日坊主卒業",
    description: "3日連続で学習する",
    icon: "🔥",
    isEarned: (s) => s.streak >= 3,
  },
  {
    id: "streak-7",
    name: "1週間継続",
    description: "7日連続で学習する",
    icon: "🔥",
    isEarned: (s) => s.streak >= 7,
  },
  {
    id: "streak-30",
    name: "30日連続学習",
    description: "30日連続で学習する",
    icon: "💪",
    isEarned: (s) => s.streak >= 30,
  },
  {
    id: "streak-100",
    name: "100日連続学習",
    description: "100日連続で学習する",
    icon: "🏆",
    isEarned: (s) => s.streak >= 100,
  },
  {
    id: "flash-10",
    name: "フラッシュトランスレーター",
    description: "即答（quality 5）で10回正解する",
    icon: "⚡",
    isEarned: (s) => s.perfectAnswers >= 10,
  },
  {
    id: "daily-goal",
    name: "今日のノルマ達成",
    description: "デイリーチャレンジの目標を達成する",
    icon: "🎯",
    isEarned: (s) => s.dailyGoalsCompleted >= 1,
  },
  {
    id: "level-10",
    name: "Lv.10到達",
    description: "ユーザーレベル10に到達する",
    icon: "⭐",
    isEarned: (s) => s.userLevel >= 10,
  },
  ...categoryBadges,
];

const badgeById = new Map(BADGES.map((badge) => [badge.id, badge]));

export function getBadge(id: string): BadgeDefinition | undefined {
  return badgeById.get(id);
}

/** 条件を満たしているが、まだ獲得していないバッジ */
export function findNewBadges(stats: BadgeStats, earnedIds: Iterable<string>): BadgeDefinition[] {
  const earned = new Set(earnedIds);
  return BADGES.filter((badge) => !earned.has(badge.id) && badge.isEarned(stats));
}
