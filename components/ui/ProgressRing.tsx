"use client";
import React from "react";

interface ProgressRingProps {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0–100
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
  animated?: boolean;
}

export default function ProgressRing({
  size = 120,
  strokeWidth = 10,
  progress,
  color = "#10b981",
  trackColor = "rgba(255,255,255,0.08)",
  children,
  animated = true,
}: ProgressRingProps) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(Math.max(progress, 0), 100) / 100) * circ;
  const center = size / 2;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={
            animated
              ? { transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)" }
              : undefined
          }
        />
      </svg>
      {/* Center content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </div>
  );
}
