"use client";
import React, { useState } from "react";
import { X, Dumbbell, UtensilsCrossed, Moon, TrendingUp, TrendingDown, ArrowLeftRight } from "lucide-react";
import {
  upsertHealthLog,
  addTransaction,
  addTransfer,
} from "@/lib/service";
import { useLifeOS } from "@/context/LifeOSContext";
import { WalletType, MealLog } from "@/lib/types";
import { useEffect } from "react";
import { format } from "date-fns";

type LogMode =
  | "select"
  | "health_gym"
  | "health_nutrition"
  | "health_sleep"
  | "finance_income"
  | "finance_expense"
  | "finance_transfer";

interface QuickLogModalProps {
  onClose: () => void;
}

const today = format(new Date(), "yyyy-MM-dd");

export default function QuickLogModal({ onClose }: QuickLogModalProps) {
  const { settings, todayLog, refreshTodayLog } = useLifeOS();
  const [mode, setMode] = useState<LogMode>("select");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── Health state ──
  const [gymDone, setGymDone] = useState(todayLog?.gym?.completed ?? false);
  const [gymStartTime, setGymStartTime] = useState(todayLog?.gym?.startTime ?? "17:30");
  const [gymEndTime, setGymEndTime] = useState(todayLog?.gym?.endTime ?? "18:30");
  const [gymMin, setGymMin] = useState(String(todayLog?.gym?.durationMin ?? 60));
  const [gymNote, setGymNote] = useState(todayLog?.gym?.note ?? "");

  const [proteinG, setProteinG] = useState(String(todayLog?.nutrition?.proteinG ?? ""));
  const [caloriesKcal, setCaloriesKcal] = useState(String(todayLog?.nutrition?.caloriesKcal ?? ""));
  const [meals, setMeals] = useState<MealLog[]>(todayLog?.nutrition?.meals ?? []);
  const [mealName, setMealName] = useState("");
  const [mealCal, setMealCal] = useState("");
  const [mealPro, setMealPro] = useState("");

  const [sleepH, setSleepH] = useState(String(todayLog?.sleep?.hours ?? ""));
  const [sleepQ, setSleepQ] = useState<number>(todayLog?.sleep?.quality ?? 3);
  const [bedtime, setBedtime] = useState(todayLog?.sleep?.bedtime ?? "23:00");
  const [wakeTime, setWakeTime] = useState(todayLog?.sleep?.wakeTime ?? "06:30");

  // Auto Compute Sleep Duration
  useEffect(() => {
    if (bedtime && wakeTime && mode === "health_sleep") {
      const [bH, bM] = bedtime.split(":").map(Number);
      const [wH, wM] = wakeTime.split(":").map(Number);
      let diffM = (wH * 60 + wM) - (bH * 60 + bM);
      if (diffM < 0) diffM += 24 * 60; // crossed midnight
      setSleepH((diffM / 60).toFixed(1));
    }
  }, [bedtime, wakeTime, mode]);

  // Auto Compute Gym Duration
  useEffect(() => {
    if (gymStartTime && gymEndTime && gymDone && mode === "health_gym") {
      const [sH, sM] = gymStartTime.split(":").map(Number);
      const [eH, eM] = gymEndTime.split(":").map(Number);
      let diffM = (eH * 60 + eM) - (sH * 60 + sM);
      if (diffM < 0) diffM += 24 * 60;
      setGymMin(String(diffM));
    }
  }, [gymStartTime, gymEndTime, gymDone, mode]);

  const addMeal = () => {
    if (!mealName || !mealCal) return;
    const newMeals = [...meals, { name: mealName, calories: Number(mealCal), protein: Number(mealPro) || 0 }];
    setMeals(newMeals);
    setCaloriesKcal(String(newMeals.reduce((acc, m) => acc + m.calories, 0)));
    setProteinG(String(newMeals.reduce((acc, m) => acc + m.protein, 0)));
    setMealName(""); setMealCal(""); setMealPro("");
  };

  const removeMeal = (index: number) => {
    const newMeals = meals.filter((_, i) => i !== index);
    setMeals(newMeals);
    setCaloriesKcal(String(newMeals.reduce((acc, m) => acc + m.calories, 0)));
    setProteinG(String(newMeals.reduce((acc, m) => acc + m.protein, 0)));
  };

  // ── Finance state ──
  const [wallet, setWallet] = useState<WalletType>("personal");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [txDate, setTxDate] = useState(today);
  const [fromWallet, setFromWallet] = useState<WalletType>("personal");
  const [toWallet, setToWallet] = useState<WalletType>("nero_phet");

  const handleSuccess = async () => {
    setSuccess(true);
    await refreshTodayLog();
    setTimeout(onClose, 900);
  };

  // ── Handlers ──
  const submitGym = async () => {
    setLoading(true);
    await upsertHealthLog(today, {
      completed: gymDone,
      durationMin: Number(gymMin) || 0,
      startTime: gymStartTime,
      endTime: gymEndTime,
      note: gymNote,
    }, todayLog?.nutrition, todayLog?.sleep, settings ?? undefined);
    await handleSuccess();
    setLoading(false);
  };

  const submitNutrition = async () => {
    setLoading(true);
    await upsertHealthLog(today, todayLog?.gym, {
      proteinG: Number(proteinG) || 0,
      caloriesKcal: Number(caloriesKcal) || 0,
      meals: meals,
    }, todayLog?.sleep, settings ?? undefined);
    await handleSuccess();
    setLoading(false);
  };

  const submitSleep = async () => {
    setLoading(true);
    await upsertHealthLog(today, todayLog?.gym, todayLog?.nutrition, {
      hours: Number(sleepH) || 0,
      quality: sleepQ as 1 | 2 | 3 | 4 | 5,
      bedtime,
      wakeTime,
    }, settings ?? undefined);
    await handleSuccess();
    setLoading(false);
  };

  const submitTransaction = async (type: "income" | "expense") => {
    if (!amount || !description) return;
    setLoading(true);
    await addTransaction({ walletType: wallet, type, amount: Math.abs(Number(amount)), category, description, date: txDate });
    await handleSuccess();
    setLoading(false);
  };

  const submitTransfer = async () => {
    if (!amount || !description) return;
    setLoading(true);
    await addTransfer(fromWallet, toWallet, Math.abs(Number(amount)), description, txDate);
    await handleSuccess();
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    padding: "10px 12px",
    color: "white",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: 4,
  };

  const btnPrimary: React.CSSProperties = {
    width: "100%",
    padding: "13px 0",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg,#3b82f6,#6366f1)",
    color: "white",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    marginTop: 6,
    opacity: loading ? 0.7 : 1,
  };

  const CATEGORIES_INCOME = ["Doanh thu", "Lương", "Freelance", "Lợi nhuận", "Khác"];
  const CATEGORIES_EXPENSE = ["Mặt bằng", "Lương nhân viên", "Nhà cung cấp", "Ăn uống", "Di chuyển", "Marketing", "Khác"];

  /* ────────── SELECT MODE ────────── */
  if (mode === "select") {
    const groups = [
      {
        title: "🏃 Sức Khỏe",
        items: [
          { icon: Dumbbell, label: "Gym", mode: "health_gym" as LogMode, color: "#818cf8" },
          { icon: UtensilsCrossed, label: "Dinh dưỡng", mode: "health_nutrition" as LogMode, color: "#34d399" },
          { icon: Moon, label: "Giấc ngủ", mode: "health_sleep" as LogMode, color: "#60a5fa" },
        ],
      },
      {
        title: "💰 Tài Chính",
        items: [
          { icon: TrendingUp, label: "Nhập Thu", mode: "finance_income" as LogMode, color: "#34d399" },
          { icon: TrendingDown, label: "Nhập Chi", mode: "finance_expense" as LogMode, color: "#f87171" },
          { icon: ArrowLeftRight, label: "Chuyển tiền", mode: "finance_transfer" as LogMode, color: "#f59e0b" },
        ],
      },
    ];

    return (
      <ModalShell onClose={onClose} title="Quick Log">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {groups.map((g) => (
            <div key={g.title}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {g.title}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                {g.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.mode}
                      onClick={() => setMode(item.mode)}
                      style={{
                        background: `${item.color}14`,
                        border: `1px solid ${item.color}30`,
                        borderRadius: 14,
                        padding: "14px 8px",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        transition: "background 0.2s",
                      }}
                    >
                      <Icon size={22} color={item.color} />
                      <span style={{ fontSize: 11, color: item.color, fontWeight: 600 }}>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ModalShell>
    );
  }

  /* ────────── GYM ────────── */
  if (mode === "health_gym") {
    return (
      <ModalShell onClose={onClose} title="🏋️ Cập nhật Gym" onBack={() => setMode("select")}>
        {success ? <SuccessBanner /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <ToggleRow label="Đã tập hôm nay?" value={gymDone} onChange={setGymDone} />
            {gymDone && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Field label="Bắt đầu">
                    <input style={inputStyle} type="time" value={gymStartTime} onChange={(e) => setGymStartTime(e.target.value)} />
                  </Field>
                  <Field label="Kết thúc">
                    <input style={inputStyle} type="time" value={gymEndTime} onChange={(e) => setGymEndTime(e.target.value)} />
                  </Field>
                </div>
                <Field label="Thời lượng (phút)">
                  <input style={inputStyle} type="number" value={gymMin} onChange={(e) => setGymMin(e.target.value)} min="0" max="300" />
                </Field>
                <Field label="Lịch sử bài tập">
                  <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={gymNote} onChange={(e) => setGymNote(e.target.value)} placeholder="VD: Bench press 4x8, Squat 3x10..." />
                </Field>
              </>
            )}
            <button style={btnPrimary} onClick={submitGym} disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu Gym"}
            </button>
          </div>
        )}
      </ModalShell>
    );
  }

  /* ────────── NUTRITION ────────── */
  if (mode === "health_nutrition") {
    return (
      <ModalShell onClose={onClose} title="🥩 Dinh dưỡng" onBack={() => setMode("select")}>
        {success ? <SuccessBanner /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label={`Protein tổng (g) / ${settings?.proteinTargetG ?? 160}g`}>
                <input style={inputStyle} type="number" value={proteinG} onChange={(e) => setProteinG(e.target.value)} placeholder="0" />
              </Field>
              <Field label={`Calo tổng (kcal)`}>
                <input style={inputStyle} type="number" value={caloriesKcal} onChange={(e) => setCaloriesKcal(e.target.value)} placeholder="0" />
              </Field>
            </div>

            {/* Thêm bữa ăn */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ ...labelStyle, marginBottom: 8 }}>Thêm bữa ăn (để tự cộng tổng)</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 65px 65px", gap: 6, marginBottom: 8 }}>
                <input style={{ ...inputStyle, padding: "8px" }} placeholder="Tên món" value={mealName} onChange={(e) => setMealName(e.target.value)} />
                <input style={{ ...inputStyle, padding: "8px" }} placeholder="Calo" type="number" value={mealCal} onChange={(e) => setMealCal(e.target.value)} />
                <input style={{ ...inputStyle, padding: "8px" }} placeholder="Pro" type="number" value={mealPro} onChange={(e) => setMealPro(e.target.value)} />
              </div>
              <button 
                onClick={addMeal} 
                disabled={!mealName || !mealCal}
                style={{ width: "100%", padding: "8px 0", borderRadius: 8, fontSize: 13, fontWeight: 600, background: (!mealName || !mealCal) ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)", border: "none", color: "white", cursor: (!mealName || !mealCal) ? "not-allowed" : "pointer", opacity: (!mealName || !mealCal) ? 0.5 : 1 }}
              >
                + Thêm món
              </button>

              {meals.length > 0 && (
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                  {meals.map((m, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.2)", padding: "8px 10px", borderRadius: 8, fontSize: 13 }}>
                      <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>{m.name}</span>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span style={{ color: "rgba(255,255,255,0.5)" }}>{m.calories}kcal • {m.protein}g</span>
                        <button onClick={() => removeMeal(i)} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", padding: 0 }}><X size={14}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button style={btnPrimary} onClick={submitNutrition} disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu Dinh Dưỡng"}
            </button>
          </div>
        )}
      </ModalShell>
    );
  }

  /* ────────── SLEEP ────────── */
  if (mode === "health_sleep") {
    return (
      <ModalShell onClose={onClose} title="🌙 Giấc Ngủ" onBack={() => setMode("select")}>
        {success ? <SuccessBanner /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Giờ ngủ">
                <input style={inputStyle} type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} />
              </Field>
              <Field label="Giờ dậy">
                <input style={inputStyle} type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} />
              </Field>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)", padding: "12px 14px", borderRadius: 12 }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 600, textTransform: "uppercase" }}>Tổng giờ ngủ</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: "#60a5fa" }}>{sleepH}h</span>
            </div>
            <Field label={`Chất lượng giấc ngủ`}>
              <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
                {[1, 2, 3, 4, 5].map((q) => (
                  <button
                    key={q}
                    onClick={() => setSleepQ(q)}
                    style={{
                      flex: 1, height: 46, borderRadius: 10,
                      border: `2px solid ${sleepQ >= q ? "#60a5fa" : "rgba(255,255,255,0.1)"}`,
                      background: sleepQ >= q ? "rgba(96,165,250,0.2)" : "rgba(255,255,255,0.04)",
                      color: sleepQ >= q ? "#60a5fa" : "rgba(255,255,255,0.3)",
                      fontWeight: 700, fontSize: 20, cursor: "pointer",
                      transition: "all 0.15s"
                    }}
                  >
                    {["😫","😞","😐","😊","🤩"][q - 1]}
                  </button>
                ))}
              </div>
            </Field>
            <button style={btnPrimary} onClick={submitSleep} disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu Giấc Ngủ"}
            </button>
          </div>
        )}
      </ModalShell>
    );
  }

  /* ────────── INCOME / EXPENSE ────────── */
  if (mode === "finance_income" || mode === "finance_expense") {
    const isIncome = mode === "finance_income";
    const cats = isIncome ? CATEGORIES_INCOME : CATEGORIES_EXPENSE;

    return (
      <ModalShell
        onClose={onClose}
        title={isIncome ? "📈 Nhập Thu" : "📉 Nhập Chi"}
        onBack={() => setMode("select")}
      >
        {success ? <SuccessBanner /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Ví">
              <div style={{ display: "flex", gap: 8 }}>
                {(["personal", "nero_phet"] as WalletType[]).map((w) => (
                  <button
                    key={w}
                    onClick={() => setWallet(w)}
                    style={{
                      flex: 1, padding: "9px 0", borderRadius: 10,
                      border: `1px solid ${wallet === w ? "#818cf8" : "rgba(255,255,255,0.1)"}`,
                      background: wallet === w ? "rgba(129,140,248,0.15)" : "rgba(255,255,255,0.04)",
                      color: wallet === w ? "#818cf8" : "rgba(255,255,255,0.4)",
                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    {w === "personal" ? "👤 Cá Nhân" : "🏪 Nero Phết"}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Số tiền (VNĐ)">
              <input style={inputStyle} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1,000,000" />
            </Field>
            <Field label="Danh mục">
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {cats.map((c) => (
                  <button
                    key={c} onClick={() => setCategory(c)}
                    style={{
                      padding: "5px 10px", borderRadius: 20,
                      border: `1px solid ${category === c ? "#818cf8" : "rgba(255,255,255,0.1)"}`,
                      background: category === c ? "rgba(129,140,248,0.15)" : "rgba(255,255,255,0.04)",
                      color: category === c ? "#818cf8" : "rgba(255,255,255,0.4)",
                      fontSize: 11, cursor: "pointer",
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Mô tả">
              <input style={inputStyle} type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ghi chú..." />
            </Field>
            <Field label="Ngày">
              <input style={inputStyle} type="date" value={txDate} onChange={(e) => setTxDate(e.target.value)} />
            </Field>
            <button
              style={{ ...btnPrimary, background: isIncome ? "linear-gradient(135deg,#34d399,#10b981)" : "linear-gradient(135deg,#f87171,#ef4444)" }}
              onClick={() => submitTransaction(isIncome ? "income" : "expense")}
              disabled={loading || !amount || !description}
            >
              {loading ? "Đang lưu..." : isIncome ? "Lưu Thu Nhập" : "Lưu Chi Tiêu"}
            </button>
          </div>
        )}
      </ModalShell>
    );
  }

  /* ────────── TRANSFER ────────── */
  if (mode === "finance_transfer") {
    return (
      <ModalShell onClose={onClose} title="↔ Chuyển Tiền" onBack={() => setMode("select")}>
        {success ? <SuccessBanner /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Field label="Từ ví">
                <select style={inputStyle} value={fromWallet} onChange={(e) => setFromWallet(e.target.value as WalletType)}>
                  <option value="personal">👤 Cá Nhân</option>
                  <option value="nero_phet">🏪 Nero Phết</option>
                </select>
              </Field>
              <ArrowLeftRight size={20} color="rgba(255,255,255,0.3)" style={{ marginTop: 16, flexShrink: 0 }} />
              <Field label="Đến ví">
                <select style={inputStyle} value={toWallet} onChange={(e) => setToWallet(e.target.value as WalletType)}>
                  <option value="nero_phet">🏪 Nero Phết</option>
                  <option value="personal">👤 Cá Nhân</option>
                </select>
              </Field>
            </div>
            <Field label="Số tiền (VNĐ)">
              <input style={inputStyle} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="5,000,000" />
            </Field>
            <Field label="Ghi chú (bắt buộc)">
              <input style={inputStyle} type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="VD: Lấy tiền túi chi cho tiệm" />
            </Field>
            <Field label="Ngày">
              <input style={inputStyle} type="date" value={txDate} onChange={(e) => setTxDate(e.target.value)} />
            </Field>
            <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: "10px 12px", fontSize: 11, color: "rgba(245,158,11,0.85)", lineHeight: 1.5 }}>
              💡 Transfer tạo 2 giao dịch liên kết để báo cáo tài chính không bị sai lệch.
            </div>
            <button
              style={{ ...btnPrimary, background: "linear-gradient(135deg,#f59e0b,#d97706)" }}
              onClick={submitTransfer}
              disabled={loading || !amount || !description}
            >
              {loading ? "Đang lưu..." : "Xác Nhận Chuyển"}
            </button>
          </div>
        )}
      </ModalShell>
    );
  }

  return null;
}

// ── Sub-components ──────────────────────────────────────────────────────────

function ModalShell({
  children,
  onClose,
  title,
  onBack,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  onBack?: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "0 0 0 0",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(6px)",
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 480,
          background: "linear-gradient(180deg, #1a1d2e 0%, #12141f 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "24px 24px 0 0",
          padding: "24px 22px 40px",
          maxHeight: "90vh",
          overflowY: "auto",
          animation: "slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Handle bar */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)", margin: "0 auto 20px" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {onBack && (
              <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: 4 }}>
                ← 
              </button>
            )}
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "white", margin: 0 }}>{title}</h2>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", color: "rgba(255,255,255,0.5)" }}>
            <X size={16} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "rgba(255,255,255,0.04)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
      <span style={{ fontSize: 14, color: "rgba(255,255,255,0.85)" }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 50, height: 26, borderRadius: 13, border: "none",
          background: value ? "#818cf8" : "rgba(255,255,255,0.12)",
          cursor: "pointer", position: "relative", transition: "background 0.2s",
        }}
      >
        <div style={{
          position: "absolute", top: 3, width: 20, height: 20, borderRadius: "50%",
          background: "white", transition: "left 0.2s",
          left: value ? 27 : 3,
        }} />
      </button>
    </div>
  );
}

function SuccessBanner() {
  return (
    <div style={{ textAlign: "center", padding: "30px 0" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#34d399" }}>Đã lưu thành công!</div>
    </div>
  );
}
