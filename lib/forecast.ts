// =============================================================================
// Cash Flow Forecast Algorithm — Nero Phết 30/60/90 days
// =============================================================================
import { addDays, format, isSameDay, parseISO } from "date-fns";
import { FinancialGoal, ForecastDay, ForecastRange, Transaction } from "./types";

// Format VNĐ
export function fmtVND(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000)
    return (amount / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + " tỷ";
  if (abs >= 1_000_000)
    return (amount / 1_000_000).toFixed(1).replace(/\.0$/, "") + " tr";
  if (abs >= 1_000)
    return (amount / 1_000).toFixed(0) + "k";
  return amount.toLocaleString("vi-VN");
}

// ─── Current Balance (from transactions) ────────────────────────────────────
export function computeBalance(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => {
    if (t.type === "income" || t.type === "transfer_in") return sum + t.amount;
    if (t.type === "expense" || t.type === "transfer_out") return sum - t.amount;
    return sum;
  }, 0);
}

// ─── Main Forecast Function ──────────────────────────────────────────────────
export function forecastCashFlow(
  currentBalance: number,
  goals: FinancialGoal[],
  range: ForecastRange,
  warningThresholdVND: number = 5_000_000
): ForecastDay[] {
  const today = new Date();
  const result: ForecastDay[] = [];
  let runningBalance = currentBalance;

  for (let i = 0; i < range; i++) {
    const day = addDays(today, i);
    const dateStr = format(day, "yyyy-MM-dd");
    const dayOfMonth = day.getDate();
    let delta = 0;
    const events: string[] = [];

    for (const goal of goals) {
      if (goal.walletType !== "nero_phet" || goal.isPaid) continue;

      let hits = false;

      if (goal.recurrence === "monthly") {
        // Fire on same day-of-month
        const dueDay = parseISO(goal.dueDate).getDate();
        if (dayOfMonth === dueDay) hits = true;
      } else if (goal.recurrence === "weekly") {
        const dueDayOfWeek = parseISO(goal.dueDate).getDay();
        if (day.getDay() === dueDayOfWeek) hits = true;
      } else {
        // once
        if (isSameDay(parseISO(goal.dueDate), day)) hits = true;
      }

      if (hits) {
        if (goal.type === "revenue_forecast") {
          delta += goal.amount;
          events.push(`📈 ${goal.name}`);
        } else if (goal.type === "fixed_expense") {
          delta -= goal.amount;
          events.push(`📌 ${goal.name}`);
        } else if (goal.type === "debt") {
          delta -= goal.amount;
          events.push(`⚠️ Nợ: ${goal.supplier ?? goal.name}`);
        }
      }
    }

    runningBalance += delta;

    result.push({
      date: dateStr,
      projectedBalance: Math.round(runningBalance),
      delta: Math.round(delta),
      isWarning: runningBalance < warningThresholdVND,
      events,
    });
  }

  return result;
}

// ─── Summary Stats ───────────────────────────────────────────────────────────
export function forecastSummary(forecast: ForecastDay[]) {
  const lowestDay = forecast.reduce((min, d) =>
    d.projectedBalance < min.projectedBalance ? d : min
  );
  const warningDays = forecast.filter((d) => d.isWarning).length;
  const firstWarning = forecast.find((d) => d.isWarning);

  return {
    lowestBalance: lowestDay.projectedBalance,
    lowestDate: lowestDay.date,
    warningDays,
    firstWarningDate: firstWarning?.date ?? null,
    endBalance: forecast[forecast.length - 1]?.projectedBalance ?? 0,
  };
}
