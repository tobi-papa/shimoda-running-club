"use client";

import { useState, useEffect } from "react";

export function MusicPlayer() {
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [bars, setBars] = useState([0.3, 0.6, 0.4, 0.8, 0.5]);

  useEffect(() => {
    if (!playing || muted) return;
    const id = setInterval(() => {
      setBars(() => Array.from({ length: 5 }, () => 0.25 + Math.random() * 0.75));
    }, 180);
    return () => clearInterval(id);
  }, [playing, muted]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        border: "1.5px solid var(--ink)",
        padding: "6px 12px",
        borderRadius: 999,
        marginRight: 8,
      }}
    >
      <button
        onClick={() => setPlaying((p) => !p)}
        title="play/pause"
        style={{ display: "flex", alignItems: "center" }}
      >
        {playing ? (
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect x="1" y="1" width="3" height="10" fill="currentColor" />
            <rect x="8" y="1" width="3" height="10" fill="currentColor" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12">
            <polygon points="2,1 11,6 2,11" fill="currentColor" />
          </svg>
        )}
      </button>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 14 }}>
        {bars.map((b, i) => (
          <div
            key={i}
            style={{
              width: 2,
              height: `${(muted ? 0.15 : b) * 14}px`,
              background: "currentColor",
              transition: "height .18s",
            }}
          />
        ))}
      </div>

      <div className="mono" style={{ fontSize: 10, letterSpacing: "0.1em" }}>
        {muted ? "MUTED" : "PLAYING"}
      </div>

      <button
        onClick={() => setMuted((m) => !m)}
        title={muted ? "unmute" : "mute"}
        style={{ display: "flex", alignItems: "center" }}
      >
        {muted ? (
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path d="M2 5v4h2l3 3V2L4 5H2z" fill="currentColor" />
            <line x1="9" y1="5" x2="13" y2="9" stroke="currentColor" strokeWidth="1.4" />
            <line x1="13" y1="5" x2="9" y2="9" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path d="M2 5v4h2l3 3V2L4 5H2z" fill="currentColor" />
            <path d="M9 4 q2 3 0 6" stroke="currentColor" fill="none" strokeWidth="1.4" />
            <path d="M11 2 q3 5 0 10" stroke="currentColor" fill="none" strokeWidth="1.4" />
          </svg>
        )}
      </button>
    </div>
  );
}
