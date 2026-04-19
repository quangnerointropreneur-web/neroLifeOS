// =============================================================================
// Firestore Service Layer — LifeOS CRUD
// =============================================================================
import {
  collection,
  doc,
  setDoc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  HealthLog,
  Transaction,
  FinancialGoal,
  UserSettings,
  GymLog,
  NutritionLog,
  SleepLog,
  WalletType,
  ScheduleEntry,
} from "./types";
import { computeScore } from "./scoring";

const USER_ID = "nero_admin"; // Single-user app — can be extended later

// ─── User Settings ────────────────────────────────────────────────────────────
export async function getSettings(): Promise<UserSettings> {
  const ref = doc(db, "lifeOS_settings", USER_ID);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as UserSettings;
  // Default settings
  const defaults: UserSettings = {
    userId: USER_ID,
    displayName: "Nero",
    avatarEmoji: "🦁",
    proteinTargetG: 160,
    caloriesTargetKcal: 2500,
    sleepTargetH: 7.5,
    gymDaysPerWeek: 5,
    cashFlowWarningThresholdVND: 5_000_000,
    notifyGymReminderAt: "21:30",
    notifySleepReminderAt: "22:00",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await setDoc(ref, defaults);
  return defaults;
}

export async function updateSettings(
  patch: Partial<UserSettings>
): Promise<void> {
  const ref = doc(db, "lifeOS_settings", USER_ID);
  await updateDoc(ref, { ...patch, updatedAt: new Date().toISOString() });
}

// ─── Health Logs ─────────────────────────────────────────────────────────────
export async function upsertHealthLog(
  date: string,
  gym?: GymLog,
  nutrition?: NutritionLog,
  sleep?: SleepLog,
  settings?: Partial<UserSettings>
): Promise<void> {
  const scoreBreakdown = computeScore(gym, nutrition, sleep, settings);
  const ref = doc(db, "lifeOS_health", `${USER_ID}_${date}`);
  const existing = await getDoc(ref);
  const now = new Date().toISOString();

  const payload: Omit<HealthLog, "id"> = {
    userId: USER_ID,
    date,
    gym,
    nutrition,
    sleep,
    score: scoreBreakdown.total,
    createdAt: existing.exists() ? (existing.data() as HealthLog).createdAt : now,
    updatedAt: now,
  };

  await setDoc(ref, payload, { merge: true });
}

export function subscribeHealthLogs(
  days: number,
  callback: (logs: HealthLog[]) => void
): () => void {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().split("T")[0];

  const q = query(
    collection(db, "lifeOS_health"),
    where("userId", "==", USER_ID)
  );

  return onSnapshot(q, (snap) => {
    const logs = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as HealthLog))
      .filter((l) => l.date >= sinceStr)
      .sort((a, b) => b.date.localeCompare(a.date));
    callback(logs);
  });
}

export async function getTodayLog(): Promise<HealthLog | null> {
  const today = new Date().toISOString().split("T")[0];
  const ref = doc(db, "lifeOS_health", `${USER_ID}_${today}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as HealthLog;
}

// ─── Transactions ─────────────────────────────────────────────────────────────
export async function addTransaction(
  tx: Omit<Transaction, "id" | "userId" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, "lifeOS_transactions"), {
    ...tx,
    userId: USER_ID,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

/**
 * Create a transfer between personal ↔ nero_phet wallets.
 * Generates two linked transactions.
 */
export async function addTransfer(
  fromWallet: WalletType,
  toWallet: WalletType,
  amount: number,
  description: string,
  date: string
): Promise<void> {
  const batch = writeBatch(db);
  const outRef = doc(collection(db, "lifeOS_transactions"));
  const inRef = doc(collection(db, "lifeOS_transactions"));
  const now = new Date().toISOString();

  batch.set(outRef, {
    userId: USER_ID,
    walletType: fromWallet,
    type: "transfer_out",
    amount,
    category: "transfer",
    description,
    date,
    transferLinkedId: inRef.id,
    createdAt: now,
  });

  batch.set(inRef, {
    userId: USER_ID,
    walletType: toWallet,
    type: "transfer_in",
    amount,
    category: "transfer",
    description,
    date,
    transferLinkedId: outRef.id,
    createdAt: now,
  });

  await batch.commit();
}

export function subscribeTransactions(
  walletType: WalletType | "all",
  callback: (txs: Transaction[]) => void
): () => void {
  const q =
    walletType === "all"
      ? query(collection(db, "lifeOS_transactions"), where("userId", "==", USER_ID))
      : query(
          collection(db, "lifeOS_transactions"),
          where("userId", "==", USER_ID),
          where("walletType", "==", walletType)
        );

  return onSnapshot(q, (snap) => {
    const txs = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Transaction))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 200);
    callback(txs);
  });
}

export async function deleteTransaction(id: string): Promise<void> {
  await deleteDoc(doc(db, "lifeOS_transactions", id));
}

// ─── Financial Goals ─────────────────────────────────────────────────────────
export async function addFinancialGoal(
  goal: Omit<FinancialGoal, "id" | "userId" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, "lifeOS_goals"), {
    ...goal,
    userId: USER_ID,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function updateFinancialGoal(
  id: string,
  patch: Partial<FinancialGoal>
): Promise<void> {
  await updateDoc(doc(db, "lifeOS_goals", id), patch);
}

export async function deleteFinancialGoal(id: string): Promise<void> {
  await deleteDoc(doc(db, "lifeOS_goals", id));
}

export function subscribeFinancialGoals(
  callback: (goals: FinancialGoal[]) => void
): () => void {
  const q = query(
    collection(db, "lifeOS_goals"),
    where("userId", "==", USER_ID)
  );
  return onSnapshot(q, (snap) => {
    const goals = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as FinancialGoal))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    callback(goals);
  });
}

// ─── Schedule ─────────────────────────────────────────────────────────────────
export async function addScheduleEntry(
  entry: Omit<ScheduleEntry, "id" | "userId" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, "lifeOS_schedule"), {
    ...entry,
    userId: USER_ID,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function updateScheduleEntry(
  id: string,
  patch: Partial<ScheduleEntry>
): Promise<void> {
  await updateDoc(doc(db, "lifeOS_schedule", id), patch);
}

export async function deleteScheduleEntry(id: string): Promise<void> {
  await deleteDoc(doc(db, "lifeOS_schedule", id));
}

/** Subscribe to schedule for yesterday, today, and tomorrow */
export function subscribeScheduleDays(
  callback: (entries: ScheduleEntry[]) => void
): () => void {
  // Fetch a 5-day window (yesterday to day-after-tomorrow), filter client-side
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  const fromDate = yesterday.toISOString().split("T")[0];
  const toDate = dayAfterTomorrow.toISOString().split("T")[0];

  const q = query(
    collection(db, "lifeOS_schedule"),
    where("userId", "==", USER_ID)
  );

  return onSnapshot(q, (snap) => {
    const entries = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as ScheduleEntry))
      .filter((e) => e.date >= fromDate && e.date <= toDate)
      .sort((a, b) =>
        a.date === b.date
          ? a.startTime.localeCompare(b.startTime)
          : a.date.localeCompare(b.date)
      );
    callback(entries);
  });
}
