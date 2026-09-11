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

export type Quality = 0 | 1 | 2 | 3 | 4 | 5;

export interface SRSCard {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
  lastReviewDate: Date | null;
}

export interface SRSUpdate {
  quality: Quality;
  timeSpent: number; // 秒数
  averageTime?: number; // 平均回答時間（オプション）
}

export interface SRSOptions {
  /** 今日の 0:00（ユーザーのタイムゾーン）。省略時はサーバーのローカル時刻 */
  startOfToday?: Date;
  /** 正解時の interval に掛ける係数（全レベル解放済みカテゴリの復習頻度を下げる用途） */
  intervalModifier?: number;
}

export interface SRSResult {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
  /** 回答時間による補正後の quality */
  quality: Quality;
}

export const INITIAL_EASE_FACTOR = 2.5;
export const MIN_EASE_FACTOR = 1.3;

/** 回答時間が平均のこの倍数以上なら quality を1段階下げる */
export const SLOW_ANSWER_RATIO = 2;

/** このレベル以上の正答率で */
export const LEVEL_UP_ACCURACY = 0.8;
/** この回数以上クリアすると次のレベルが解放される */
export const LEVEL_UP_CLEARS = 5;
export const MAX_LEVEL = 3;

/** この日数以上触れていないカテゴリは強制的に復習キューに入れる */
export const STALE_CATEGORY_DAYS = 14;

/** 全レベル解放済みカテゴリで正解したときの interval 係数 */
export const MASTERED_CATEGORY_INTERVAL_MODIFIER = 1.3;

/**
 * 回答時間を考慮した quality の補正。
 * 正解でも平均の2倍以上かかった場合は1段階下げる（ただし正解扱いの3未満にはしない）。
 */
export function adjustQualityForTime(quality: Quality, timeSpent: number, averageTime?: number): Quality {
  if (quality < 3 || !averageTime || averageTime <= 0) return quality;
  if (timeSpent >= averageTime * SLOW_ANSWER_RATIO) {
    return Math.max(3, quality - 1) as Quality;
  }
  return quality;
}

/**
 * SM-2アルゴリズムに基づいてSRSカードを更新
 */
export function calculateSRS(
  card: Pick<SRSCard, "easeFactor" | "interval" | "repetitions">,
  update: SRSUpdate,
  options: SRSOptions = {}
): SRSResult {
  let { easeFactor, interval, repetitions } = card;
  const quality = adjustQualityForTime(update.quality, update.timeSpent, update.averageTime);

  if (quality >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    if (options.intervalModifier && repetitions >= 2) {
      interval = Math.round(interval * options.intervalModifier);
    }
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  // easeFactor更新（全回答で実行）
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < MIN_EASE_FACTOR) {
    easeFactor = MIN_EASE_FACTOR;
  }

  const startOfToday = options.startOfToday ?? localStartOfToday();
  const nextReviewDate = addDays(startOfToday, interval);

  return {
    easeFactor,
    interval,
    repetitions,
    nextReviewDate,
    quality,
  };
}

function localStartOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * 今日の復習が必要なカードかどうかを判定
 * @param startOfTomorrow 明日の 0:00（ユーザーのタイムゾーン）。省略時はサーバーのローカル時刻
 */
export function isDueForReview(nextReviewDate: Date, startOfTomorrow?: Date): boolean {
  const tomorrow = startOfTomorrow ?? addDays(localStartOfToday(), 1);
  return new Date(nextReviewDate).getTime() < tomorrow.getTime();
}

/**
 * quality評価を回答状況から算出する。
 * 回答が遅い場合の減点は calculateSRS 側（adjustQualityForTime）で行うため、ここでは扱わない。
 */
export function calculateQuality(
  wasCorrect: boolean,
  timeSpent: number,
  hintsUsed: number,
  averageTime?: number
): Quality {
  if (!wasCorrect) {
    if (hintsUsed >= 3) {
      return 0; // 完全忘却
    } else if (hintsUsed >= 2) {
      return 1; // 大部分を忘れている
    } else {
      return 2; // 部分的に覚えている
    }
  }

  const isQuick = averageTime ? timeSpent < averageTime * 0.5 : timeSpent < 30;

  if (hintsUsed === 0 && isQuick) {
    return 5; // 即答
  } else if (hintsUsed === 0) {
    return 4; // 少し迷った
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
  const targetReviewRatio = 0.7;
  const targetNewRatio = 0.3;

  let reviewCount = Math.min(dueCards, Math.ceil(dailyGoal * targetReviewRatio));
  let newCount = Math.min(availableNewProblems, Math.floor(dailyGoal * targetNewRatio));

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

// ---------------------------------------------------------------------------
// スパイラル学習
// ---------------------------------------------------------------------------

export interface LevelStats {
  correct: number;
  total: number;
}

/**
 * カテゴリ内で解放済みの最高レベルを返す。
 * Level N を正答率80%以上で5回以上クリアすると Level N+1 が解放される。
 */
export function calculateUnlockedLevel(statsByLevel: Partial<Record<number, LevelStats>>): number {
  let unlocked = 1;
  while (unlocked < MAX_LEVEL) {
    const stats = statsByLevel[unlocked];
    if (!stats || !isLevelCleared(stats)) break;
    unlocked += 1;
  }
  return unlocked;
}

export function isLevelCleared(stats: LevelStats): boolean {
  return stats.correct >= LEVEL_UP_CLEARS && stats.total > 0 && stats.correct / stats.total >= LEVEL_UP_ACCURACY;
}

/** レベル解放までの進捗（0〜1） */
export function levelUpProgress(stats: LevelStats | undefined): number {
  if (!stats || stats.total === 0) return 0;
  const clearsProgress = Math.min(1, stats.correct / LEVEL_UP_CLEARS);
  const accuracyProgress = Math.min(1, stats.correct / stats.total / LEVEL_UP_ACCURACY);
  return Math.min(clearsProgress, accuracyProgress);
}

export interface CardForSelection {
  problemId: string;
  category: string;
  interval: number;
  nextReviewDate: Date;
  lastReviewDate: Date | null;
}

export interface ProblemForSelection {
  id: string;
  category: string;
  level: number;
}

export interface DailySelectionInput {
  dailyGoal: number;
  /** ユーザーの全SRSカード */
  cards: CardForSelection[];
  /** まだカードがない（未着手の）問題。解放済みレベルのみを渡す */
  newProblems: ProblemForSelection[];
  /** カテゴリの表示順（新規問題をカテゴリ横断で配分する順序） */
  categoryOrder: readonly string[];
  now: Date;
  /** 明日の 0:00（ユーザーのタイムゾーン） */
  startOfTomorrow: Date;
}

export interface DailySelection {
  problemIds: string[];
  reviewIds: string[];
  newIds: string[];
  /** 14日以上触れていないカテゴリから強制的に入れた復習問題 */
  forcedReviewIds: string[];
}

/**
 * デイリーチャレンジの出題セットを選ぶ。
 *
 * 1. 14日以上触れていないカテゴリは、最も interval の長い問題を強制的に復習キューに入れる
 * 2. 期限が来た復習問題を、期限が古い順に並べる
 * 3. 新規30% + 復習70% を目安に件数を決める（足りない側はもう一方で補う）
 * 4. 新規問題はカテゴリを巡回しながら、低いレベルから選ぶ
 */
export function selectDailyProblems(input: DailySelectionInput): DailySelection {
  const { dailyGoal, cards, newProblems, categoryOrder, now, startOfTomorrow } = input;
  const staleThreshold = now.getTime() - STALE_CATEGORY_DAYS * 24 * 60 * 60 * 1000;

  const dueCards = cards
    .filter((card) => isDueForReview(card.nextReviewDate, startOfTomorrow))
    .sort((a, b) => a.nextReviewDate.getTime() - b.nextReviewDate.getTime());
  const dueIds = new Set(dueCards.map((card) => card.problemId));

  const cardsByCategory = new Map<string, CardForSelection[]>();
  for (const card of cards) {
    const list = cardsByCategory.get(card.category) ?? [];
    list.push(card);
    cardsByCategory.set(card.category, list);
  }

  const forced: CardForSelection[] = [];
  for (const category of categoryOrder) {
    const categoryCards = cardsByCategory.get(category);
    if (!categoryCards || categoryCards.length === 0) continue;
    const lastTouched = Math.max(...categoryCards.map((card) => card.lastReviewDate?.getTime() ?? 0));
    if (lastTouched > staleThreshold) continue;
    // 期限切れのカードがすでにキューにあれば、それで「触れる」ことになる
    if (categoryCards.some((card) => dueIds.has(card.problemId))) continue;
    const longest = [...categoryCards].sort((a, b) => b.interval - a.interval)[0];
    forced.push(longest);
  }

  const reviewQueue = [...forced, ...dueCards];
  const { newCount, reviewCount } = calculateDailySetSize(dailyGoal, reviewQueue.length, newProblems.length);

  // 強制復習は件数の上限を超えても入れる（スパイラル学習の維持を優先）
  const reviewTake = Math.max(reviewCount, Math.min(forced.length, dailyGoal));
  const reviews = reviewQueue.slice(0, reviewTake);
  const news = pickNewProblems(newProblems, Math.min(newCount, Math.max(0, dailyGoal - reviews.length)), categoryOrder);

  const reviewIds = reviews.map((card) => card.problemId);
  const newIds = news.map((problem) => problem.id);

  return {
    problemIds: [...reviewIds, ...newIds],
    reviewIds,
    newIds,
    forcedReviewIds: forced.map((card) => card.problemId).filter((id) => reviewIds.includes(id)),
  };
}

function pickNewProblems(
  problems: ProblemForSelection[],
  count: number,
  categoryOrder: readonly string[]
): ProblemForSelection[] {
  const queues = new Map<string, ProblemForSelection[]>();
  for (const problem of [...problems].sort((a, b) => a.level - b.level || a.id.localeCompare(b.id))) {
    const queue = queues.get(problem.category) ?? [];
    queue.push(problem);
    queues.set(problem.category, queue);
  }
  const order = [
    ...categoryOrder.filter((category) => queues.has(category)),
    ...[...queues.keys()].filter((category) => !categoryOrder.includes(category)),
  ];

  const picked: ProblemForSelection[] = [];
  while (picked.length < count) {
    let progressed = false;
    for (const category of order) {
      const next = queues.get(category)?.shift();
      if (!next) continue;
      picked.push(next);
      progressed = true;
      if (picked.length >= count) break;
    }
    if (!progressed) break;
  }
  return picked;
}
