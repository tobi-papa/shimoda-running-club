"use client";

import { useState, useRef } from "react";
import type { Event } from "@/types";
import { fmtDate } from "@/lib/utils";

interface EventCardPastProps {
  event: Event;
  onUpload: (id: string, file: File) => void;
}

export function EventCardPast({ event, onUpload }: EventCardPastProps) {
  const d = fmtDate(event.run_at);
  const [hover, setHover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(event.id, file);
    e.target.value = "";
  };

  const photoBackground = event.photo_url
    ? `url(${event.photo_url}) center/cover`
    : `linear-gradient(135deg, hsl(${event.photo_hue ?? 0} 75% 60%), hsl(${((event.photo_hue ?? 0) + 60) % 360} 75% 55%))`;

  return (
    <div
      className="reveal"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "var(--paper)",
        border: "1.5px solid var(--ink)",
        overflow: "hidden",
        transform: hover ? "translateY(-4px)" : "none",
        transition: "transform .35s",
        boxShadow: hover ? "8px 10px 0 var(--ink)" : "4px 6px 0 var(--ink)",
      }}
    >
      {/* photo area */}
      <div
        style={{
          position: "relative",
          height: 200,
          background: photoBackground,
          overflow: "hidden",
        }}
      >
        {!event.photo_url && (
          <>
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "repeating-linear-gradient(45deg, transparent 0 12px, rgba(255,255,255,.18) 12px 14px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                className="mono"
                style={{ color: "#fff", fontSize: 11, letterSpacing: "0.15em", opacity: 0.9 }}
              >
                [ PHOTO ]
              </div>
            </div>
            <button
              onClick={handleUploadClick}
              style={{
                position: "absolute",
                bottom: 12,
                right: 12,
                background: "#fff",
                color: "var(--ink)",
                padding: "8px 14px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.08em",
                opacity: hover ? 1 : 0,
                transform: hover ? "translateY(0)" : "translateY(8px)",
                transition: "all .3s",
              }}
            >
              UPLOAD PHOTO ↑
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </>
        )}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            background: "var(--ink)",
            color: "var(--bg)",
            padding: "6px 10px",
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 10,
            letterSpacing: "0.12em",
            fontWeight: 700,
          }}
        >
          ✓ COMPLETED · {d.mon} {d.dd}
        </div>
      </div>

      {/* content */}
      <div style={{ padding: 20 }}>
        <div className="display" style={{ fontSize: 22, lineHeight: 1, marginBottom: 6 }}>
          {event.distance_km} KM
        </div>
        <div className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--muted)" }}>
          {event.pace}/KM · {event.participants.length} RUNNERS
        </div>
        {event.notes && (
          <div style={{ fontSize: 13, marginTop: 10, color: "var(--ink-2)", lineHeight: 1.5 }}>
            {event.notes}
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 12 }}>
          {event.participants.map((p) => (
            <span
              key={p.id}
              style={{
                fontSize: 11,
                padding: "3px 8px",
                background: "rgba(11,11,12,.06)",
                borderRadius: 999,
                fontWeight: 600,
              }}
            >
              {p.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
