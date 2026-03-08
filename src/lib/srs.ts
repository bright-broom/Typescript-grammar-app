/**
 * SM-2アルゴリズムベースのSRS (Spaced Repetition System)
 *
 * qualityは0〜5の整数:
 * 0: 完全忘却
 * 1: 間違い、正解を見てもピンとこない
 * 2: 間違い、正解を見たら思い出した
 * 3: 正解だがかなり迷った
 * 4: 正解、少し迷った
 * 5: 即答
 */

export interface SRSCard {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
  lastReviewDate: Date | null;
}

export interface SRSUpdate {
  quality: 0 | 1 | 2 | 3 | 4 | 5;
  timeSpent: number; // 秒数
  averageTime?: number; // 平均回答時間（オプション）
}

export interface SRSResult {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
}

/**
 * SM-2アルゴリズムに基づいてSRSカードを更新
 */
export function calculateSRS(
  card: Pick<SRSCard, "easeFactor" | "interval" | "repetitions">,
  update: SRSUpdate
): SRSResult {
  let { easeFactor, interval, repetitions } = card;
  let { quality, timeSpent, averageTime } = update;

  // 回答時間が平均の2倍以上かかった場合、qualityを1段階下げる
  if (averageTime && timeSpent > averageTime * 2 && quality > 0) {
    quality = Math.max(0, quality - 1) as 0 | 1 | 2 | 3 | 4 | 5;
  }

  // 正解判定 (quality >= 3)
  if (quality >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    // 不正解
    repetitions = 0;
    interval = 1;
  }

  // easeFactor更新（全回答で実行）
  easeFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // easeFactor は最低 1.3
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  // 次回復習日を計算
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);
  nextReviewDate.setHours(0, 0, 0, 0);

  return {
    easeFactor,
    interval,
    repetitions,
    nextReviewDate,
  };
}

/**
 * 今日の復習が必要なカードかどうかを判定
 */
export function isDueForReview(nextReviewDate: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reviewDate = new Date(nextReviewDate);
  reviewDate.setHours(0, 0, 0, 0);
  return reviewDate <= today;
}

/**
 * quality評価を回答状況から算出
 */
export function calculateQuality(
  wasCorrect: boolean,
  timeSpent: number,
  hintsUsed: number,
  averageTime?: number
): 0 | 1 | 2 | 3 | 4 | 5 {
  if (!wasCorrect) {
    // 不正解の場合
    if (hintsUsed >= 3) {
      return 0; // 完全忘却
    } else if (hintsUsed >= 2) {
      return 1; // 大部分を忘れている
    } else {
      return 2; // 部分的に覚えている
    }
  }

  // 正解の場合
  const isQuick = averageTime ? timeSpent < averageTime * 0.5 : timeSpent < 30;
  const isSlow = averageTime ? timeSpent > averageTime * 2 : timeSpent > 120;

  if (hintsUsed === 0 && isQuick) {
    return 5; // 即答
  } else if (hintsUsed === 0 && !isSlow) {
    return 4; // 少し迷った
  } else if (hintsUsed <= 1) {
    return 3; // かなり迷った
  } else {
    return 3; // ヒントを使ったが正解
  }
}

/**
 * デイリーセットの生成ロジック
 * 新規30% + 復習70%の構成
 */
export function calculateDailySetSize(
  dailyGoal: number,
  dueCards: number,
  availableNewProblems: number
): { newCount: number; reviewCount: number } {
  // 復習対象がある場合は優先
  const targetReviewRatio = 0.7;
  const targetNewRatio = 0.3;

  let reviewCount = Math.min(
    dueCards,
    Math.ceil(dailyGoal * targetReviewRatio)
  );
  let newCount = Math.min(
    availableNewProblems,
    Math.floor(dailyGoal * targetNewRatio)
  );

  // 復習が少ない場合は新規を増やす
  if (reviewCount < dailyGoal * targetReviewRatio) {
    const remaining = dailyGoal - reviewCount;
    newCount = Math.min(availableNewProblems, remaining);
  }

  // 新規が少ない場合は復習を増やす
  if (newCount < dailyGoal * targetNewRatio) {
    const remaining = dailyGoal - newCount;
    reviewCount = Math.min(dueCards, remaining);
  }

  return { newCount, reviewCount };
}

/**
 * XP計算
 */
export function calculateXP(
  difficulty: "easy" | "medium" | "hard",
  quality: number,
  streak: number
): number {
  const baseXP = { easy: 10, medium: 20, hard: 30 }[difficulty];

  // quality bonusが低い場合はXPを減らす
  const qualityMultiplier = quality >= 4 ? 1.0 : quality >= 3 ? 0.8 : 0.5;

  // ストリークボーナス (10日ごとに10%)
  const streakBonus = 1 + Math.floor(streak / 10) * 0.1;

  return Math.round(baseXP * qualityMultiplier * streakBonus);
}
