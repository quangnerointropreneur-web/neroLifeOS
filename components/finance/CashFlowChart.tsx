"use client";
import React from "react";
import { ForecastDay, ForecastRange } from "@/lib/types";
import { fmtVND } from "@/lib/forecast";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

interface CashFlowChartProps {
  forecast: ForecastDay[];
  range: ForecastRange;
  onRangeChange: (r: ForecastRange) => void;
  warningThreshold: number;
}

export default function CashFlowChart({
  forecast,
  range,
  onRangeChange,
  warningThreshold,
}: CashFlowChartProps) {
  if (!forecast.length) return null;

  const W = 340;
  const H = 120;
  const PAD = { top: 10, right: 12, bottom: 24, left: 0 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const balances = forecast.map((d) => d.projectedBalance);
  const minB = Math.min(...balances, 0);
  const maxB = Math.max(...balances, warningThreshold * 1.2);

  const toX = (i: number) => PAD.left + (i / (forecast.length - 1)) * innerW;
  const toY = (v: number) =>
    PAD.top + innerH - ((v - minB) / (maxB - minB)) * innerH;

  const pathD = forecast
    .map((d, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(d.projectedBalance).toFixed(1)}`)
    .join(" ");

  // Area path (fill)
  const areaD =
    pathD +
    ` L ${toX(forecast.length - 1).toFixed(1)} ${(PAD.top + innerH).toFixed(1)} L ${PAD.left.toFixed(1)} ${(PAD.top + innerH).toFixed(1)} Z`;

  // Warning threshold line y
  const warnY = toY(warningThreshold);

  // Pick ~5 tick labels
  const tickIndices = [0, Math.floor(forecast.length * 0.25), Math.floor(forecast.length * 0.5), Math.floor(forecast.length * 0.75), forecast.length - 1];

  return (
    <div>
      {/* Range selector */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {([30, 60, 90] as ForecastRange[]).map((r) => (
          <button
            key={r}
            onClick={() => onRangeChange(r)}
            style={{
              padding: "4px 12px",
              borderRadius: 20,
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              background: range === r ? "#3b82f6" : "rgba(255,255,255,0.08)",
              color: range === r ? "white" : "rgba(255,255,255,0.5)",
              transition: "all 0.2s",
            }}
          >
            {r}d
          </button>
        ))}
      </div>

      {/* SVG Chart */}
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        {/* Warning threshold dashed line */}
        {warnY > PAD.top && warnY < PAD.top + innerH && (
          <>
            <line
              x1={PAD.left}
              y1={warnY}
              x2={PAD.left + innerW}
              y2={warnY}
              stroke="#f59e0b"
              strokeWidth={1}
              strokeDasharray="4 3"
              opacity={0.6}
            />
            <text x={PAD.left + innerW - 2} y={warnY - 3} fontSize={8} fill="#f59e0b" textAnchor="end" opacity={0.8}>
              Ngưỡng {fmtVND(warningThreshold)}
            </text>
          </>
        )}

        {/* Warning zones (red dots) */}
        {forecast.map((d, i) =>
          d.isWarning ? (
            <circle
              key={i}
              cx={toX(i)}
              cy={toY(d.projectedBalance)}
              r={2.5}
              fill="#ef4444"
              opacity={0.8}
            />
          ) : null
        )}

        {/* Area fill */}
        <path d={areaD} fill="url(#areaGrad)" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* X-axis ticks */}
        {tickIndices.map((idx) => {
          const d = forecast[idx];
          if (!d) return null;
          const x = toX(idx);
          return (
            <text
              key={idx}
              x={x}
              y={H - 4}
              fontSize={8}
              fill="rgba(255,255,255,0.3)"
              textAnchor="middle"
            >
              {format(parseISO(d.date), "dd/MM", { locale: vi })}
            </text>
          );
        })}
      </svg>

      {/* End balance */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11 }}>
        <span style={{ color: "rgba(255,255,255,0.4)" }}>Số dư cuối kỳ</span>
        <span
          style={{
            fontWeight: 700,
            color: forecast[forecast.length - 1]?.isWarning ? "#ef4444" : "#34d399",
          }}
        >
          {fmtVND(forecast[forecast.length - 1]?.projectedBalance ?? 0)}
        </span>
      </div>
    </div>
  );
}
