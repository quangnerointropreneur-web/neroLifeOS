"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  HealthLog,
  Transaction,
  FinancialGoal,
  UserSettings,
  ForecastDay,
  ForecastRange,
  WalletType,
  ScheduleEntry,
} from "@/lib/types";
import {
  getSettings,
  updateSettings,
  subscribeHealthLogs,
  subscribeTransactions,
  subscribeFinancialGoals,
  getTodayLog,
  subscribeScheduleDays,
} from "@/lib/service";
import { computeBalance, forecastCashFlow } from "@/lib/forecast";
import { computeScore, ScoreBreakdown } from "@/lib/scoring";

// Expose ScoreBreakdown from scoring for consumers
export type { ScoreBreakdown };

interface LifeOSContextValue {
  // Settings
  settings: UserSettings | null;
  updateUserSettings: (patch: Partial<UserSettings>) => Promise<void>;

  // Health
  todayLog: HealthLog | null;
  recentLogs: HealthLog[]; // last 90 days
  todayScore: ScoreBreakdown;
  refreshTodayLog: () => Promise<void>;

  // Finance
  personalTxs: Transaction[];
  neroPhetTxs: Transaction[];
  goals: FinancialGoal[];
  personalBalance: number;
  neroPhetBalance: number;

  // Forecast
  forecastRange: ForecastRange;
  setForecastRange: (r: ForecastRange) => void;
  forecast: ForecastDay[];

  // Schedule
  scheduleEntries: ScheduleEntry[];

  // Loading
  loading: boolean;
}

const LifeOSContext = createContext<LifeOSContextValue | null>(null);

export function LifeOSProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [todayLog, setTodayLog] = useState<HealthLog | null>(null);
  const [recentLogs, setRecentLogs] = useState<HealthLog[]>([]);
  const [personalTxs, setPersonalTxs] = useState<Transaction[]>([]);
  const [neroPhetTxs, setNeroPhetTxs] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [forecastRange, setForecastRange] = useState<ForecastRange>(30);
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Load settings once
  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
    });
  }, []);

  const refreshTodayLog = useCallback(async () => {
    const log = await getTodayLog();
    setTodayLog(log);
  }, []);

  // Subscribe health logs (last 90 days)
  useEffect(() => {
    const unsub = subscribeHealthLogs(90, (logs) => {
      setRecentLogs(logs);
      const today = new Date().toISOString().split("T")[0];
      const todayEntry = logs.find((l) => l.date === today) ?? null;
      setTodayLog(todayEntry);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Subscribe personal transactions
  useEffect(() => {
    const unsub = subscribeTransactions("personal", setPersonalTxs);
    return unsub;
  }, []);

  // Subscribe Nero Phết transactions
  useEffect(() => {
    const unsub = subscribeTransactions("nero_phet", setNeroPhetTxs);
    return unsub;
  }, []);

  // Subscribe goals
  useEffect(() => {
    const unsub = subscribeFinancialGoals(setGoals);
    return unsub;
  }, []);

  // Subscribe schedule (yesterday + today + tomorrow)
  useEffect(() => {
    const unsub = subscribeScheduleDays(setScheduleEntries);
    return unsub;
  }, []);

  // Computed values
  const todayScore = computeScore(
    todayLog?.gym,
    todayLog?.nutrition,
    todayLog?.sleep,
    settings ?? undefined
  );

  const personalBalance = computeBalance(personalTxs);
  const neroPhetBalance = computeBalance(neroPhetTxs);

  const forecast = forecastCashFlow(
    neroPhetBalance,
    goals,
    forecastRange,
    settings?.cashFlowWarningThresholdVND ?? 5_000_000
  );

  const updateUserSettings = useCallback(
    async (patch: Partial<UserSettings>) => {
      await updateSettings(patch);
      setSettings((prev) => (prev ? { ...prev, ...patch } : prev));
    },
    []
  );

  return (
    <LifeOSContext.Provider
      value={{
        settings,
        updateUserSettings,
        todayLog,
        recentLogs,
        todayScore,
        refreshTodayLog,
        personalTxs,
        neroPhetTxs,
        goals,
        personalBalance,
        neroPhetBalance,
        forecastRange,
        setForecastRange,
        forecast,
        scheduleEntries,
        loading,
      }}
    >
      {children}
    </LifeOSContext.Provider>
  );
}

export function useLifeOS(): LifeOSContextValue {
  const ctx = useContext(LifeOSContext);
  if (!ctx) throw new Error("useLifeOS must be used inside LifeOSProvider");
  return ctx;
}
