"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import { addScheduleEntry, updateScheduleEntry } from "@/lib/service";
import { ScheduleEntry, TaskCode } from "@/lib/types";
import { format } from "date-fns";

export const TASK_TYPE_META: Record<
  TaskCode,
  { label: string; color: string; bg: string; border: string; emoji: string }
> = {
  FT: { label: "Full-time",  color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  border: "rgba(96,165,250,0.3)",  emoji: "💼" },
  PJ: { label: "Project",    color: "#a78bfa", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.3)", emoji: "🚀" },
  B:  { label: "Business",   color: "#34d399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.3)",  emoji: "🏪" },
  P:  { label: "Personal",   color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.3)",  emoji: "⭐" },
};

interface Props {
  initialDate?: string;
  entry?: ScheduleEntry;   // If provided: edit mode
  onClose: () => void;
}

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

export default function AddScheduleModal({ initialDate, entry, onClose }: Props) {
  const today = format(new Date(), "yyyy-MM-dd");
  const isEdit = !!entry;

  const [title, setTitle]       = useState(entry?.title ?? "");
  const [date, setDate]         = useState(entry?.date ?? initialDate ?? today);
  const [startTime, setStart]   = useState(entry?.startTime ?? "09:00");
  const [endTime, setEnd]       = useState(entry?.endTime ?? "10:00");
  const [type, setType]         = useState<TaskCode>(entry?.type ?? "FT");
  const [description, setDesc]  = useState(entry?.description ?? "");
  const [location, setLocation] = useState(entry?.location ?? "");
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);

  // ── Load & Save Draft for New Entries ──
  React.useEffect(() => {
    if (!isEdit) {
      const draftStr = localStorage.getItem("lifeOS_scheduleDraft");
      if (draftStr) {
        try {
          const draft = JSON.parse(draftStr);
          if (draft.title) setTitle(draft.title);
          if (draft.date) setDate(draft.date);
          if (draft.startTime) setStart(draft.startTime);
          if (draft.endTime) setEnd(draft.endTime);
          if (draft.type) setType(draft.type);
          if (draft.description) setDesc(draft.description);
          if (draft.location) setLocation(draft.location);
        } catch (e) {}
      }
    }
  }, [isEdit]);

  React.useEffect(() => {
    if (!isEdit && !success) {
      localStorage.setItem("lifeOS_scheduleDraft", JSON.stringify({
        title, date, startTime, endTime, type, description, location,
      }));
    }
  }, [title, date, startTime, endTime, type, description, location, isEdit, success]);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    if (isEdit && entry) {
      await updateScheduleEntry(entry.id, { title, date, startTime, endTime, type, description, location });
    } else {
      await addScheduleEntry({ title, date, startTime, endTime, type, description, location, isDone: false });
      localStorage.removeItem("lifeOS_scheduleDraft");
    }
    setSuccess(true);
    setTimeout(onClose, 700);
    setLoading(false);
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }} />

      {/* Sheet */}
      <div style={{
        position: "relative", width: "100%", maxWidth: 480,
        background: "linear-gradient(180deg,#1a1d2e 0%,#12141f 100%)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "24px 24px 0 0",
        padding: "20px 20px 40px",
        maxHeight: "88vh", overflowY: "auto",
        animation: "slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)", margin: "0 auto 18px" }} />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: "white", margin: 0 }}>
            {isEdit ? "Sửa lịch trình" : "Thêm lịch trình"}
          </h2>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", color: "rgba(255,255,255,0.5)" }}>
            <X size={16} />
          </button>
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>✅</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#34d399" }}>Đã lưu!</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Title */}
            <Field label="Tiêu đề *">
              <input
                style={inputStyle} value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Stand-up meeting, Workout, Gặp đối tác..."
                autoFocus
              />
            </Field>

            {/* Task type */}
            <Field label="Loại">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                {(Object.entries(TASK_TYPE_META) as [TaskCode, typeof TASK_TYPE_META[TaskCode]][]).map(([code, meta]) => (
                  <button
                    key={code}
                    onClick={() => setType(code)}
                    style={{
                      padding: "9px 4px",
                      borderRadius: 12,
                      border: `1.5px solid ${type === code ? meta.border : "rgba(255,255,255,0.08)"}`,
                      background: type === code ? meta.bg : "rgba(255,255,255,0.03)",
                      color: type === code ? meta.color : "rgba(255,255,255,0.35)",
                      cursor: "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                      transition: "all 0.15s",
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{meta.emoji}</span>
                    <span style={{ fontSize: 10, fontWeight: 700 }}>[{code}]</span>
                    <span style={{ fontSize: 9, opacity: 0.8 }}>{meta.label}</span>
                  </button>
                ))}
              </div>
            </Field>

            {/* Date */}
            <Field label="Ngày">
              <input style={inputStyle} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>

            {/* Time */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Bắt đầu">
                <input style={inputStyle} type="time" value={startTime} onChange={(e) => setStart(e.target.value)} />
              </Field>
              <Field label="Kết thúc">
                <input style={inputStyle} type="time" value={endTime} onChange={(e) => setEnd(e.target.value)} />
              </Field>
            </div>

            {/* Location */}
            <Field label="Địa điểm (tuỳ chọn)">
              <input style={inputStyle} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="VD: Văn phòng, Gym, Online..." />
            </Field>

            {/* Description */}
            <Field label="Ghi chú (tuỳ chọn)">
              <textarea
                style={{ ...inputStyle, resize: "vertical", minHeight: 140, lineHeight: 1.5 }}
                value={description}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Chi tiết thêm..."
              />
            </Field>

            <button
              onClick={handleSubmit}
              disabled={loading || !title.trim()}
              style={{
                padding: "13px 0", borderRadius: 14, border: "none",
                background: "linear-gradient(135deg,#818cf8,#6366f1)",
                color: "white", fontWeight: 700, fontSize: 15,
                cursor: title.trim() ? "pointer" : "not-allowed",
                opacity: (!title.trim() || loading) ? 0.6 : 1,
              }}
            >
              {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm vào lịch"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
        {label}
      </div>
      {children}
    </div>
  );
}
