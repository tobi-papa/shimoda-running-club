"use client";

import { useState } from "react";
import type { Event } from "@/types";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1.5px solid var(--ink)",
  background: "var(--paper)",
  fontSize: 14,
  borderRadius: 2,
  outline: "none",
  fontFamily: "inherit",
};

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "block", marginBottom: 16 }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", marginBottom: 6, fontWeight: 700 }}>
        {label.toUpperCase()}{" "}
        {required && <span style={{ color: "var(--accent-a)" }}>*</span>}
      </div>
      {children}
      {hint && (
        <div className="mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>
          {hint}
        </div>
      )}
    </label>
  );
}

interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (event: Event) => void;
}

export function CreateEventModal({ open, onClose, onCreate }: CreateEventModalProps) {
  const [form, setForm] = useState({
    creator: "",
    run_at: "",
    meeting_point: "",
    distance_km: "",
    pace: "",
    strava_url: "",
    notes: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const canSubmit =
    form.creator && form.run_at && form.meeting_point && form.distance_km && form.pace;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onCreate({
      id: "u" + Date.now(),
      creator: form.creator,
      run_at: form.run_at,
      meeting_point: form.meeting_point,
      distance_km: Number(form.distance_km),
      pace: form.pace,
      strava_url: form.strava_url || undefined,
      notes: form.notes || undefined,
      participants: [form.creator],
      status: "upcoming",
    });
    setForm({ creator: "", run_at: "", meeting_point: "", distance_km: "", pace: "", strava_url: "", notes: "" });
    onClose();
  };

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(11,11,12,.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        animation: "fadeIn .2s",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg)",
          border: "1.5px solid var(--ink)",
          width: "100%",
          maxWidth: 560,
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "12px 14px 0 var(--ink)",
          animation: "rise .3s cubic-bezier(.2,.7,.2,1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 22px",
            borderBottom: "1.5px solid var(--ink)",
            background: "var(--ink)",
            color: "var(--bg)",
          }}
        >
          <div className="display" style={{ fontSize: 22 }}>NEW RUN</div>
          <button onClick={onClose} style={{ fontSize: 22, lineHeight: 1, color: "var(--bg)" }}>×</button>
        </div>

        <form onSubmit={submit} style={{ padding: 24 }}>
          <Field label="Your name" required>
            <input style={inputStyle} value={form.creator} onChange={set("creator")} placeholder="Who's organizing?" />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Date & time" required>
              <input type="datetime-local" style={inputStyle} value={form.run_at} onChange={set("run_at")} />
            </Field>
            <Field label="Distance (km)" required>
              <input type="number" step="0.1" style={inputStyle} value={form.distance_km} onChange={set("distance_km")} placeholder="10.0" />
            </Field>
          </div>
          <Field label="Meeting point" required>
            <input style={inputStyle} value={form.meeting_point} onChange={set("meeting_point")} placeholder="Where do we meet?" />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Pace (min/km)" required hint="e.g. 5:30">
              <input style={inputStyle} value={form.pace} onChange={set("pace")} placeholder="5:30" />
            </Field>
            <Field label="Strava route" hint="Optional link">
              <input type="url" style={inputStyle} value={form.strava_url} onChange={set("strava_url")} placeholder="https://..." />
            </Field>
          </div>
          <Field label="Notes">
            <textarea
              style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
              value={form.notes}
              onChange={set("notes")}
              placeholder="Anything else? Pace notes, coffee plans..."
            />
          </Field>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                border: "1.5px solid var(--ink)",
                padding: "12px 20px",
                borderRadius: 999,
                fontWeight: 700,
                letterSpacing: "0.08em",
                fontSize: 12,
              }}
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                background: canSubmit ? "var(--ink)" : "rgba(11,11,12,.3)",
                color: "var(--bg)",
                padding: "12px 24px",
                borderRadius: 999,
                fontWeight: 800,
                letterSpacing: "0.08em",
                fontSize: 12,
                cursor: canSubmit ? "pointer" : "not-allowed",
              }}
            >
              CREATE RUN →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
