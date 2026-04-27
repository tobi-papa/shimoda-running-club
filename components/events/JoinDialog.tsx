"use client";

import { useState } from "react";
import type { Event } from "@/types";
import { fmtDate } from "@/lib/utils";

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

interface JoinDialogProps {
  event: Event | null;
  onClose: () => void;
  onJoin: (eventId: string, names: string[]) => void;
}

export function JoinDialog({ event, onClose, onJoin }: JoinDialogProps) {
  const [names, setNames] = useState("");

  if (!event) return null;

  const d = fmtDate(event.run_at);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const list = names
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (list.length) onJoin(event.id, list);
    setNames("");
    onClose();
  };

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
          <div className="display" style={{ fontSize: 22 }}>JOIN RUN</div>
          <button onClick={onClose} style={{ fontSize: 22, lineHeight: 1, color: "var(--bg)" }}>×</button>
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ marginBottom: 18 }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--muted)" }}>
              {d.day} · {event.distance_km}KM · {event.pace}/KM
            </div>
            <div className="display" style={{ fontSize: 26, marginTop: 4 }}>
              WITH {event.creator.toUpperCase()} &amp; {event.participants.length - 1} OTHERS
            </div>
          </div>

          <form onSubmit={submit}>
            <label style={{ display: "block", marginBottom: 16 }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", marginBottom: 6, fontWeight: 700 }}>
                YOUR NAME(S) <span style={{ color: "var(--accent-a)" }}>*</span>
              </div>
              <input
                autoFocus
                style={inputStyle}
                value={names}
                onChange={(e) => setNames(e.target.value)}
                placeholder="Yuki, Tobi"
              />
              <div className="mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>
                Separate multiple names with commas
              </div>
            </label>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
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
                style={{
                  background: "var(--ink)",
                  color: "var(--bg)",
                  padding: "12px 24px",
                  borderRadius: 999,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  fontSize: 12,
                }}
              >
                JOIN →
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
