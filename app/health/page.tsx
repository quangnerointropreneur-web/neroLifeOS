"use client";
import React, { useState } from "react";
import { useLifeOS } from "@/context/LifeOSContext";
import ProgressRing from "@/components/ui/ProgressRing";
import HealthHeatmap from "@/components/health/HealthHeatmap";
import HealthPillars from "@/components/health/HealthPillars";
import QuickLogModal from "@/components/QuickLogModal";
import { scoreToColor, scoreToLabel } from "@/lib/scoring";
import { format, subDays } from "date-fns";
import { vi } from "date-fns/locale";

export default function HealthPage() {
  const { settings, todayLog, recentLogs, todayScore, loading } = useLifeOS();
  const [showLog, setShowLog] = useState(false);

  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = format(subDays(today, i), "yyyy-MM-dd");
    const log = recentLogs.find((l) => l.date === d);
    if (log && log.score >= 40) streak++;
    else if (i > 0) break;
  }

  const last7 = recentLogs.slice(0, 7);
  const weekAvg = last7.length > 0 ? Math.round(last7.reduce((s, l) => s + l.score, 0) / last7.length) : 0;

  if (loading) return null;

  return (
    <>
      <div className="animate-fadeIn">
        {/* Header */}
        <div style={{ background: "linear-gradient(160deg,rgba(129,140,248,0.1) 0%,transparent 60%)", padding: "28px 20px 20px" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>
            Sức Khỏe
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--text-primary)" }}>
            Health Dashboard 🏋️
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
            {format(new Date(), "EEEE, dd/MM/yyyy", { locale: vi })}
          </div>
        </div>

        <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Score + Stats row */}
          <div style={{ display: "flex", gap: 14, alignItems: "stretch" }}>
            <div className="t-card" style={{ borderRadius: 20, padding: "20px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: "0 0 auto" }}>
              <ProgressRing size={100} strokeWidth={10} progress={todayScore.total} color={scoreToColor(todayScore.total)}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: scoreToColor(todayScore.total) }}>{todayScore.total}</div>
                  <div style={{ fontSize: 9, color: "var(--text-muted)" }}>pts</div>
                </div>
              </ProgressRing>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600, textAlign: "center" }}>
                {scoreToLabel(todayScore.total)}
              </div>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "🔥 Streak",    value: `${streak} ngày`,         color: "#f59e0b" },
                { label: "📅 TB 7 ngày", value: `${weekAvg}pts`,          color: "#818cf8" },
                { label: "📊 Tổng log",  value: `${recentLogs.length} ngày`, color: "#34d399" },
              ].map((s) => (
                <div key={s.label} className="t-pill" style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{s.label}</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Health pillars */}
          <section>
            <div className="section-title" style={{ marginBottom: 12 }}>Hôm Nay</div>
            <HealthPillars score={todayScore} settings={settings} gymCompleted={todayLog?.gym?.completed} proteinG={todayLog?.nutrition?.proteinG} sleepH={todayLog?.sleep?.hours} />
          </section>

          {/* Heatmap */}
          <section>
            <div className="section-title" style={{ marginBottom: 12 }}>Lịch Sử 12 Tuần</div>
            <div className="t-section">
              <HealthHeatmap logs={recentLogs} weeks={12} />
            </div>
          </section>

          {/* Recent logs */}
          <section>
            <div className="section-title" style={{ marginBottom: 12 }}>7 Ngày Gần Đây</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recentLogs.slice(0, 7).map((log) => (
                <div key={log.id} className="t-row" style={{ justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                      {format(new Date(log.date + "T00:00:00"), "EEE, dd/MM", { locale: vi })}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                      {log.gym?.completed ? "🏋️" : "○"}{" "}
                      {log.nutrition ? `🥩${log.nutrition.proteinG}g` : ""}{" "}
                      {log.sleep ? `🌙${log.sleep.hours}h` : ""}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: scoreToColor(log.score) }}>{log.score}</div>
                    <div style={{ fontSize: 9, color: "var(--text-muted)" }}>pts</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <button className="fab" onClick={() => setShowLog(true)} title="Log sức khỏe">+</button>
      {showLog && <QuickLogModal onClose={() => setShowLog(false)} />}
    </>
  );
}
