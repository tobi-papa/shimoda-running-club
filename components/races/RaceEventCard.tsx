"use client";

import { useState } from "react";
import type { RaceEvent } from "@/types";
import { fmtDate, timeUntil } from "@/lib/utils";

const RACE_LABELS: Record<string, string> = {
  half_marathon: "HALF MARATHON",
  marathon: "MARATHON",
  "10k": "10K",
  "5k": "5K",
  other: "RACE",
};

interface RaceEventCardProps {
  event: RaceEvent;
  onJoin: (event: RaceEvent) => void;
  onEdit: (event: RaceEvent) => void;
  onDelete: (id: string) => void;
  onFeature: (id: string) => void;
}

export function RaceEventCard({ event, onJoin, onEdit, onDelete, onFeature }: RaceEventCardProps) {
  const d = fmtDate(event.run_at);
  const [hover, setHover] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [confirming, setConfirming] = useState(false);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 8;
    const y = ((e.clientY - r.top) / r.height - 0.5) * -8;
    setTilt({ x, y });
  };

  return (
    <div
      className="reveal hover-lift"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setTilt({ x: 0, y: 0 }); }}
      onMouseMove={onMove}
      style={{
        position: "relative",
        background: "var(--paper)",
        border: "1.5px solid var(--ink)",
        borderRadius: 4,
        padding: 28,
        transform: `perspective(900px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
        transition: "transform .25s cubic-bezier(.2,.7,.2,1), box-shadow .25s",
        boxShadow: hover ? "10px 14px 0 var(--ink)" : "4px 6px 0 var(--ink)",
        overflow: "hidden",
      }}
    >
      {/* featured badge */}
      {event.is_featured && (
        <div
          className="mono"
          style={{
            position: "absolute",
            top: 14,
            right: 18,
            fontSize: 10,
            letterSpacing: "0.12em",
            background: "var(--ink)",
            color: "var(--bg)",
            padding: "3px 8px",
            fontWeight: 700,
          }}
        >
          ★ FEATURED
        </div>
      )}

      {/* rainbow streak */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "linear-gradient(90deg,#ff2d55,#ffb300,#00c2a8,#3d5afe,#8e24ff)",
          transform: hover ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "left",
          transition: "transform .5s cubic-bezier(.2,.7,.2,1)",
        }}
      />

      {/* date + info */}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 20 }}>
        <div
          style={{
            border: "1.5px solid var(--ink)",
            padding: "10px 14px",
            minWidth: 96,
            textAlign: "center",
            background: hover ? "var(--ink)" : "transparent",
            color: hover ? "var(--bg)" : "var(--ink)",
            transition: "background .3s, color .3s",
          }}
        >
          <div className="mono" style={{ fontSize: 10, letterSpacing: "0.12em" }}>{d.day}</div>
          <div className="display" style={{ fontSize: 40, lineHeight: 1, margin: "4px 0" }}>{d.dd}</div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: "0.12em" }}>{d.mon}</div>
        </div>
        <div style={{ flex: 1, paddingTop: 4 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
            <div
              className="mono"
              style={{
                fontSize: 10,
                letterSpacing: "0.12em",
                fontWeight: 700,
                background: "var(--ink)",
                color: "var(--bg)",
                padding: "2px 7px",
              }}
            >
              {RACE_LABELS[event.race_type] ?? "RACE"}
            </div>
            <div className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--muted)" }}>
              {timeUntil(event.run_at)}
            </div>
          </div>
          <div className="display" style={{ fontSize: 22, letterSpacing: "-0.02em", marginBottom: 4 }}>
            {event.name}
          </div>
          <div style={{ fontSize: 14, color: "var(--muted)" }}>
            📍 {event.location} · {event.distance_km} KM
          </div>
        </div>
      </div>

      {/* notes */}
      {event.notes && (
        <div
          style={{
            fontSize: 14,
            lineHeight: 1.5,
            color: "var(--ink-2)",
            padding: "14px 16px",
            background: "rgba(11,11,12,.04)",
            borderLeft: "3px solid var(--ink)",
            marginBottom: 18,
          }}
        >
          {event.notes}
        </div>
      )}

      {/* participant count */}
      <div
        className="mono"
        style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--muted)", marginBottom: 20 }}
      >
        {event.participants.length} RUNNER{event.participants.length !== 1 ? "S" : ""} FROM THE CLUB
      </div>

      {/* actions */}
      {confirming ? (
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span className="mono" style={{ fontSize: 11, letterSpacing: "0.08em", color: "var(--muted)" }}>
            DELETE THIS RACE?
          </span>
          <button
            onClick={() => { onDelete(event.id); setConfirming(false); }}
            style={{
              background: "var(--accent-a)",
              color: "#fff",
              padding: "10px 18px",
              borderRadius: 999,
              fontWeight: 800,
              letterSpacing: "0.08em",
              fontSize: 12,
            }}
          >
            CONFIRM
          </button>
          <button
            onClick={() => setConfirming(false)}
            style={{
              border: "1.5px solid var(--ink)",
              padding: "10px 18px",
              borderRadius: 999,
              fontWeight: 700,
              letterSpacing: "0.06em",
              fontSize: 12,
            }}
          >
            CANCEL
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => onJoin(event)}
            style={{
              background: "var(--ink)",
              color: "var(--bg)",
              padding: "12px 20px",
              borderRadius: 999,
              fontWeight: 800,
              letterSpacing: "0.08em",
              fontSize: 12,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            I&apos;M IN <span>→</span>
          </button>
          {!event.is_featured && (
            <button
              onClick={() => onFeature(event.id)}
              style={{
                border: "1.5px solid var(--ink)",
                padding: "10px 18px",
                borderRadius: 999,
                fontWeight: 700,
                letterSpacing: "0.06em",
                fontSize: 12,
              }}
            >
              ★ FEATURE
            </button>
          )}
          <button
            onClick={() => onEdit(event)}
            style={{
              border: "1.5px solid var(--ink)",
              padding: "10px 18px",
              borderRadius: 999,
              fontWeight: 700,
              letterSpacing: "0.06em",
              fontSize: 12,
            }}
          >
            EDIT
          </button>
          {event.registration_url && (
            <a
              href={event.registration_url}
              target="_blank"
              rel="noreferrer"
              className="mono"
              style={{
                fontSize: 11,
                letterSpacing: "0.1em",
                textDecoration: "underline",
                color: "var(--ink)",
              }}
            >
              REGISTER ↗
            </a>
          )}
          <button
            onClick={() => setConfirming(true)}
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.1em",
              marginLeft: "auto",
              color: "var(--muted)",
              textDecoration: "underline",
            }}
          >
            DELETE
          </button>
        </div>
      )}
    </div>
  );
}
