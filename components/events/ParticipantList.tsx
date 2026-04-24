"use client";

import { useState } from "react";

interface ParticipantChipProps {
  name: string;
  onRemove: () => void;
}

function ParticipantChip({ name, onRemove }: ParticipantChipProps) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 10px",
        background: hover ? "var(--ink)" : "rgba(11,11,12,.06)",
        color: hover ? "var(--bg)" : "var(--ink)",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        transition: "all .2s",
      }}
    >
      {name}
      <button
        onClick={onRemove}
        title="remove"
        style={{
          width: 16,
          height: 16,
          borderRadius: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: hover ? "var(--bg)" : "transparent",
          color: hover ? "var(--ink)" : "var(--muted)",
          fontSize: 10,
          lineHeight: 1,
          fontWeight: 700,
        }}
      >
        ×
      </button>
    </div>
  );
}

interface ParticipantListProps {
  participants: string[];
  onRemove: (index: number) => void;
}

export function ParticipantList({ participants, onRemove }: ParticipantListProps) {
  return (
    <div>
      <div
        className="mono"
        style={{
          fontSize: 10,
          letterSpacing: "0.12em",
          color: "var(--muted)",
          marginBottom: 8,
        }}
      >
        PARTICIPANTS · {participants.length}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {participants.map((p, i) => (
          <ParticipantChip key={i} name={p} onRemove={() => onRemove(i)} />
        ))}
      </div>
    </div>
  );
}
