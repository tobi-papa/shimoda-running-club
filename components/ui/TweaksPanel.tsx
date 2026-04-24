"use client";

import { useState, useCallback, useRef, useEffect, ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TweakValues = {
  accent: "rainbow" | "mono";
  grain: boolean;
  cardStyle: "solid-shadow" | "soft" | "flat";
};

type TweaksState = TweakValues & {
  _set: (k: keyof TweakValues, v: TweakValues[keyof TweakValues]) => void;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTweaks(defaults: TweakValues): TweaksState {
  const [values, setValues] = useState<TweakValues>(defaults);
  const _set = useCallback(
    (k: keyof TweakValues, v: TweakValues[keyof TweakValues]) => {
      setValues((prev) => ({ ...prev, [k]: v }));
    },
    []
  );
  return { ...values, _set };
}

// ─── Panel shell ──────────────────────────────────────────────────────────────

const PANEL_STYLES = `
  .twk-panel {
    position: fixed; right: 16px; bottom: 16px; z-index: 2147483646;
    width: 260px; max-height: calc(100vh - 32px);
    display: flex; flex-direction: column;
    background: rgba(250,249,247,.85); color: #29261b;
    -webkit-backdrop-filter: blur(24px) saturate(160%);
    backdrop-filter: blur(24px) saturate(160%);
    border: .5px solid rgba(255,255,255,.6);
    border-radius: 14px;
    box-shadow: 0 1px 0 rgba(255,255,255,.5) inset, 0 12px 40px rgba(0,0,0,.18);
    font: 11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;
    overflow: hidden; user-select: none;
  }
  .twk-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 8px 10px 14px; cursor: move;
  }
  .twk-header b { font-size: 12px; font-weight: 600; letter-spacing: .01em; }
  .twk-close {
    appearance: none; border: 0; background: transparent;
    color: rgba(41,38,27,.5); width: 22px; height: 22px;
    border-radius: 6px; cursor: pointer; font-size: 14px; line-height: 1;
  }
  .twk-close:hover { background: rgba(0,0,0,.07); color: #29261b; }
  .twk-body {
    padding: 4px 14px 14px;
    display: flex; flex-direction: column; gap: 8px;
    overflow-y: auto; min-height: 0;
    scrollbar-width: thin; scrollbar-color: rgba(0,0,0,.15) transparent;
  }
  .twk-section-title {
    font-size: 10px; font-weight: 700; letter-spacing: .08em;
    text-transform: uppercase; color: rgba(41,38,27,.45);
    padding: 6px 0 2px;
    border-top: 1px solid rgba(41,38,27,.1);
    margin-top: 4px;
  }
  .twk-row {
    display: flex; align-items: center;
    justify-content: space-between; gap: 8px; padding: 2px 0;
  }
  .twk-label { font-size: 12px; color: #29261b; }
  .twk-radio-group { display: flex; gap: 4px; }
  .twk-radio-btn {
    font-size: 11px; padding: 4px 10px; border-radius: 6px;
    border: 1px solid rgba(41,38,27,.2); background: transparent;
    cursor: pointer; color: #29261b; transition: all .15s;
  }
  .twk-radio-btn.active {
    background: #29261b; color: #faf9f7; border-color: #29261b;
  }
  .twk-toggle {
    position: relative; width: 36px; height: 20px;
    background: rgba(41,38,27,.15); border-radius: 10px;
    cursor: pointer; border: none; transition: background .2s;
    flex-shrink: 0;
  }
  .twk-toggle.on { background: #29261b; }
  .twk-toggle::after {
    content: ''; position: absolute; top: 2px; left: 2px;
    width: 16px; height: 16px; border-radius: 50%;
    background: #fff; transition: transform .2s;
  }
  .twk-toggle.on::after { transform: translateX(16px); }
`;

interface TweaksPanelProps {
  tweaks: TweaksState;
  children: ReactNode;
}

export function TweaksPanel({ children }: TweaksPanelProps) {
  const [visible, setVisible] = useState(true);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const startPos = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - startPos.current.mx;
      const dy = e.clientY - startPos.current.my;
      setPos({ x: startPos.current.px + dx, y: startPos.current.py + dy });
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    startPos.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
    e.preventDefault();
  };

  if (!visible) return null;

  return (
    <>
      <style>{PANEL_STYLES}</style>
      <div
        ref={panelRef}
        className="twk-panel"
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      >
        <div className="twk-header" onMouseDown={onMouseDown}>
          <b>TWEAKS</b>
          <button className="twk-close" onClick={() => setVisible(false)}>✕</button>
        </div>
        <div className="twk-body">{children}</div>
      </div>
    </>
  );
}

// ─── Controls ─────────────────────────────────────────────────────────────────

export function TweakSection({ title }: { title: string }) {
  return <div className="twk-section-title">{title}</div>;
}

interface TweakRadioProps<K extends keyof TweakValues> {
  label: string;
  tweaks: TweaksState;
  k: K;
  options: { value: TweakValues[K]; label: string }[];
}

export function TweakRadio<K extends keyof TweakValues>({
  label,
  tweaks,
  k,
  options,
}: TweakRadioProps<K>) {
  return (
    <div className="twk-row">
      <span className="twk-label">{label}</span>
      <div className="twk-radio-group">
        {options.map((opt) => (
          <button
            key={String(opt.value)}
            className={`twk-radio-btn${tweaks[k] === opt.value ? " active" : ""}`}
            onClick={() => tweaks._set(k, opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface TweakToggleProps {
  label: string;
  tweaks: TweaksState;
  k: "grain";
}

export function TweakToggle({ label, tweaks, k }: TweakToggleProps) {
  return (
    <div className="twk-row">
      <span className="twk-label">{label}</span>
      <button
        className={`twk-toggle${tweaks[k] ? " on" : ""}`}
        onClick={() => tweaks._set(k, !tweaks[k])}
        aria-pressed={tweaks[k]}
      />
    </div>
  );
}
