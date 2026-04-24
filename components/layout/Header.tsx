"use client";

import { MusicPlayer } from "./MusicPlayer";

interface HeaderProps {
  onNewRun: () => void;
}

export function Header({ onNewRun }: HeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 48,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 14,
            background:
              "linear-gradient(135deg,#ff2d55,#8e24ff,#3d5afe,#00c2a8)",
            animation: "spin 6s linear infinite",
          }}
        />
        <div className="mono" style={{ fontSize: 13, letterSpacing: "0.08em", fontWeight: 700 }}>
          SHIMODA / RUN CLUB / EST. 2024
        </div>
      </div>

      <nav style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <MusicPlayer />
        <a
          href="#upcoming"
          className="mono"
          style={{
            padding: "10px 14px",
            fontSize: 12,
            letterSpacing: "0.1em",
            fontWeight: 700,
            textDecoration: "none",
            color: "var(--ink)",
            borderRadius: 999,
          }}
        >
          UPCOMING
        </a>
        <a
          href="#past"
          className="mono"
          style={{
            padding: "10px 14px",
            fontSize: 12,
            letterSpacing: "0.1em",
            fontWeight: 700,
            textDecoration: "none",
            color: "var(--ink)",
            borderRadius: 999,
          }}
        >
          PAST
        </a>
        <button
          onClick={onNewRun}
          style={{
            display: "inline-flex",
            alignItems: "center",
            background: "var(--ink)",
            color: "var(--bg)",
            padding: "14px 22px",
            borderRadius: 999,
            fontWeight: 800,
            letterSpacing: "0.08em",
            fontSize: 13,
          }}
        >
          <span>NEW RUN</span>
          <span style={{ marginLeft: 10 }}>↗</span>
        </button>
      </nav>
    </div>
  );
}
