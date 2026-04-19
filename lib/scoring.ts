// =============================================================================
// Scoring Algorithm — "Today's Score" (max 100 pts)
// =============================================================================
import {
  GymLog,
  NutritionLog,
  SleepLog,
  ScoreBreakdown,
  UserSettings,
} from "./types";

export type { ScoreBreakdown };

const DEFAULT_SETTINGS: Partial<UserSettings> = {
  proteinTargetG: 160,
  sleepTargetH: 7.5,
};

// ─── Gym: 35 pts ──────────────────────────────────────────────────────────────
export function scoreGym(gym?: GymLog): number {
  if (!gym || !gym.completed) return 0;
  // Bonus: duration ≥ 60min → full 35; ≥ 30min → 25; < 30min → 18
  if (gym.durationMin >= 60) return 35;
  if (gym.durationMin >= 30) return 25;
  return 18;
}

// ─── Nutrition: 35 pts ────────────────────────────────────────────────────────
export function scoreNutrition(
  nutrition?: NutritionLog,
  settings?: Partial<UserSettings>
): number {
  if (!nutrition) return 0;
  const target = settings?.proteinTargetG ?? DEFAULT_SETTINGS.proteinTargetG!;
  const ratio = nutrition.proteinG / target;
  if (ratio >= 1.0) return 35;
  if (ratio >= 0.8) return 28;
  if (ratio >= 0.6) return 18;
  if (ratio >= 0.4) return 10;
  return 5;
}

// ─── Sleep: 30 pts ────────────────────────────────────────────────────────────
export function scoreSleep(
  sleep?: SleepLog,
  settings?: Partial<UserSettings>
): number {
  if (!sleep) return 0;
  const target = settings?.sleepTargetH ?? DEFAULT_SETTINGS.sleepTargetH!;
  const hourScore = (() => {
    if (sleep.hours >= target) return 20;
    if (sleep.hours >= target - 1) return 15;
    if (sleep.hours >= target - 2) return 8;
    return 3;
  })();
  const qualityScore = (() => {
    if (sleep.quality >= 5) return 10;
    if (sleep.quality >= 4) return 8;
    if (sleep.quality >= 3) return 5;
    return 2;
  })();
  return Math.min(30, hourScore + qualityScore);
}

// ─── Composite Score ──────────────────────────────────────────────────────────
export function computeScore(
  gym?: GymLog,
  nutrition?: NutritionLog,
  sleep?: SleepLog,
  settings?: Partial<UserSettings>
): ScoreBreakdown {
  const gymPts = scoreGym(gym);
  const nutritionPts = scoreNutrition(nutrition, settings);
  const sleepPts = scoreSleep(sleep, settings);
  return {
    gym: gymPts,
    nutrition: nutritionPts,
    sleep: sleepPts,
    total: gymPts + nutritionPts + sleepPts,
  };
}

// ─── Score → Color ────────────────────────────────────────────────────────────
export function scoreToColor(score: number): string {
  if (score >= 90) return "#10b981"; // emerald
  if (score >= 70) return "#6ee7b7"; // light emerald
  if (score >= 40) return "#f59e0b"; // amber
  return "#ef4444";                   // red
}

export function scoreToLabel(score: number): string {
  if (score >= 90) return "Xuất sắc 🔥";
  if (score >= 70) return "Tốt 💪";
  if (score >= 40) return "Trung bình 😐";
  if (score > 0) return "Kém 😴";
  return "Chưa nhập ⬜";
}
