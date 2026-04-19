"use client";
import React from "react";
import { HealthLog } from "@/lib/types";
import { scoreToColor } from "@/lib/scoring";
import { format, subDays, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

interface HealthHeatmapProps {
  logs: HealthLog[];
  weeks?: number; // default 12
}

export default function HealthHeatmap({ logs, weeks = 12 }: HealthHeatmapProps) {
  const totalDays = weeks * 7;
  const today = new Date();

  // Build date → score map
  const scoreMap: Record<string, number> = {};
  for (const log of logs) {
    scoreMap[log.date] = log.score;
  }

  // Build grid: columns = weeks, rows = 7 days (Mon-Sun)
  const days: Array<{ date: string; score: number | null; label: string }> = [];
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = subDays(today, i);
    const ds = format(d, "yyyy-MM-dd");
    days.push({
      date: ds,
      score: scoreMap[ds] !== undefined ? scoreMap[ds] : null,
      label: format(d, "dd/MM", { locale: vi }),
    });
  }

  const cellSize = 13;
  const gap = 3;

  return (
    <div>
      {/* Day labels */}
      <div style={{ display: "flex", gap: gap, marginBottom: 4 }}>
        {["T2","T3","T4","T5","T6","T7","CN"].map((d) => (
          <div
            key={d}
            style={{
              width: cellSize,
              fontSize: 9,
              color: "rgba(255,255,255,0.3)",
              textAlign: "center",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid — group by week */}
      <div style={{ display: "flex", gap, flexWrap: "wrap", maxWidth: weeks * (cellSize + gap) }}>
        {Array.from({ length: weeks }).map((_, wi) => (
          <div key={wi} style={{ display: "flex", flexDirection: "column", gap }}>
            {days.slice(wi * 7, wi * 7 + 7).map((day) => (
              <div
                key={day.date}
                title={`${day.label}: ${day.score !== null ? day.score + "đ" : "Chưa nhập"}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  borderRadius: 3,
                  background:
                    day.score === null
                      ? "rgba(255,255,255,0.06)"
                      : scoreToColor(day.score) + "cc",
                  cursor: "default",
                  transition: "transform 0.1s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "scale(1.3)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Ít</span>
        {[0, 40, 70, 90].map((s) => (
          <div
            key={s}
            style={{
              width: cellSize,
              height: cellSize,
              borderRadius: 3,
              background: s === 0 ? "rgba(255,255,255,0.06)" : scoreToColor(s) + "cc",
            }}
          />
        ))}
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Nhiều</span>
      </div>
    </div>
  );
}
