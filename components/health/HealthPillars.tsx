"use client";
import React from "react";
import ProgressRing from "@/components/ui/ProgressRing";
import { ScoreBreakdown } from "@/lib/scoring";
import { UserSettings } from "@/lib/types";

interface HealthPillarsProps {
  score: ScoreBreakdown;
  settings: UserSettings | null;
  gymCompleted?: boolean;
  proteinG?: number;
  sleepH?: number;
}

const pillars = [
  {
    key: "gym" as const,
    label: "Gym",
    emoji: "🏋️",
    max: 35,
    color: "#818cf8",
    gradient: "linear-gradient(135deg,#818cf8,#6366f1)",
  },
  {
    key: "nutrition" as const,
    label: "Protein",
    emoji: "🥩",
    max: 35,
    color: "#34d399",
    gradient: "linear-gradient(135deg,#34d399,#10b981)",
  },
  {
    key: "sleep" as const,
    label: "Sleep",
    emoji: "🌙",
    max: 30,
    color: "#60a5fa",
    gradient: "linear-gradient(135deg,#60a5fa,#3b82f6)",
  },
];

export default function HealthPillars({
  score,
  settings,
  gymCompleted,
  proteinG,
  sleepH,
}: HealthPillarsProps) {
  const getSubLabel = (key: "gym" | "nutrition" | "sleep") => {
    if (key === "gym") return gymCompleted ? "Đã tập ✓" : "Chưa tập";
    if (key === "nutrition")
      return proteinG !== undefined
        ? `${proteinG}g / ${settings?.proteinTargetG ?? 160}g`
        : "Chưa nhập";
    if (key === "sleep")
      return sleepH !== undefined
        ? `${sleepH}h / ${settings?.sleepTargetH ?? 7.5}h`
        : "Chưa nhập";
    return "";
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12,
      }}
    >
      {pillars.map((p) => {
        const pts = score[p.key];
        const pct = (pts / p.max) * 100;
        return (
          <div
            key={p.key}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
              padding: "16px 12px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <ProgressRing
              size={80}
              strokeWidth={8}
              progress={pct}
              color={p.color}
            >
              <span style={{ fontSize: 22 }}>{p.emoji}</span>
            </ProgressRing>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                {p.label}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: p.color,
                  fontWeight: 600,
                  marginTop: 2,
                }}
              >
                {pts} / {p.max}pts
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.4)",
                  marginTop: 2,
                }}
              >
                {getSubLabel(p.key)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
