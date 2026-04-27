"use client";

import React, { useState } from "react";
import { useLifeOS } from "@/context/LifeOSContext";
import ProgressRing from "@/components/ui/ProgressRing";
import HealthPillars from "@/components/health/HealthPillars";
import WalletCard from "@/components/finance/WalletCard";
import CashFlowChart from "@/components/finance/CashFlowChart";
import DebtList from "@/components/finance/DebtList";
import QuickLogModal from "@/components/QuickLogModal";
import { scoreToColor, scoreToLabel } from "@/lib/scoring";
import { fmtVND } from "@/lib/forecast";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Transaction } from "@/lib/types";
import { Bell, ChevronRight } from "lucide-react";
import Link from "next/link";

function computeWalletStats(txs: Transaction[]) {
  const totalIncome = txs
    .filter((t) => t.type === "income" || t.type === "transfer_in")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = txs
    .filter((t) => t.type === "expense" || t.type === "transfer_out")
    .reduce((s, t) => s + t.amount, 0);
  return { totalIncome, totalExpense };
}

export default function HomePage() {
  const {
    settings,
    todayLog,
    recentLogs,
    todayScore,
    personalTxs,
    neroPhetTxs,
    goals,
    personalBalance,
    neroPhetBalance,
    forecastRange,
    setForecastRange,
    forecast,
    loading,
  } = useLifeOS();

  const [showQuickLog, setShowQuickLog] = useState(false);
  const [quickLogWallet, setQuickLogWallet] = useState<"personal" | "nero_phet" | null>(null);

  const personalStats = computeWalletStats(personalTxs);
  const neroPhetStats = computeWalletStats(neroPhetTxs);

  const dateStr = format(new Date(), "EEEE, dd/MM/yyyy", { locale: vi });
  const totalAssets = personalBalance + neroPhetBalance;

  const warningDays = forecast.filter((d) => d.isWarning).length;
  const openDebts = goals.filter((g) => g.type === "debt" && !g.isPaid);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80dvh", gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid var(--border-strong)", borderTop: "3px solid var(--accent-violet)", animation: "spin 0.8s linear infinite" }} />
        <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Đang tải LifeOS...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <div
        className="animate-fadeIn"
        style={{ display: "flex", flexDirection: "column", gap: 0 }}
      >
        {/* ── HERO HEADER ─────────────────────────────────────────── */}
        <div
          style={{
            background: "var(--hero-bg)",
            padding: "32px 20px 28px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Glow blob */}
          <div style={{ position: "absolute", top: -40, right: -20, width: 180, height: 180, borderRadius: "50%", background: "var(--hero-blob)", filter: "blur(40px)" }} />

          {/* Top bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
              position: "relative",
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 2 }}>{dateStr}</div>
              <div style={{ fontSize: 22, fontWeight: 900, background: "linear-gradient(135deg,#818cf8,#60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                LifeOS {settings?.avatarEmoji ?? "🦁"}
              </div>
            </div>
            <button style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 10, cursor: "pointer", color: "var(--text-secondary)" }}>
              <Bell size={18} />
            </button>
          </div>

          {/* Today's Score — big ring */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              position: "relative",
            }}
          >
            <ProgressRing
              size={130}
              strokeWidth={12}
              progress={todayScore.total}
              color={scoreToColor(todayScore.total)}
            >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: scoreToColor(todayScore.total), lineHeight: 1 }}>{todayScore.total}</div>
                  <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>/ 100</div>
                </div>
            </ProgressRing>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
                {scoreToLabel(todayScore.total)}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 14 }}>Today&apos;s Performance Score</div>

              {/* Mini breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {[
                  { label: "Gym", pts: todayScore.gym, max: 35, color: "#818cf8" },
                  { label: "Protein", pts: todayScore.nutrition, max: 35, color: "#34d399" },
                  { label: "Sleep", pts: todayScore.sleep, max: 30, color: "#60a5fa" },
                ].map((p) => (
                  <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", width: 40, flexShrink: 0 }}>{p.label}</div>
                    <div style={{ flex: 1, height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(p.pts / p.max) * 100}%`, background: p.color, borderRadius: 2, transition: "width 1s ease" }} />
                    </div>
                    <div style={{ fontSize: 10, color: p.color, fontWeight: 700, width: 24, textAlign: "right" }}>{p.pts}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Total assets strip */}
          <div className="t-pill" style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Tổng tài sản</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: totalAssets >= 0 ? "var(--accent-emerald)" : "var(--accent-red)", letterSpacing: "-0.5px", marginTop: 2 }}>{fmtVND(totalAssets)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Nero Phết</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: neroPhetBalance >= 0 ? "var(--accent-emerald)" : "var(--accent-red)" }}>{fmtVND(neroPhetBalance)}</div>
            </div>
          </div>
        </div>

        {/* ── CONTENT ────────────────────────────────────────────── */}
        <div
          style={{
            padding: "20px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {/* ── HEALTH PILLARS ─────────────────────────────────────── */}
          <section>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <div className="section-title">🏃 Sức Khỏe Hôm Nay</div>
              <Link
                href="/health"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  fontSize: 12,
                  color: "var(--accent-violet)",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Xem thêm <ChevronRight size={14} />
              </Link>
            </div>
            <HealthPillars
              score={todayScore}
              settings={settings}
              gymCompleted={todayLog?.gym?.completed}
              proteinG={todayLog?.nutrition?.proteinG}
              sleepH={todayLog?.sleep?.hours}
            />
          </section>

          {/* ── WALLETS ────────────────────────────────────────────── */}
          <section>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <div className="section-title">💰 Ví Tiền</div>
              <Link
                href="/finance"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  fontSize: 12,
                  color: "var(--accent-emerald)",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Chi tiết <ChevronRight size={14} />
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <WalletCard
                walletType="personal"
                balance={personalBalance}
                totalIncome={personalStats.totalIncome}
                totalExpense={personalStats.totalExpense}
                onAddIncome={() => setShowQuickLog(true)}
                onAddExpense={() => setShowQuickLog(true)}
                onTransfer={() => setShowQuickLog(true)}
              />
              <WalletCard
                walletType="nero_phet"
                balance={neroPhetBalance}
                totalIncome={neroPhetStats.totalIncome}
                totalExpense={neroPhetStats.totalExpense}
                onAddIncome={() => setShowQuickLog(true)}
                onAddExpense={() => setShowQuickLog(true)}
                onTransfer={() => setShowQuickLog(true)}
              />
            </div>
          </section>

          {/* ── CASH FLOW FORECAST ─────────────────────────────────── */}
          <section>
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <div className="section-title">📈 Dự Báo Nero Phết</div>
                {warningDays > 0 && (
                  <span
                    style={{
                      fontSize: 11,
                      padding: "3px 8px",
                      borderRadius: 20,
                      background: "rgba(239,68,68,0.12)",
                      border: "1px solid rgba(239,68,68,0.25)",
                      color: "#ef4444",
                      fontWeight: 600,
                    }}
                  >
                    ⚠ {warningDays} ngày cảnh báo
                  </span>
                )}
              </div>
            </div>
            <div className="t-section">
              <CashFlowChart
                forecast={forecast}
                range={forecastRange}
                onRangeChange={setForecastRange}
                warningThreshold={settings?.cashFlowWarningThresholdVND ?? 5_000_000}
              />
            </div>
          </section>

          {/* ── DEBTS ──────────────────────────────────────────────── */}
          {openDebts.length > 0 && (
            <section>
              <div className="section-title" style={{ marginBottom: 12 }}>
                ⚠️ Công Nợ ({openDebts.length})
              </div>
              <DebtList goals={goals} />
            </section>
          )}
        </div>
      </div>

      {/* ── FAB Quick Log ───────────────────────────────────────────── */}
      <button className="fab" onClick={() => setShowQuickLog(true)} id="fab-quick-log" title="Quick Log">
        +
      </button>

      {/* ── Modal ───────────────────────────────────────────────────── */}
      {showQuickLog && <QuickLogModal onClose={() => setShowQuickLog(false)} />}
    </>
  );
}
