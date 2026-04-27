"use client";
import React from "react";
import { fmtVND } from "@/lib/forecast";
import { WalletType } from "@/lib/types";
import { TrendingUp, TrendingDown, ArrowLeftRight } from "lucide-react";

interface WalletCardProps {
  walletType: WalletType;
  balance: number;
  totalIncome: number;
  totalExpense: number;
  onAddIncome: () => void;
  onAddExpense: () => void;
  onTransfer?: () => void;
}

const WALLET_META: Record<WalletType, { label: string; emoji: string; primary: string; bgAlpha: string }> = {
  personal:  { label: "Ví Cá Nhân", emoji: "👤", primary: "#818cf8", bgAlpha: "rgba(129,140,248,0.1)" },
  nero_phet: { label: "Nero Phết",  emoji: "🏪", primary: "#34d399", bgAlpha: "rgba(52,211,153,0.1)" },
};

export default function WalletCard({ walletType, balance, totalIncome, totalExpense, onAddIncome, onAddExpense, onTransfer }: WalletCardProps) {
  const meta = WALLET_META[walletType];

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${meta.bgAlpha} 0%, var(--bg-card) 100%)`,
        border: `1px solid ${meta.primary}30`,
        borderRadius: 20,
        padding: "20px 18px",
        transition: "background 0.3s",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: meta.bgAlpha, border: `1px solid ${meta.primary}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
            {meta.emoji}
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>{meta.label}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Tháng này</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: balance >= 0 ? meta.primary : "var(--accent-red)", letterSpacing: "-0.5px" }}>
            {balance < 0 ? "-" : ""}{fmtVND(Math.abs(balance))}
          </div>
          <div style={{ fontSize: 9, color: "var(--text-muted)" }}>Số dư hiện tại</div>
        </div>
      </div>

      {/* Income / Expense */}
      <div style={{ display: "flex", gap: 10, padding: "10px 0", borderTop: `1px solid var(--border)`, borderBottom: `1px solid var(--border)`, marginBottom: 14 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
          <TrendingUp size={14} color="#34d399" />
          <div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Thu</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#34d399" }}>+{fmtVND(totalIncome)}</div>
          </div>
        </div>
        <div className="t-divider-v" />
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, paddingLeft: 10 }}>
          <TrendingDown size={14} color="#f87171" />
          <div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Chi</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f87171" }}>-{fmtVND(totalExpense)}</div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onAddIncome} style={{ flex: 1, padding: "8px 0", borderRadius: 10, border: "1px solid #34d39940", background: "rgba(52,211,153,0.08)", color: "#34d399", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          + Thu
        </button>
        <button onClick={onAddExpense} style={{ flex: 1, padding: "8px 0", borderRadius: 10, border: "1px solid #f8717140", background: "rgba(248,113,113,0.08)", color: "#f87171", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          − Chi
        </button>
        {onTransfer && (
          <button onClick={onTransfer} style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid var(--border)`, background: "var(--bg-card)", color: "var(--text-secondary)", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="Chuyển tiền">
            <ArrowLeftRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
