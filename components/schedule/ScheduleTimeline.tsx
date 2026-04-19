"use client";
import React, { useRef, useEffect } from "react";
import { ScheduleEntry } from "@/lib/types";
import { TASK_TYPE_META } from "./AddScheduleModal";
import { updateScheduleEntry, deleteScheduleEntry } from "@/lib/service";
import { format } from "date-fns";
import { Check, Trash2, MapPin, Edit2 } from "lucide-react";

interface ScheduleTimelineProps {
  entries: ScheduleEntry[];
  selectedDate: string;
  isToday: boolean;
  onEdit: (entry: ScheduleEntry) => void;
  onAdd: () => void;
}

// Hour slots 06:00–23:00
const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6..23
const HOUR_H = 56; // px per hour
const LABEL_W = 44; // left column width

function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function durationMin(start: string, end: string): number {
  return Math.max(30, timeToMin(end) - timeToMin(start));
}

export default function ScheduleTimeline({
  entries,
  selectedDate,
  isToday,
  onEdit,
  onAdd,
}: ScheduleTimelineProps) {
  const nowRef = useRef<HTMLDivElement>(null);

  // Scroll to current time on mount
  useEffect(() => {
    if (isToday && nowRef.current) {
      nowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isToday]);

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const startMin = 6 * 60; // 6:00 AM

  const handleToggleDone = async (e: React.MouseEvent, entry: ScheduleEntry) => {
    e.stopPropagation();
    await updateScheduleEntry(entry.id, { isDone: !entry.isDone });
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Xoá lịch này?")) await deleteScheduleEntry(id);
  };

  const timelineH = HOURS.length * HOUR_H;

  return (
    <div style={{ position: "relative" }}>
      {/* Grid */}
      <div style={{ position: "relative", height: timelineH }}>
        {/* Hour rows */}
        {HOURS.map((h) => {
          const top = (h - 6) * HOUR_H;
          const isPast = isToday && h * 60 < nowMin;
          return (
            <div
              key={h}
              style={{
                position: "absolute",
                top,
                left: 0,
                right: 0,
                height: HOUR_H,
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              {/* Time label */}
              <div
                style={{
                  width: LABEL_W,
                  flexShrink: 0,
                  paddingTop: 4,
                  fontSize: 11,
                  color: isPast ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.35)",
                  fontWeight: 600,
                  textAlign: "right",
                  paddingRight: 10,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {String(h).padStart(2, "0")}:00
              </div>

              {/* Divider */}
              <div
                style={{
                  flex: 1,
                  height: 1,
                  marginTop: 8,
                  background: isPast
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(255,255,255,0.07)",
                }}
              />
            </div>
          );
        })}

        {/* "Now" indicator */}
        {isToday && nowMin >= startMin && nowMin < 23 * 60 && (
          <div
            ref={nowRef}
            style={{
              position: "absolute",
              top: ((nowMin - startMin) / 60) * HOUR_H,
              left: LABEL_W,
              right: 0,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
            <div style={{ flex: 1, height: 1.5, background: "linear-gradient(90deg,#ef4444,rgba(239,68,68,0))" }} />
            <span style={{
              position: "absolute",
              left: 12,
              top: -14,
              fontSize: 10,
              fontWeight: 700,
              color: "#ef4444",
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 6,
              padding: "1px 6px",
            }}>
              {format(now, "HH:mm")}
            </span>
          </div>
        )}

        {/* Event blocks */}
        {entries.map((entry) => {
          const meta = TASK_TYPE_META[entry.type];
          const topMin = timeToMin(entry.startTime) - startMin;
          const durMin = durationMin(entry.startTime, entry.endTime);
          const top = (topMin / 60) * HOUR_H;
          const height = Math.max(36, (durMin / 60) * HOUR_H - 4);

          return (
            <div
              key={entry.id}
              onClick={() => onEdit(entry)}
              style={{
                position: "absolute",
                top,
                left: LABEL_W + 6,
                right: 6,
                height,
                borderRadius: 12,
                background: entry.isDone
                  ? "rgba(255,255,255,0.04)"
                  : meta.bg,
                border: `1.5px solid ${entry.isDone ? "rgba(255,255,255,0.08)" : meta.border}`,
                padding: "6px 10px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                cursor: "pointer",
                overflow: "hidden",
                zIndex: 5,
                opacity: entry.isDone ? 0.55 : 1,
                transition: "opacity 0.2s",
              }}
            >
              {/* Left accent bar */}
              <div style={{
                position: "absolute",
                left: 0, top: 0, bottom: 0, width: 3,
                borderRadius: "12px 0 0 12px",
                background: entry.isDone ? "rgba(255,255,255,0.15)" : meta.color,
              }} />

              <div style={{ paddingLeft: 6 }}>
                {/* Type badge + title row */}
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: height > 60 ? 3 : 0 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 800,
                    color: entry.isDone ? "rgba(255,255,255,0.3)" : meta.color,
                    background: entry.isDone ? "rgba(255,255,255,0.05)" : `${meta.color}18`,
                    border: `1px solid ${entry.isDone ? "rgba(255,255,255,0.1)" : meta.border}`,
                    borderRadius: 4, padding: "1px 5px",
                    letterSpacing: "0.5px",
                    flexShrink: 0,
                  }}>
                    [{entry.type}]
                  </span>
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    color: entry.isDone ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.9)",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    textDecoration: entry.isDone ? "line-through" : "none",
                  }}>
                    {entry.title}
                  </span>
                </div>

                {/* Time range */}
                {height > 50 && (
                  <div style={{ fontSize: 10, color: entry.isDone ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.45)", display: "flex", alignItems: "center", gap: 4 }}>
                    🕒 {entry.startTime} – {entry.endTime}
                    {entry.location && (
                      <span style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 4 }}>
                        <MapPin size={9} /> {entry.location}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              {height > 46 && (
                <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", paddingLeft: 6 }}>
                  <button
                    onClick={(e) => handleToggleDone(e, entry)}
                    style={{
                      width: 24, height: 24, borderRadius: 6, border: "none",
                      background: entry.isDone ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.07)",
                      color: entry.isDone ? "#34d399" : "rgba(255,255,255,0.4)",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Check size={12} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(entry); }}
                    style={{
                      width: 24, height: 24, borderRadius: 6, border: "none",
                      background: "rgba(255,255,255,0.07)",
                      color: "rgba(255,255,255,0.4)",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Edit2 size={10} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, entry.id)}
                    style={{
                      width: 24, height: 24, borderRadius: 6, border: "none",
                      background: "rgba(239,68,68,0.08)",
                      color: "rgba(239,68,68,0.5)",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {entries.length === 0 && (
        <div style={{
          position: "absolute",
          top: "30%", left: LABEL_W, right: 0,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          color: "rgba(255,255,255,0.2)", pointerEvents: "none",
        }}>
          <div style={{ fontSize: 32 }}>📅</div>
          <div style={{ fontSize: 12 }}>Chưa có lịch trình</div>
        </div>
      )}
    </div>
  );
}
