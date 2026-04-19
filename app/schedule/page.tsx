"use client";
import React, { useState, useMemo } from "react";
import { useLifeOS } from "@/context/LifeOSContext";
import ScheduleTimeline from "@/components/schedule/ScheduleTimeline";
import AddScheduleModal, { TASK_TYPE_META } from "@/components/schedule/AddScheduleModal";
import { ScheduleEntry, TaskCode } from "@/lib/types";
import { format, subDays, addDays } from "date-fns";
import { vi } from "date-fns/locale";
import { Plus } from "lucide-react";

const todayDate = new Date();
const dates = [
  subDays(todayDate, 1), // Yesterday
  todayDate,             // Today
  addDays(todayDate, 1), // Tomorrow
];

const DATE_LABELS = ["Hôm qua", "Hôm nay", "Ngày mai"];
const DATE_EMOJIS = ["⬅️", "⚡", "➡️"];

export default function SchedulePage() {
  const { scheduleEntries } = useLifeOS();
  const [activeIdx, setActiveIdx] = useState(1); // default: Today
  const [showAddModal, setShowAddModal] = useState(false);
  const [editEntry, setEditEntry] = useState<ScheduleEntry | null>(null);

  const activeDate = format(dates[activeIdx], "yyyy-MM-dd");

  // Filter entries for the selected date
  const dayEntries = useMemo(
    () => scheduleEntries.filter((e) => e.date === activeDate),
    [scheduleEntries, activeDate]
  );

  // Stats for header
  const total = dayEntries.length;
  const done = dayEntries.filter((e) => e.isDone).length;
  const byType: Record<TaskCode, number> = { FT: 0, PJ: 0, B: 0, P: 0 };
  dayEntries.forEach((e) => { byType[e.type]++; });

  const handleEdit = (entry: ScheduleEntry) => setEditEntry(entry);
  const handleAdd = () => {
    setEditEntry(null);
    setShowAddModal(true);
  };

  return (
    <>
      <div className="animate-fadeIn" style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>

        {/* ── HEADER ─────────────────────────────────────────────── */}
        <div style={{
          background: "linear-gradient(160deg,rgba(129,140,248,0.12) 0%,transparent 60%)",
          padding: "28px 20px 0",
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>
            Lịch Trình
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "white", marginBottom: 16 }}>
            Schedule 📅
          </div>

          {/* 3-day tab selector */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8,
            marginBottom: 16,
          }}>
            {dates.map((d, i) => {
              const ds = format(d, "yyyy-MM-dd");
              const cnt = scheduleEntries.filter((e) => e.date === ds).length;
              const isActive = activeIdx === i;
              return (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  style={{
                    borderRadius: 16,
                    border: `1.5px solid ${isActive ? "#818cf8" : "rgba(255,255,255,0.08)"}`,
                    background: isActive ? "rgba(129,140,248,0.14)" : "rgba(255,255,255,0.03)",
                    padding: "10px 6px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                  }}
                >
                  <span style={{ fontSize: 15 }}>{DATE_EMOJIS[i]}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? "#818cf8" : "rgba(255,255,255,0.55)" }}>
                    {DATE_LABELS[i]}
                  </span>
                  <span style={{ fontSize: 10, color: isActive ? "rgba(129,140,248,0.7)" : "rgba(255,255,255,0.3)" }}>
                    {format(d, "dd/MM", { locale: vi })}
                  </span>
                  {cnt > 0 && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, color: isActive ? "white" : "rgba(255,255,255,0.4)",
                      background: isActive ? "#818cf8" : "rgba(255,255,255,0.1)",
                      borderRadius: 10, padding: "1px 6px", marginTop: 2,
                    }}>
                      {cnt} lịch
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Progress + type chips row */}
          {total > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14,
              marginBottom: 16,
            }}>
              {/* Mini progress bar */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color: "rgba(255,255,255,0.45)" }}>Tiến độ ngày</span>
                  <span style={{ color: done === total ? "#34d399" : "#818cf8", fontWeight: 700 }}>
                    {done}/{total}
                  </span>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${total > 0 ? (done / total) * 100 : 0}%`,
                    background: done === total ? "#34d399" : "linear-gradient(90deg,#818cf8,#60a5fa)",
                    borderRadius: 2, transition: "width 0.5s",
                  }} />
                </div>
              </div>

              {/* Type chips */}
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                {(Object.entries(byType) as [TaskCode, number][]).filter(([, c]) => c > 0).map(([code, count]) => {
                  const m = TASK_TYPE_META[code];
                  return (
                    <span key={code} style={{
                      fontSize: 10, fontWeight: 700,
                      color: m.color, background: m.bg,
                      border: `1px solid ${m.border}`,
                      borderRadius: 6, padding: "2px 6px",
                    }}>
                      [{code}]×{count}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── TIMELINE ───────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px 24px" }}>
          <ScheduleTimeline
            entries={dayEntries}
            selectedDate={activeDate}
            isToday={activeIdx === 1}
            onEdit={handleEdit}
            onAdd={handleAdd}
          />
        </div>
      </div>

      {/* ── FAB ────────────────────────────────────────────────── */}
      <button
        className="fab"
        onClick={handleAdd}
        title="Thêm lịch trình"
        style={{
          background: "linear-gradient(135deg,#818cf8,#6366f1)",
        }}
      >
        <Plus size={24} />
      </button>

      {/* ── Add/Edit Modal ─────────────────────────────────────── */}
      {(showAddModal || editEntry) && (
        <AddScheduleModal
          initialDate={activeDate}
          entry={editEntry ?? undefined}
          onClose={() => { setShowAddModal(false); setEditEntry(null); }}
        />
      )}
    </>
  );
}
