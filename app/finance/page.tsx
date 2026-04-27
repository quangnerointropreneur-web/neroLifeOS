"use client";
import React, { useState } from "react";
import { useLifeOS } from "@/context/LifeOSContext";
import WalletCard from "@/components/finance/WalletCard";
import CashFlowChart from "@/components/finance/CashFlowChart";
import DebtList from "@/components/finance/DebtList";
import QuickLogModal from "@/components/QuickLogModal";
import { fmtVND, forecastSummary } from "@/lib/forecast";
import { Transaction } from "@/lib/types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { deleteTransaction } from "@/lib/service";
import { Trash2 } from "lucide-react";

function computeWalletStats(txs: Transaction[]) {
  const totalIncome  = txs.filter((t) => t.type === "income"  || t.type === "transfer_in").reduce((s, t) => s + t.amount, 0);
  const totalExpense = txs.filter((t) => t.type === "expense"  || t.type === "transfer_out").reduce((s, t) => s + t.amount, 0);
  return { totalIncome, totalExpense };
}

const TYPE_LABEL: Record<string, { label: string; color: string }> = {
  income:       { label: "Thu",         color: "#34d399" },
  expense:      { label: "Chi",         color: "#f87171" },
  transfer_in:  { label: "Nhận chuyển", color: "#60a5fa" },
  transfer_out: { label: "Chuyển đi",   color: "#f59e0b" },
};

export default function FinancePage() {
  const { settings, personalTxs, neroPhetTxs, goals, personalBalance, neroPhetBalance, forecastRange, setForecastRange, forecast } = useLifeOS();
  const [showLog, setShowLog] = useState(false);
  const [activeTab, setActiveTab] = useState<"personal" | "nero_phet">("nero_phet");

  const personalStats = computeWalletStats(personalTxs);
  const neroPhetStats = computeWalletStats(neroPhetTxs);
  const fSummary = forecastSummary(forecast);
  const activeTxs = activeTab === "personal" ? personalTxs : neroPhetTxs;

  const handleDelete = async (id: string) => {
    if (confirm("Xoá giao dịch này?")) await deleteTransaction(id);
  };

  return (
    <>
      <div className="animate-fadeIn">
        {/* Header */}
        <div style={{ background: "linear-gradient(160deg,rgba(52,211,153,0.1) 0%,transparent 60%)", padding: "28px 20px 20px" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>
            Tài Chính
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--text-primary)" }}>Finance Dashboard 💰</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
            {format(new Date(), "MMMM yyyy", { locale: vi })}
          </div>
        </div>

        <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Warning */}
          {fSummary.warningDays > 0 && (
            <div style={{ padding: "14px 16px", borderRadius: 16, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ fontSize: 20 }}>⚠️</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-red)", marginBottom: 3 }}>Cảnh báo dòng tiền Nero Phết</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {fSummary.warningDays} ngày dưới ngưỡng {fmtVND(settings?.cashFlowWarningThresholdVND ?? 5_000_000)}.
                  Số dư thấp nhất: <span style={{ color: "var(--accent-red)", fontWeight: 700 }}>{fmtVND(fSummary.lowestBalance)}</span>{" "}
                  ({fSummary.lowestDate ? format(new Date(fSummary.lowestDate + "T00:00:00"), "dd/MM", { locale: vi }) : ""})
                </div>
              </div>
            </div>
          )}

          {/* Wallets */}
          <section>
            <div className="section-title" style={{ marginBottom: 12 }}>Ví Tiền</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <WalletCard walletType="personal"  balance={personalBalance}  totalIncome={personalStats.totalIncome}  totalExpense={personalStats.totalExpense}  onAddIncome={() => setShowLog(true)} onAddExpense={() => setShowLog(true)} onTransfer={() => setShowLog(true)} />
              <WalletCard walletType="nero_phet" balance={neroPhetBalance} totalIncome={neroPhetStats.totalIncome} totalExpense={neroPhetStats.totalExpense} onAddIncome={() => setShowLog(true)} onAddExpense={() => setShowLog(true)} onTransfer={() => setShowLog(true)} />
            </div>
          </section>

          {/* Cash flow chart */}
          <section>
            <div className="section-title" style={{ marginBottom: 12 }}>Dự Báo Nero Phết</div>
            <div className="t-section">
              <CashFlowChart forecast={forecast} range={forecastRange} onRangeChange={setForecastRange} warningThreshold={settings?.cashFlowWarningThresholdVND ?? 5_000_000} />
            </div>
          </section>

          {/* Debts */}
          <section>
            <div className="section-title" style={{ marginBottom: 12 }}>Công Nợ ({goals.filter((g) => g.type === "debt" && !g.isPaid).length})</div>
            <DebtList goals={goals} />
          </section>

          {/* Transactions */}
          <section>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {(["nero_phet", "personal"] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => setActiveTab(w)}
                  style={{
                    flex: 1, padding: "9px 0", borderRadius: 12,
                    border: `1px solid ${activeTab === w ? (w === "nero_phet" ? "#34d399" : "#818cf8") : "var(--border)"}`,
                    background: activeTab === w ? (w === "nero_phet" ? "rgba(52,211,153,0.1)" : "rgba(129,140,248,0.1)") : "var(--bg-card)",
                    color: activeTab === w ? (w === "nero_phet" ? "#34d399" : "#818cf8") : "var(--text-muted)",
                    fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  {w === "nero_phet" ? "🏪 Nero Phết" : "👤 Cá Nhân"}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {activeTxs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)", fontSize: 13 }}>Chưa có giao dịch nào</div>
              ) : (
                activeTxs.slice(0, 20).map((tx) => {
                  const meta = TYPE_LABEL[tx.type];
                  return (
                    <div key={tx.id} className="t-row" style={{ justifyContent: "space-between" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${meta.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                        {tx.type === "income" ? "📈" : tx.type === "expense" ? "📉" : tx.type === "transfer_in" ? "⬇️" : "⬆️"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tx.description}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{tx.category} · {format(new Date(tx.date + "T00:00:00"), "dd/MM/yyyy")}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: meta.color }}>
                          {tx.type === "expense" || tx.type === "transfer_out" ? "−" : "+"}{fmtVND(tx.amount)}
                        </div>
                        <button onClick={() => handleDelete(tx.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", marginTop: 2, padding: 2 }}>
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>

      <button className="fab" onClick={() => setShowLog(true)} title="Thêm giao dịch">+</button>
      {showLog && <QuickLogModal onClose={() => setShowLog(false)} />}
    </>
  );
}
