"use client";
import React, { useState, useEffect } from "react";
import { useLifeOS } from "@/context/LifeOSContext";
import { useTheme } from "@/components/ui/ThemeProvider";
import { UserSettings } from "@/lib/types";
import { addFinancialGoal } from "@/lib/service";
import { fmtVND } from "@/lib/forecast";
import { format } from "date-fns";
import { Save, Plus, Trash2, Sun, Moon } from "lucide-react";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-input)",
  border: "1px solid var(--border-input)",
  borderRadius: 10,
  padding: "10px 12px",
  color: "var(--text-primary)",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const cardStyle: React.CSSProperties = {
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: 20,
  padding: 18,
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          color: "var(--text-label)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      {children}
      {hint && (
        <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
          {hint}
        </div>
      )}
    </div>
  );
}

// ── Category Manager ──────────────────────────────────────────────────────────
function CategoryManager({
  title,
  emoji,
  items,
  accentColor,
  onAdd,
  onRemove,
}: {
  title: string;
  emoji: string;
  items: string[];
  accentColor: string;
  onAdd: (val: string) => void;
  onRemove: (val: string) => void;
}) {
  const [newCat, setNewCat] = useState("");
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          color: "var(--text-label)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: 8,
        }}
      >
        {emoji} {title}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
        {items.map((cat) => (
          <div
            key={cat}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 10px",
              borderRadius: 20,
              background: `${accentColor}18`,
              border: `1px solid ${accentColor}35`,
              fontSize: 12,
              color: accentColor,
              fontWeight: 500,
            }}
          >
            {cat}
            <button
              onClick={() => onRemove(cat)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: accentColor,
                padding: 0,
                lineHeight: 1,
                opacity: 0.6,
                display: "flex",
              }}
            >
              <Trash2 size={10} />
            </button>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          style={{ ...inputStyle, flex: 1 }}
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          placeholder="Thêm hạng mục mới..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && newCat.trim()) {
              onAdd(newCat.trim());
              setNewCat("");
            }
          }}
        />
        <button
          onClick={() => {
            if (newCat.trim()) {
              onAdd(newCat.trim());
              setNewCat("");
            }
          }}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "none",
            background: `${accentColor}22`,
            color: accentColor,
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 18,
          }}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { settings, updateUserSettings, goals } = useLifeOS();
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState<Partial<UserSettings>>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Goal form
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [goalType, setGoalType] = useState<"fixed_expense" | "revenue_forecast" | "debt">("fixed_expense");
  const [goalWallet, setGoalWallet] = useState<"personal" | "nero_phet">("nero_phet");
  const [goalAmount, setGoalAmount] = useState("");
  const [goalDue, setGoalDue] = useState(format(new Date(), "yyyy-MM-dd"));
  const [goalRecurrence, setGoalRecurrence] = useState<"monthly" | "weekly" | "once">("monthly");
  const [goalSupplier, setGoalSupplier] = useState("");
  const [goalLoading, setGoalLoading] = useState(false);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const set = (key: keyof UserSettings, value: unknown) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateUserSettings(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError("Lưu thất bại. Kiểm tra kết nối Firebase.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddGoal = async () => {
    if (!goalName || !goalAmount) return;
    setGoalLoading(true);
    await addFinancialGoal({
      walletType: goalWallet,
      type: goalType,
      name: goalName,
      amount: Number(goalAmount),
      dueDate: goalDue,
      supplier: goalSupplier || undefined,
      isPaid: false,
      recurrence: goalRecurrence,
    });
    setGoalLoading(false);
    setShowGoalForm(false);
    setGoalName(""); setGoalAmount(""); setGoalSupplier("");
  };

  // Category helpers
  const incCats = form.incomeCategories ?? ["Doanh thu", "Lương", "Freelance", "Lợi nhuận", "Khác"];
  const expCats = form.expenseCategories ?? ["Mặt bằng", "Lương nhân viên", "Nhà cung cấp", "Ăn uống", "Di chuyển", "Marketing", "Khác"];

  const addIncCat = (val: string) => set("incomeCategories", [...incCats.filter(c => c !== val), val]);
  const removeIncCat = (val: string) => set("incomeCategories", incCats.filter(c => c !== val));
  const addExpCat = (val: string) => set("expenseCategories", [...expCats.filter(c => c !== val), val]);
  const removeExpCat = (val: string) => set("expenseCategories", expCats.filter(c => c !== val));

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(160deg,rgba(245,158,11,0.08) 0%,transparent 60%)",
          padding: "28px 20px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              marginBottom: 4,
            }}
          >
            Cài Đặt
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--text-primary)" }}>
            Settings ⚙️
          </div>
        </div>

        {/* Theme Toggle */}
        <button onClick={toggleTheme} className="theme-toggle" title="Chuyển chủ đề">
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          {theme === "dark" ? "Sáng" : "Tối"}
        </button>
      </div>

      <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Profile ──────────────────────────────────────────────── */}
        <section>
          <div className="section-title" style={{ marginBottom: 12 }}>👤 Hồ Sơ</div>
          <div style={cardStyle}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Tên hiển thị">
                <input
                  style={inputStyle}
                  value={form.displayName ?? ""}
                  onChange={(e) => set("displayName", e.target.value)}
                  placeholder="Nero"
                />
              </Field>
              <Field label="Avatar Emoji">
                <input
                  style={inputStyle}
                  value={form.avatarEmoji ?? ""}
                  onChange={(e) => set("avatarEmoji", e.target.value)}
                  placeholder="🦁"
                  maxLength={2}
                />
              </Field>
            </div>
          </div>
        </section>

        {/* ── Health Targets ─────────────────────────────────────── */}
        <section>
          <div className="section-title" style={{ marginBottom: 12 }}>🏋️ Mục Tiêu Sức Khỏe</div>
          <div style={cardStyle}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Protein mục tiêu (g)" hint="VD: 160g/ngày">
                <input
                  style={inputStyle}
                  type="number"
                  value={form.proteinTargetG ?? ""}
                  onChange={(e) => set("proteinTargetG", Number(e.target.value))}
                  min="50"
                  max="400"
                />
              </Field>
              <Field label="Calories (kcal)" hint="VD: 2500 kcal">
                <input
                  style={inputStyle}
                  type="number"
                  value={form.caloriesTargetKcal ?? ""}
                  onChange={(e) => set("caloriesTargetKcal", Number(e.target.value))}
                  min="1000"
                  max="5000"
                />
              </Field>
              <Field label="Giấc ngủ mục tiêu (h)" hint="VD: 7.5h">
                <input
                  style={inputStyle}
                  type="number"
                  step="0.5"
                  value={form.sleepTargetH ?? ""}
                  onChange={(e) => set("sleepTargetH", Number(e.target.value))}
                  min="4"
                  max="12"
                />
              </Field>
              <Field label="Ngày gym/tuần" hint="VD: 5 ngày">
                <input
                  style={inputStyle}
                  type="number"
                  value={form.gymDaysPerWeek ?? ""}
                  onChange={(e) => set("gymDaysPerWeek", Number(e.target.value))}
                  min="1"
                  max="7"
                />
              </Field>
            </div>
          </div>
        </section>

        {/* ── Finance Settings ──────────────────────────────────── */}
        <section>
          <div className="section-title" style={{ marginBottom: 12 }}>💰 Cài Đặt Tài Chính</div>
          <div style={cardStyle}>
            <Field
              label="Ngưỡng Cảnh Báo Dòng Tiền (VNĐ)"
              hint={`Hiện tại: ${fmtVND(form.cashFlowWarningThresholdVND ?? 5_000_000)}`}
            >
              <input
                style={inputStyle}
                type="number"
                value={form.cashFlowWarningThresholdVND ?? ""}
                onChange={(e) => set("cashFlowWarningThresholdVND", Number(e.target.value))}
                placeholder="5000000"
                step="500000"
              />
            </Field>
          </div>
        </section>

        {/* ── Hạng Mục Chi / Thu ──────────────────────────────────── */}
        <section>
          <div className="section-title" style={{ marginBottom: 12 }}>📋 Hạng Mục Chi / Thu</div>
          <div style={cardStyle}>
            <CategoryManager
              title="Hạng mục Thu"
              emoji="📈"
              items={incCats}
              accentColor="#34d399"
              onAdd={addIncCat}
              onRemove={removeIncCat}
            />
            <div style={{ height: 1, background: "var(--border)" }} />
            <CategoryManager
              title="Hạng mục Chi"
              emoji="📉"
              items={expCats}
              accentColor="#f87171"
              onAdd={addExpCat}
              onRemove={removeExpCat}
            />
            <div
              style={{
                background: "rgba(129,140,248,0.06)",
                border: "1px solid rgba(129,140,248,0.15)",
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: 11,
                color: "var(--text-secondary)",
                lineHeight: 1.6,
              }}
            >
              💡 Nhấn <strong>Enter</strong> hoặc nút <strong>+</strong> để thêm. Nhấn 🗑️ để xoá. Nhớ bấm <strong>Lưu Cài Đặt</strong> để cập nhật.
            </div>
          </div>
        </section>

        {/* ── Notifications ─────────────────────────────────────── */}
        <section>
          <div className="section-title" style={{ marginBottom: 12 }}>🔔 Nhắc Nhở</div>
          <div style={cardStyle}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Nhắc Gym lúc" hint="Nếu chưa log Gym">
                <input
                  style={inputStyle}
                  type="time"
                  value={form.notifyGymReminderAt ?? "21:30"}
                  onChange={(e) => set("notifyGymReminderAt", e.target.value)}
                />
              </Field>
              <Field label="Nhắc Sleep lúc" hint="Nếu chưa log Sleep">
                <input
                  style={inputStyle}
                  type="time"
                  value={form.notifySleepReminderAt ?? "22:00"}
                  onChange={(e) => set("notifySleepReminderAt", e.target.value)}
                />
              </Field>
            </div>
          </div>
        </section>

        {/* ── Financial Goals / Forecast Config ────────────────── */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div className="section-title">📌 Chi Phí Cố Định & Dự Báo</div>
            <button
              onClick={() => setShowGoalForm(!showGoalForm)}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                background: "rgba(129,140,248,0.12)", border: "1px solid rgba(129,140,248,0.3)",
                borderRadius: 8, padding: "5px 10px", color: "#818cf8", fontSize: 11, fontWeight: 600, cursor: "pointer",
              }}
            >
              <Plus size={12} /> Thêm
            </button>
          </div>

          {showGoalForm && (
            <div style={{ background: "rgba(129,140,248,0.06)", border: "1px solid rgba(129,140,248,0.15)", borderRadius: 16, padding: 16, marginBottom: 14, display: "flex", flexDirection: "column", gap: 12 }}>
              <Field label="Tên">
                <input style={inputStyle} value={goalName} onChange={(e) => setGoalName(e.target.value)} placeholder="VD: Tiền mặt bằng" />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="Loại">
                  <select style={inputStyle} value={goalType} onChange={(e) => setGoalType(e.target.value as typeof goalType)}>
                    <option value="fixed_expense">📌 Chi cố định</option>
                    <option value="revenue_forecast">📈 Dự báo thu</option>
                    <option value="debt">⚠️ Công nợ</option>
                  </select>
                </Field>
                <Field label="Ví">
                  <select style={inputStyle} value={goalWallet} onChange={(e) => setGoalWallet(e.target.value as typeof goalWallet)}>
                    <option value="nero_phet">🏪 Nero Phết</option>
                    <option value="personal">👤 Cá Nhân</option>
                  </select>
                </Field>
                <Field label="Số tiền (VNĐ)">
                  <input style={inputStyle} type="number" value={goalAmount} onChange={(e) => setGoalAmount(e.target.value)} />
                </Field>
                <Field label="Chu kỳ">
                  <select style={inputStyle} value={goalRecurrence} onChange={(e) => setGoalRecurrence(e.target.value as typeof goalRecurrence)}>
                    <option value="monthly">Hàng tháng</option>
                    <option value="weekly">Hàng tuần</option>
                    <option value="once">Một lần</option>
                  </select>
                </Field>
              </div>
              <Field label="Ngày đáo hạn / ngày trong tháng">
                <input style={inputStyle} type="date" value={goalDue} onChange={(e) => setGoalDue(e.target.value)} />
              </Field>
              {goalType === "debt" && (
                <Field label="Nhà cung cấp">
                  <input style={inputStyle} value={goalSupplier} onChange={(e) => setGoalSupplier(e.target.value)} placeholder="Tên NCC" />
                </Field>
              )}
              <button
                onClick={handleAddGoal}
                disabled={goalLoading}
                style={{ padding: "11px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#818cf8,#6366f1)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
              >
                {goalLoading ? "Đang lưu..." : "Lưu Mục Tiêu"}
              </button>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {goals.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: 13 }}>
                Chưa có mục tiêu nào
              </div>
            ) : (
              goals.map((g) => (
                <div
                  key={g.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                      {g.type === "fixed_expense" ? "📌" : g.type === "revenue_forecast" ? "📈" : "⚠️"} {g.name}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                      {g.recurrence} · {g.walletType === "nero_phet" ? "Nero Phết" : "Cá Nhân"} · {g.dueDate}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: g.type === "revenue_forecast" ? "#34d399" : "#f87171" }}>
                    {g.type === "revenue_forecast" ? "+" : "−"}{fmtVND(g.amount)}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ── Error ─────────────────────────────────────────────── */}
        {error && (
          <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── Save button ─────────────────────────────────────────── */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "15px 0",
            borderRadius: 16,
            border: "none",
            background: saved
              ? "linear-gradient(135deg,#34d399,#10b981)"
              : "linear-gradient(135deg,#818cf8,#6366f1)",
            color: "white",
            fontWeight: 700,
            fontSize: 15,
            cursor: saving ? "not-allowed" : "pointer",
            transition: "background 0.3s",
            marginBottom: 8,
            opacity: saving ? 0.7 : 1,
          }}
        >
          <Save size={18} />
          {saving ? "Đang lưu..." : saved ? "Đã lưu! ✓" : "Lưu Cài Đặt"}
        </button>
      </div>
    </div>
  );
}
