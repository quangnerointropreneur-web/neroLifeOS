"use client";
import React, { useState } from "react";
import { FinancialGoal } from "@/lib/types";
import { fmtVND } from "@/lib/forecast";
import { format, parseISO, isPast } from "date-fns";
import { vi } from "date-fns/locale";
import { updateFinancialGoal } from "@/lib/service";
import { Check, Clock, AlertTriangle } from "lucide-react";

interface DebtListProps { goals: FinancialGoal[]; }

export default function DebtList({ goals }: DebtListProps) {
  const debts = goals.filter((g) => g.type === "debt" && !g.isPaid);
  const [paying, setPaying] = useState<string | null>(null);

  if (!debts.length) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: 13 }}>
        ✅ Không có công nợ đang mở
      </div>
    );
  }

  const handlePay = async (id: string) => {
    setPaying(id);
    await updateFinancialGoal(id, { isPaid: true });
    setPaying(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {debts.map((debt) => {
        const overdue = isPast(parseISO(debt.dueDate));
        return (
          <div
            key={debt.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 12,
              background: overdue ? "rgba(239,68,68,0.06)" : "var(--bg-card)",
              border: `1px solid ${overdue ? "rgba(239,68,68,0.2)" : "var(--border)"}`,
              transition: "background 0.3s",
            }}
          >
            <div style={{ width: 32, height: 32, borderRadius: 8, background: overdue ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {overdue ? <AlertTriangle size={15} color="#ef4444" /> : <Clock size={15} color="#f59e0b" />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {debt.supplier ?? debt.name}
              </div>
              <div style={{ fontSize: 11, color: overdue ? "var(--accent-red)" : "var(--text-muted)" }}>
                {overdue ? "⚠ Quá hạn " : ""}{format(parseISO(debt.dueDate), "dd/MM/yyyy", { locale: vi })}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: overdue ? "var(--accent-red)" : "var(--accent-amber)" }}>
                {fmtVND(debt.amount)}
              </div>
              <button
                onClick={() => handlePay(debt.id)}
                disabled={paying === debt.id}
                style={{ marginTop: 4, padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(52,211,153,0.3)", background: "rgba(52,211,153,0.08)", color: "#34d399", fontSize: 10, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}
              >
                <Check size={9} /> Đã trả
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
