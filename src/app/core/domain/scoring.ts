export interface Rank {
  title: string;
  minXp: number;
}

export interface RankStatus {
  title: string;
  minXp: number;
  next: Rank | null;
  progress: number;
}

export interface PrfMetrics {
  tp: number;
  fp: number;
  fn: number;
  precision: number;
  recall: number;
  f1: number;
}

export interface BonusInput {
  scorePct: number;
  attempts: number;
  flawless: boolean;
  hinted: boolean;
}

export interface Bonus {
  firstTry: number;
  flawless: number;
  total: number;
}

export const RANKS: readonly Rank[] = [
  { title: 'Intern', minXp: 0 },
  { title: 'Junior Developer', minXp: 100 },
  { title: 'Component Crafter', minXp: 300 },
  { title: 'Signal Smith', minXp: 600 },
  { title: 'Angular Architect', minXp: 1000 },
  { title: 'Angular Grandmaster', minXp: 1500 },
];

export const FIRST_TRY_BONUS = 10;
export const FLAWLESS_BONUS = 20;

export function starsForScore(pct: number): number {
  if (pct >= 90) return 3;
  if (pct >= 60) return 2;
  if (pct >= 30) return 1;
  return 0;
}

export function xpForResult(maxXp: number, pct: number): number {
  return Math.round((maxXp * starsForScore(pct)) / 3);
}

export function playerRank(xp: number): RankStatus {
  let current = RANKS[0];
  let next: Rank | null = RANKS[1] ?? null;
  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].minXp) {
      current = RANKS[i];
      next = RANKS[i + 1] ?? null;
    }
  }
  const progress = next ? (xp - current.minXp) / (next.minXp - current.minXp) : 1;
  return { title: current.title, minXp: current.minXp, next, progress: clamp(progress, 0, 1) };
}

export function precisionRecallF1(tp: number, fp: number, fn: number): PrfMetrics {
  const precision = tp + fp === 0 ? (fn === 0 ? 1 : 0) : tp / (tp + fp);
  const recall = tp + fn === 0 ? 1 : tp / (tp + fn);
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  return { tp, fp, fn, precision, recall, f1 };
}

export function setF1(predicted: string[], expected: string[]): PrfMetrics {
  const predictedSet = new Set(predicted);
  const expectedSet = new Set(expected);
  let tp = 0;
  for (const key of predictedSet) {
    if (expectedSet.has(key)) tp++;
  }
  return precisionRecallF1(tp, predictedSet.size - tp, expectedSet.size - tp);
}

/** Share of correct items as a rounded percentage; 100 when there was nothing to get right. */
export function fractionCorrect(correct: number, total: number): number {
  if (total <= 0) {
    return 100;
  }
  return Math.round((correct / total) * 100);
}

export function pickScore(
  picked: string[],
  items: { id: string; relevance: number }[],
  k: number,
): number {
  const pickedSet = new Set(picked);
  const gathered = items
    .filter((item) => pickedSet.has(item.id))
    .reduce((sum, item) => sum + item.relevance, 0);
  const best = [...items]
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, k)
    .reduce((sum, item) => sum + item.relevance, 0);
  if (best === 0) {
    return 100;
  }
  return Math.min(100, (gathered / best) * 100);
}

export function bonusXp(input: BonusInput): Bonus {
  const firstTry =
    input.attempts === 1 && starsForScore(input.scorePct) === 3 ? FIRST_TRY_BONUS : 0;
  const flawless = input.flawless && !input.hinted ? FLAWLESS_BONUS : 0;
  return { firstTry, flawless, total: firstTry + flawless };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
