"use client";

import { useState } from "react";
import type { CreateRaceEventForm, RaceType } from "@/types";

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

const RACE_TYPES: { value: RaceType; label: string }[] = [
  { value: "5k", label: "5K" },
  { value: "10k", label: "10K" },
  { value: "half_marathon", label: "Half Marathon" },
  { value: "marathon", label: "Marathon" },
  { value: "other", label: "Other" },
];

interface CreateRaceEventModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (form: CreateRaceEventForm) => void;
}

export function CreateRaceEventModal({ open, onClose, onCreate }: CreateRaceEventModalProps) {
  const [form, setForm] = useState({
    name: "",
    race_type: "10k" as RaceType,
    run_at: "",
    location: "",
    distance_km: "",
    registration_url: "",
    notes: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const canSubmit = form.name && form.run_at && form.location && form.distance_km;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onCreate({
      name: form.name,
      race_type: form.race_type,
      run_at: form.run_at,
      location: form.location,
      distance_km: Number(form.distance_km),
      registration_url: form.registration_url || undefined,
      notes: form.notes || undefined,
    });
    setForm({ name: "", race_type: "10k", run_at: "", location: "", distance_km: "", registration_url: "", notes: "" });
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
          <div className="display" style={{ fontSize: 22 }}>NEW RACE EVENT</div>
          <button onClick={onClose} style={{ fontSize: 22, lineHeight: 1, color: "var(--bg)" }}>×</button>
        </div>

        <form onSubmit={submit} style={{ padding: 24 }}>
          <Field label="Race name" required>
            <input style={inputStyle} value={form.name} onChange={set("name")} placeholder="Shimoda Half Marathon 2026" />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Race type" required>
              <select style={inputStyle} value={form.race_type} onChange={set("race_type")}>
                {RACE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Distance (km)" required>
              <input type="number" step="0.1" style={inputStyle} value={form.distance_km} onChange={set("distance_km")} placeholder="21.1" />
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Date & time" required>
              <input type="datetime-local" style={inputStyle} value={form.run_at} onChange={set("run_at")} />
            </Field>
            <Field label="Location" required>
              <input style={inputStyle} value={form.location} onChange={set("location")} placeholder="Shimoda, Shizuoka" />
            </Field>
          </div>
          <Field label="Registration link" hint="Optional">
            <input type="url" style={inputStyle} value={form.registration_url} onChange={set("registration_url")} placeholder="https://..." />
          </Field>
          <Field label="Notes">
            <textarea
              style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
              value={form.notes}
              onChange={set("notes")}
              placeholder="Elevation, course details, meet-up plan..."
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
              ADD RACE →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
