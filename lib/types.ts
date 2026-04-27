// =============================================================================
// LifeOS Types — Health + Finance
// =============================================================================

// ─── User Settings ────────────────────────────────────────────────────────────
export interface UserSettings {
  userId: string;
  displayName: string;
  avatarEmoji: string;
  // Health targets
  proteinTargetG: number;       // default: 160
  caloriesTargetKcal: number;   // default: 2500
  sleepTargetH: number;         // default: 7.5
  gymDaysPerWeek: number;       // default: 5
  // Finance alerts
  cashFlowWarningThresholdVND: number; // default: 5_000_000
  // Notifications
  notifyGymReminderAt: string;  // "21:30"
  notifySleepReminderAt: string; // "22:00"
  fcmToken?: string;
  // Custom categories
  incomeCategories?: string[];
  expenseCategories?: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Health ───────────────────────────────────────────────────────────────────
export interface GymLog {
  completed: boolean;
  durationMin: number;
  startTime?: string;
  endTime?: string;
  muscleGroup?: string; // "chest", "back", "legs", "shoulders", "arms", "core", "cardio"
  note?: string;        // exercise history
}

export interface MealLog {
  name: string;
  calories: number;
  protein: number;
}

export interface NutritionLog {
  proteinG: number;
  caloriesKcal: number;
  meals?: MealLog[];
  note?: string;
}

export interface SleepLog {
  hours: number;
  quality: 1 | 2 | 3 | 4 | 5; // 1=tệ, 5=tuyệt
  bedtime?: string;   // "23:00"
  wakeTime?: string;  // "06:30"
  note?: string;
}

export interface HealthLog {
  id: string;
  userId: string;
  date: string;           // "2026-04-12"
  gym?: GymLog;
  nutrition?: NutritionLog;
  sleep?: SleepLog;
  score: number;          // 0–100, computed on write
  createdAt: string;
  updatedAt: string;
}

export interface ScoreBreakdown {
  gym: number;       // max 35
  nutrition: number; // max 35
  sleep: number;     // max 30
  total: number;     // max 100
}

// ─── Finance ──────────────────────────────────────────────────────────────────
export type WalletType = "personal" | "nero_phet";
export type TransactionType = "income" | "expense" | "transfer_out" | "transfer_in";

export interface Transaction {
  id: string;
  userId: string;
  walletType: WalletType;
  type: TransactionType;
  amount: number;           // VNĐ, always positive
  category: string;
  description: string;
  date: string;             // "2026-04-12"
  transferLinkedId?: string; // links the pair of transfer transactions
  createdAt: string;
}

export type GoalType = "fixed_expense" | "revenue_forecast" | "debt";
export type Recurrence = "monthly" | "weekly" | "once";

export interface FinancialGoal {
  id: string;
  userId: string;
  walletType: WalletType;
  name: string;
  type: GoalType;
  amount: number;           // VNĐ
  dueDate: string;          // "2026-04-30"
  supplier?: string;
  isPaid: boolean;
  recurrence: Recurrence;
  createdAt: string;
}

// ─── Forecast ─────────────────────────────────────────────────────────────────
export interface ForecastDay {
  date: string;
  projectedBalance: number;
  delta: number;            // positive = net income, negative = net expense
  isWarning: boolean;
  events: string[];         // labels: "Tiền mặt bằng", "Trả lương", etc.
}

export type ForecastRange = 30 | 60 | 90;

// ─── Aggregates ───────────────────────────────────────────────────────────────
export interface WalletSummary {
  walletType: WalletType;
  balance: number;          // sum of income - expense, excluding transfers
  totalIncome: number;
  totalExpense: number;
  period: "today" | "this_month" | "all_time";
}

// ─── Notifications ────────────────────────────────────────────────────────────
export type AlertType = "health_gym" | "health_sleep" | "finance_cashflow" | "finance_debt";

export interface LifeOSAlert {
  id: string;
  userId: string;
  type: AlertType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

// ─── Schedule ─────────────────────────────────────────────────────────────────
export type TaskCode = "FT" | "PJ" | "B" | "P";

export interface ScheduleEntry {
  id: string;
  userId: string;
  date: string;        // "2026-04-19"
  startTime: string;   // "09:00"
  endTime: string;     // "10:30"
  title: string;
  type: TaskCode;
  description?: string;
  location?: string;
  isDone: boolean;
  createdAt: string;
}
