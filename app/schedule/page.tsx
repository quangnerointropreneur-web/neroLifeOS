"use client";
import React, { useState, useMemo, useEffect } from "react";
import ScheduleTimeline from "@/components/schedule/ScheduleTimeline";
import AddScheduleModal, { TASK_TYPE_META } from "@/components/schedule/AddScheduleModal";
import { ScheduleEntry, TaskCode } from "@/lib/types";
import { subscribeScheduleRange } from "@/lib/service";
import { format, subDays, addDays, startOfWeek, isSameDay, isToday } from "date-fns";
import { vi } from "date-fns/locale";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

export default function SchedulePage() {
  const [activeDateObj, setActiveDateObj] = useState(new Date());
  // Base date to compute the active week (Monday -> Sunday)
  const [weekBaseDate, setWeekBaseDate] = useState(new Date());

  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editEntry, setEditEntry] = useState<ScheduleEntry | null>(null);

  // Compute the 7 days of the current viewed week (starts on Monday)
  const weekStart = startOfWeek(weekBaseDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  const weekEnd = weekDays[6];

  // Fetch data for the current viewed week
  useEffect(() => {
    const fromStr = format(weekStart, "yyyy-MM-dd");
    const toStr = format(weekEnd, "yyyy-MM-dd");
    const unsub = subscribeScheduleRange(fromStr, toStr, setScheduleEntries);
    return unsub;
  }, [weekStart, weekEnd]);

  const activeDateStr = format(activeDateObj, "yyyy-MM-dd");

  // Filter entries for the selected date
  const dayEntries = useMemo(
    () => scheduleEntries.filter((e) => e.date === activeDateStr),
    [scheduleEntries, activeDateStr]
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

  const nextWeek = () => setWeekBaseDate(addDays(weekBaseDate, 7));
  const prevWeek = () => setWeekBaseDate(subDays(weekBaseDate, 7));
  const goToToday = () => {
    const today = new Date();
    setWeekBaseDate(today);
    setActiveDateObj(today);
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>
                Lịch Trình
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "white", textTransform: "capitalize" }}>
                {format(weekStart, "MMMM, yyyy", { locale: vi })}
              </div>
            </div>
            <button onClick={goToToday} style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "white", cursor: "pointer"
            }}>
              Hôm nay
            </button>
          </div>

          {/* Week Strip Navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
            <button onClick={prevWeek} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: 4 }}>
              <ChevronLeft size={20} />
            </button>
            <div style={{ flex: 1, display: "flex", justifyContent: "space-between" }}>
               {weekDays.map((d, i) => {
                 const isSel = isSameDay(d, activeDateObj);
                 const hasData = scheduleEntries.some(e => e.date === format(d, "yyyy-MM-dd"));
                 const isTdy = isToday(d);
                 return (
                   <button
                     key={i}
                     onClick={() => setActiveDateObj(d)}
                     style={{
                       display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                       padding: "8px 4px", borderRadius: 12, cursor: "pointer",
                       background: isSel ? "rgba(129,140,248,0.15)" : "transparent",
                       border: `1px solid ${isSel ? "#818cf8" : "transparent"}`,
                       minWidth: 38,
                     }}
                   >
                     <span style={{ fontSize: 11, fontWeight: 600, color: isSel ? "#818cf8" : "rgba(255,255,255,0.4)" }}>
                       {["T2", "T3", "T4", "T5", "T6", "T7", "CN"][i]}
                     </span>
                     <span style={{ fontSize: 15, fontWeight: isSel ? 800 : 500, color: isSel ? "white" : "rgba(255,255,255,0.7)", position: "relative" }}>
                       {format(d, "d")}
                       {isTdy && !isSel && <div style={{position: "absolute", bottom: -8, left: 6, width: 4, height: 4, borderRadius: 2, background: "#818cf8"}}/>}
                     </span>
                     {hasData && !isSel && (
                       <div style={{ width: 4, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.3)", marginTop: 2 }} />
                     )}
                   </button>
                 );
               })}
            </div>
            <button onClick={nextWeek} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: 4 }}>
              <ChevronRight size={20} />
            </button>
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
            selectedDate={activeDateStr}
            isToday={isSameDay(activeDateObj, new Date())}
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
          initialDate={activeDateStr}
          entry={editEntry ?? undefined}
          onClose={() => { setShowAddModal(false); setEditEntry(null); }}
        />
      )}
    </>
  );
}
