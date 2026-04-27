"use client";

import { useState } from "react";
import type { Event } from "@/types";
import { ParticipantList } from "./ParticipantList";
import { fmtDate, timeUntil } from "@/lib/utils";

interface EventCardProps {
  event: Event;
  index: number;
  onJoin: (event: Event) => void;
  onComplete: (id: string) => void;
  onRemove: (eventId: string, participantId: string) => void;
}

export function EventCard({ event, index, onJoin, onComplete, onRemove }: EventCardProps) {
  const d = fmtDate(event.run_at);
  const [hover, setHover] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

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
      {/* corner index */}
      <div
        className="mono"
        style={{
          position: "absolute",
          top: 14,
          right: 18,
          fontSize: 11,
          letterSpacing: "0.1em",
          color: "var(--muted)",
        }}
      >
        RUN № {String(index + 1).padStart(3, "0")}
      </div>

      {/* rainbow streak */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background:
            "linear-gradient(90deg,#ff2d55,#ffb300,#00c2a8,#3d5afe,#8e24ff)",
          transform: hover ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "left",
          transition: "transform .5s cubic-bezier(.2,.7,.2,1)",
        }}
      />

      {/* date block */}
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
          <div className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--muted)" }}>
            {d.hh}:{d.mm} · {timeUntil(event.run_at)}
          </div>
          <div className="display" style={{ fontSize: 26, marginTop: 6, letterSpacing: "-0.02em" }}>
            {event.distance_km} KM · {event.pace}/KM
          </div>
          <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>
            📍 {event.meeting_point}
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

      {/* participants */}
      <div style={{ marginBottom: 20 }}>
        <ParticipantList
          participants={event.participants}
          onRemove={(participantId) => onRemove(event.id, participantId)}
        />
      </div>

      {/* actions */}
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
          JOIN RUN <span>→</span>
        </button>
        <button
          onClick={() => onComplete(event.id)}
          style={{
            border: "1.5px solid var(--ink)",
            padding: "10px 18px",
            borderRadius: 999,
            fontWeight: 700,
            letterSpacing: "0.06em",
            fontSize: 12,
          }}
        >
          COMPLETE
        </button>
        {event.strava_url && (
          <a
            href={event.strava_url}
            target="_blank"
            rel="noreferrer"
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.1em",
              textDecoration: "underline",
              marginLeft: "auto",
              color: "var(--ink)",
            }}
          >
            STRAVA ROUTE ↗
          </a>
        )}
      </div>

      <div
        className="mono"
        style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--muted)", marginTop: 14 }}
      >
        CREATED BY {event.creator.toUpperCase()}
      </div>
    </div>
  );
}
