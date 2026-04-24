# Shimoda Running Club UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a full Next.js 15 project and implement the Shimoda Running Club UI pixel-perfectly from the HTML prototype in the handoff ZIP.

**Architecture:** All state lives in `Dashboard.tsx` (`"use client"`). `app/page.tsx` is a server component that just renders it. UI-only — no API calls, all data comes from seed constants. Inline styles throughout (faithful to prototype), with CSS custom properties in `globals.css`.

**Tech Stack:** Next.js 15, React 19, TypeScript 5, Tailwind 3.4 (resets only), next/font/google (Archivo Black + Archivo + JetBrains Mono)

---

## File Map

| File | Responsibility |
|---|---|
| `package.json` | Dependencies and scripts |
| `next.config.ts` | Minimal Next.js config |
| `tailwind.config.ts` | Content paths only |
| `postcss.config.js` | Tailwind + autoprefixer |
| `components.json` | shadcn/ui config |
| `app/globals.css` | CSS custom properties, font classes, keyframes, global resets |
| `app/layout.tsx` | Root layout with next/font, metadata |
| `app/page.tsx` | Server component → renders `<Dashboard />` |
| `types/index.ts` | `Event` and `Participant` TypeScript interfaces |
| `lib/seed.ts` | `SEED_UPCOMING`, `SEED_PAST`, `fmtDate`, `timeUntil` |
| `components/ui/TweaksPanel.tsx` | `useTweaks` hook + panel + `TweakSection`, `TweakRadio`, `TweakToggle` |
| `components/layout/MusicPlayer.tsx` | Animated play/pause + mute controls |
| `components/events/ParticipantList.tsx` | Participant name chips with remove button |
| `components/events/EventCard.tsx` | Upcoming run card (tilt, streak, join/complete actions) |
| `components/events/EventCardPast.tsx` | Past run card (photo placeholder, upload button) |
| `components/events/CreateEventModal.tsx` | New run form modal |
| `components/events/JoinDialog.tsx` | Join run modal |
| `components/layout/Header.tsx` | Nav bar (logo, MusicPlayer, links, CTA) |
| `components/layout/Dashboard.tsx` | Page root — all state, Hero, sections, footer, modals |
| `tests/e2e/dashboard.spec.ts` | Playwright smoke test |
| `tests/e2e/create-event.spec.ts` | Playwright create event flow |
| `tests/e2e/join-event.spec.ts` | Playwright join event flow |

---

## Task 1: Project scaffold

**Files:**
- Create: `package.json`
- Modify: `next.config.ts`
- Modify: `tailwind.config.ts`
- Modify: `postcss.config.js`
- Modify: `components.json`

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "shimoda-running-club",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "next": "^15.3.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@prisma/client": "^5.4.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0",
    "class-variance-authority": "^0.7.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8",
    "prisma": "^5.4.0",
    "@playwright/test": "^1.44.0",
    "eslint": "^9",
    "eslint-config-next": "^15.3.1"
  }
}
```

- [ ] **Step 2: Write `next.config.ts`**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

- [ ] **Step 3: Write `tailwind.config.ts`**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 4: Write `postcss.config.js`**

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 5: Write `components.json`**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": false
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

- [ ] **Step 6: Write `lib/utils.ts`**

Required by `components.json`'s `@/lib/utils` alias for future shadcn/ui usage:

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 7: Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 8: Commit**

```bash
git add package.json next.config.ts tailwind.config.ts postcss.config.js components.json lib/utils.ts
git commit -m "feat: scaffold Next.js 15 project"
```

---

## Task 2: Global styles + root layout

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Write `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #f3f1ec;
  --ink: #0b0b0c;
  --ink-2: #1a1a1d;
  --muted: #6b6b70;
  --paper: #ffffff;
  --accent-a: #ff2d55;
  --accent-b: #ffb300;
  --accent-c: #00c2a8;
  --accent-d: #3d5afe;
  --accent-e: #8e24ff;
}

*, *::before, *::after { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

body.lock { overflow: hidden; }

::selection { background: var(--ink); color: var(--bg); }

button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }
input, textarea { font-family: inherit; }

.mono { font-family: var(--font-jetbrains-mono), monospace; }
.display { font-family: var(--font-archivo-black), sans-serif; letter-spacing: -0.03em; line-height: 0.85; }

.rainbow {
  background: linear-gradient(90deg, var(--accent-a), var(--accent-b), var(--accent-c), var(--accent-d), var(--accent-e));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hover-lift {
  transition: transform .35s cubic-bezier(.2,.7,.2,1), box-shadow .35s;
}
.hover-lift:hover { transform: translateY(-4px); }

.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity .8s cubic-bezier(.2,.7,.2,1), transform .8s cubic-bezier(.2,.7,.2,1);
}
.reveal.in { opacity: 1; transform: none; }

.grid-bg {
  background-image:
    linear-gradient(to right, rgba(11,11,12,.06) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(11,11,12,.06) 1px, transparent 1px);
  background-size: 48px 48px;
}

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes tick {
  0%   { transform: translateY(0); }
  50%  { transform: translateY(-6px); }
  100% { transform: translateY(0); }
}
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes rise {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: none; }
}

::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-thumb { background: var(--ink); border-radius: 10px; }
::-webkit-scrollbar-track { background: transparent; }
```

- [ ] **Step 2: Write `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Archivo, Archivo_Black, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo-black",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shimoda Running Club",
  description: "Dorm running board. No login, just runs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${archivoBlack.variable} ${jetbrainsMono.variable}`}
    >
      <body style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: global styles, fonts, and root layout"
```

---

## Task 3: Types + seed data

**Files:**
- Modify: `types/index.ts`
- Create: `lib/seed.ts`

- [ ] **Step 1: Write `types/index.ts`**

```typescript
export interface Event {
  id: string;
  creator: string;
  run_at: string;
  meeting_point: string;
  distance_km: number;
  pace: string;
  strava_url?: string;
  notes?: string;
  status: "upcoming" | "completed";
  photo_url?: string | null;
  photo_hue?: number;
  participants: string[];
  metadata?: Record<string, unknown>;
}

export interface Participant {
  id: string;
  event_id: string;
  name: string;
  joined_at?: string;
}
```

- [ ] **Step 2: Write `lib/seed.ts`**

```typescript
import type { Event } from "@/types";

export const SEED_UPCOMING: Event[] = [
  {
    id: "u1",
    creator: "Aiko",
    run_at: "2026-04-26T06:30:00",
    meeting_point: "Shimoda lobby — bench by the vending machines",
    distance_km: 8.4,
    pace: "5:30",
    strava_url: "https://strava.com/routes/1",
    notes: "Easy chatty run along the canal. Coffee after at Blue Bottle.",
    participants: ["Aiko", "Marco", "Priya"],
    status: "upcoming",
  },
  {
    id: "u2",
    creator: "Dmitri",
    run_at: "2026-04-27T19:15:00",
    meeting_point: "East gate, under the red torii",
    distance_km: 12.0,
    pace: "4:50",
    strava_url: "https://strava.com/routes/2",
    notes: "Tempo session — 3×2km with 400m recovery. Bring water.",
    participants: ["Dmitri", "Hanae"],
    status: "upcoming",
  },
  {
    id: "u3",
    creator: "Sora",
    run_at: "2026-05-02T05:45:00",
    meeting_point: "Rooftop stairwell, 8F",
    distance_km: 21.1,
    pace: "5:10",
    strava_url: "",
    notes: "Half-marathon dress rehearsal for May 31. Sunrise start.",
    participants: ["Sora", "Leni", "Yuki", "Tobi", "Marco"],
    status: "upcoming",
  },
  {
    id: "u4",
    creator: "Leni",
    run_at: "2026-04-28T17:00:00",
    meeting_point: "Track oval — gate 3",
    distance_km: 5.0,
    pace: "4:20",
    strava_url: "",
    notes: "Speed day. 10×400m. New shoes welcome.",
    participants: ["Leni"],
    status: "upcoming",
  },
];

export const SEED_PAST: Event[] = [
  {
    id: "p1",
    creator: "Hanae",
    run_at: "2026-04-18T07:00:00",
    meeting_point: "South gate",
    distance_km: 15.2,
    pace: "5:05",
    strava_url: "https://strava.com/routes/p1",
    notes: "Long run along the river loop. Rain held off.",
    participants: ["Hanae", "Dmitri", "Aiko", "Priya"],
    status: "completed",
    photo_url: null,
    photo_hue: 20,
  },
  {
    id: "p2",
    creator: "Yuki",
    run_at: "2026-04-12T06:15:00",
    meeting_point: "Station north exit",
    distance_km: 10.0,
    pace: "5:40",
    strava_url: "",
    notes: "Recovery pace. Great vibes. Stopped for taiyaki.",
    participants: ["Yuki", "Sora", "Leni"],
    status: "completed",
    photo_url: null,
    photo_hue: 160,
  },
  {
    id: "p3",
    creator: "Tobi",
    run_at: "2026-04-05T17:30:00",
    meeting_point: "Shimoda lobby",
    distance_km: 7.7,
    pace: "5:20",
    strava_url: "",
    notes: "Sunset hill repeats. Brutal but beautiful.",
    participants: ["Tobi", "Marco", "Aiko", "Dmitri", "Sora"],
    status: "completed",
    photo_url: null,
    photo_hue: 300,
  },
];

export function fmtDate(iso: string) {
  const d = new Date(iso);
  const day = d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const dd = String(d.getDate()).padStart(2, "0");
  const mon = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return { day, dd, mon, hh, mm };
}

export function timeUntil(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff < 0) return "STARTED";
  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  if (days >= 1) return `IN ${days}D ${hrs}H`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return `IN ${hrs}H ${mins}M`;
}
```

- [ ] **Step 3: Commit**

```bash
git add types/index.ts lib/seed.ts
git commit -m "feat: Event/Participant types and seed data"
```

---

## Task 4: TweaksPanel

**Files:**
- Create: `components/ui/TweaksPanel.tsx`

- [ ] **Step 1: Write `components/ui/TweaksPanel.tsx`**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/TweaksPanel.tsx
git commit -m "feat: TweaksPanel with useTweaks hook and controls"
```

---

## Task 5: MusicPlayer

**Files:**
- Modify: `components/layout/MusicPlayer.tsx`

- [ ] **Step 1: Write `components/layout/MusicPlayer.tsx`**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/MusicPlayer.tsx
git commit -m "feat: MusicPlayer with animated bars and mute toggle"
```

---

## Task 6: ParticipantList

**Files:**
- Modify: `components/events/ParticipantList.tsx`

- [ ] **Step 1: Write `components/events/ParticipantList.tsx`**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add components/events/ParticipantList.tsx
git commit -m "feat: ParticipantList with removable chips"
```

---

## Task 7: EventCard (upcoming)

**Files:**
- Modify: `components/events/EventCard.tsx`

- [ ] **Step 1: Write `components/events/EventCard.tsx`**

```tsx
"use client";

import { useState } from "react";
import type { Event } from "@/types";
import { ParticipantList } from "./ParticipantList";
import { fmtDate, timeUntil } from "@/lib/seed";

interface EventCardProps {
  event: Event;
  index: number;
  onJoin: (event: Event) => void;
  onComplete: (id: string) => void;
  onRemove: (id: string, index: number) => void;
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
          onRemove={(i) => onRemove(event.id, i)}
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
```

- [ ] **Step 2: Commit**

```bash
git add components/events/EventCard.tsx
git commit -m "feat: UpcomingCard with tilt, streak, and run actions"
```

---

## Task 8: EventCardPast

**Files:**
- Modify: `components/events/EventCardPast.tsx`

- [ ] **Step 1: Write `components/events/EventCardPast.tsx`**

```tsx
"use client";

import { useState } from "react";
import type { Event } from "@/types";
import { fmtDate } from "@/lib/seed";

interface EventCardPastProps {
  event: Event;
  onUpload: (id: string) => void;
}

export function EventCardPast({ event, onUpload }: EventCardPastProps) {
  const d = fmtDate(event.run_at);
  const [hover, setHover] = useState(false);

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
              onClick={() => onUpload(event.id)}
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
          {event.participants.map((p, i) => (
            <span
              key={i}
              style={{
                fontSize: 11,
                padding: "3px 8px",
                background: "rgba(11,11,12,.06)",
                borderRadius: 999,
                fontWeight: 600,
              }}
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/events/EventCardPast.tsx
git commit -m "feat: PastCard with photo placeholder and upload button"
```

---

## Task 9: CreateEventModal

**Files:**
- Modify: `components/events/CreateEventModal.tsx`

- [ ] **Step 1: Write `components/events/CreateEventModal.tsx`**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add components/events/CreateEventModal.tsx
git commit -m "feat: CreateEventModal form with validation"
```

---

## Task 10: JoinDialog

**Files:**
- Modify: `components/events/JoinDialog.tsx`

- [ ] **Step 1: Write `components/events/JoinDialog.tsx`**

```tsx
"use client";

import { useState } from "react";
import type { Event } from "@/types";
import { fmtDate } from "@/lib/seed";

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
```

- [ ] **Step 2: Commit**

```bash
git add components/events/JoinDialog.tsx
git commit -m "feat: JoinDialog with comma-separated name input"
```

---

## Task 11: Header

**Files:**
- Modify: `components/layout/Header.tsx`

- [ ] **Step 1: Write `components/layout/Header.tsx`**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/Header.tsx
git commit -m "feat: Header with nav and MusicPlayer"
```

---

## Task 12: Dashboard (hero + full assembly)

**Files:**
- Modify: `components/layout/Dashboard.tsx`

- [ ] **Step 1: Write `components/layout/Dashboard.tsx`**

This is the main `"use client"` component. It contains the Hero section (including Runner, HeroWord, Digit, Stat, Marquee sub-components), the two Section grids, Footer, modals, and TweaksPanel.

```tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Event } from "@/types";
import { SEED_UPCOMING, SEED_PAST, fmtDate } from "@/lib/seed";
import { Header } from "./Header";
import { EventCard } from "@/components/events/EventCard";
import { EventCardPast } from "@/components/events/EventCardPast";
import { CreateEventModal } from "@/components/events/CreateEventModal";
import { JoinDialog } from "@/components/events/JoinDialog";
import {
  TweaksPanel,
  TweakSection,
  TweakRadio,
  TweakToggle,
  useTweaks,
} from "@/components/ui/TweaksPanel";

// ─── Pointer + Scroll hooks ───────────────────────────────────────────────────

function usePointer() {
  const [p, setP] = useState({ x: 0.5, y: 0.5 });
  const [v, setV] = useState(0);
  const last = useRef({ x: 0, y: 0, t: Date.now() });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth;
      const ny = e.clientY / window.innerHeight;
      const now = Date.now();
      const dt = Math.max(16, now - last.current.t);
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      const vel = (Math.sqrt(dx * dx + dy * dy) / dt) * 1000;
      last.current = { x: e.clientX, y: e.clientY, t: now };
      setP({ x: nx, y: ny });
      setV(Math.min(200, vel * 0.12));
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setV((v) => v * 0.85), 80);
    return () => clearInterval(id);
  }, []);

  return { pointer: p, velocity: v };
}

function useScroll() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const h = () => setY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return y;
}

// ─── Runner (abstract SVG figure) ─────────────────────────────────────────────

function Runner({
  scroll = 0,
  pointer = { x: 0.5, y: 0.5 },
  velocity = 0,
  size = 520,
}: {
  scroll?: number;
  pointer?: { x: number; y: number };
  velocity?: number;
  size?: number;
}) {
  const lean = Math.min(12, scroll * 0.015);
  const stride = Math.sin(scroll * 0.03) * 10;
  const shiftX = (pointer.x - 0.5) * 24;
  const shiftY = (pointer.y - 0.5) * 14;
  const streakLen = 60 + Math.min(140, velocity * 2);

  const streaks = [
    { y: 48,  c: "#ff2d55", delay: 0 },
    { y: 90,  c: "#ffb300", delay: 0.05 },
    { y: 132, c: "#00c2a8", delay: 0.1 },
    { y: 174, c: "#3d5afe", delay: 0.15 },
    { y: 216, c: "#8e24ff", delay: 0.2 },
    { y: 258, c: "#ff2d55", delay: 0.25 },
    { y: 300, c: "#ffb300", delay: 0.3 },
    { y: 342, c: "#00c2a8", delay: 0.35 },
  ];

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size * 0.95,
        transform: `translate(${shiftX}px, ${shiftY}px)`,
        transition: "transform .4s cubic-bezier(.2,.7,.2,1)",
        willChange: "transform",
      }}
    >
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {streaks.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              top: s.y,
              height: 6,
              width: streakLen + i * 8,
              background: `linear-gradient(90deg, transparent, ${s.c})`,
              borderRadius: 6,
              opacity: 0.85,
              transform: `translateX(${-velocity * 0.4 - i * 3}px)`,
              transition: `width .25s cubic-bezier(.2,.7,.2,1) ${s.delay}s, transform .25s`,
            }}
          />
        ))}
      </div>

      <svg
        viewBox="0 0 520 500"
        width={size}
        height={size * 0.95}
        style={{
          position: "absolute",
          inset: 0,
          transform: `rotate(${-lean * 0.4}deg) translateY(${stride}px)`,
          transition: "transform .6s cubic-bezier(.2,.7,.2,1)",
          filter: "drop-shadow(0 30px 30px rgba(0,0,0,.12))",
        }}
      >
        <defs>
          <linearGradient id="body" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff2d55" />
            <stop offset="35%" stopColor="#8e24ff" />
            <stop offset="70%" stopColor="#3d5afe" />
            <stop offset="100%" stopColor="#00c2a8" />
          </linearGradient>
          <linearGradient id="limb" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffb300" />
            <stop offset="100%" stopColor="#ff2d55" />
          </linearGradient>
          <linearGradient id="leg" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#00c2a8" />
            <stop offset="100%" stopColor="#3d5afe" />
          </linearGradient>
        </defs>
        <polygon points="120,360 180,300 240,340 220,420 150,440" fill="url(#leg)" opacity="0.85" />
        <polygon points="150,440 220,420 260,470 200,490" fill="#0b0b0c" />
        <polygon points="200,150 320,130 360,260 280,300 220,270" fill="url(#body)" />
        <polygon points="220,270 280,300 300,360 240,380" fill="#8e24ff" opacity="0.9" />
        <polygon points="280,300 360,260 380,340 300,360" fill="#3d5afe" opacity="0.85" />
        <polygon points="300,70 360,60 380,130 340,150 290,130" fill="url(#body)" />
        <polygon points="340,150 380,130 400,180 360,200" fill="#ff2d55" opacity="0.9" />
        <polygon points="360,180 440,140 470,170 420,220 370,220" fill="url(#limb)" />
        <polygon points="420,220 470,170 490,200 460,240" fill="#ffb300" />
        <polygon points="220,170 170,210 180,260 230,240" fill="#ff2d55" opacity="0.9" />
        <polygon points="280,340 340,380 360,460 310,480 280,430" fill="url(#leg)" />
        <polygon points="310,480 360,460 380,490 330,500" fill="#0b0b0c" />
        <polygon points="290,130 340,150 320,180 280,160" fill="#0b0b0c" opacity="0.8" />
        <polygon points="60,180 90,170 80,210 50,220" fill="#ff2d55" opacity="0.9" />
        <polygon points="30,240 70,230 60,270 20,280" fill="#ffb300" opacity="0.85" />
        <polygon points="80,300 110,295 100,330 70,340" fill="#00c2a8" opacity="0.9" />
        <polygon points="10,350 50,345 40,380 5,390" fill="#3d5afe" opacity="0.85" />
        <polygon points="100,80 130,90 115,120 95,110" fill="#8e24ff" opacity="0.85" />
      </svg>
    </div>
  );
}

// ─── Hero sub-components ──────────────────────────────────────────────────────

function HeroWord({ scroll, pointer }: { scroll: number; pointer: { x: number; y: number } }) {
  const px = (pointer.x - 0.5) * 10;
  const lines = ["SHIMODA", "RUNNING", "CLUB."];
  return (
    <h1
      className="display"
      style={{ fontSize: "clamp(80px, 11.5vw, 192px)", margin: 0, lineHeight: 0.85 }}
    >
      {lines.map((l, i) => (
        <div
          key={l}
          style={{
            overflow: "hidden",
            transform: `translateX(${px * (i === 1 ? 1.4 : 0.6)}px)`,
            transition: "transform .6s cubic-bezier(.2,.7,.2,1)",
          }}
        >
          <div
            style={{
              display: "inline-block",
              transform: `translateY(${Math.sin(scroll * 0.005 + i) * 3}px)`,
            }}
          >
            {l}
          </div>
        </div>
      ))}
    </h1>
  );
}

function Digit({ n }: { n: number }) {
  const [prev, setPrev] = useState(n);
  const [anim, setAnim] = useState(false);
  useEffect(() => {
    if (n !== prev) {
      setAnim(true);
      const id = setTimeout(() => { setPrev(n); setAnim(false); }, 300);
      return () => clearTimeout(id);
    }
  }, [n, prev]);
  return (
    <span style={{ display: "inline-block", animation: anim ? "tick .3s" : "none" }}>
      {String(n).padStart(2, "0")}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--muted)" }}>
        {label}
      </div>
      <div className="display" style={{ fontSize: 36, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function Marquee() {
  const items = ["RUN TOGETHER", "★", "NO LOGIN", "★", "JUST RUN", "★", "MAY 31 HALF", "★", "SHOW UP", "★", "EASY PACE", "★"];
  const content = [...items, ...items, ...items];
  return (
    <div
      style={{
        position: "relative",
        marginTop: 72,
        borderTop: "1.5px solid var(--ink)",
        borderBottom: "1.5px solid var(--ink)",
        overflow: "hidden",
        padding: "18px 0",
        background: "var(--ink)",
        color: "var(--bg)",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 40,
          whiteSpace: "nowrap",
          animation: "marquee 40s linear infinite",
          width: "max-content",
        }}
      >
        {content.map((t, i) => (
          <span key={i} className="display" style={{ fontSize: 28 }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function GrainOverlay() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 30,
        opacity: 0.06,
        mixBlendMode: "multiply",
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='0.9'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`,
      }}
    />
  );
}

// ─── Hero section ─────────────────────────────────────────────────────────────

function Hero({
  onNewRun,
  pointer,
  scroll,
  velocity,
}: {
  onNewRun: () => void;
  pointer: { x: number; y: number };
  scroll: number;
  velocity: number;
}) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const target = new Date("2026-05-31T07:00:00");
  const diff = target.getTime() - now.getTime();
  const countdown = {
    d: Math.max(0, Math.floor(diff / 86400000)),
    h: Math.max(0, Math.floor((diff % 86400000) / 3600000)),
    m: Math.max(0, Math.floor((diff % 3600000) / 60000)),
    s: Math.max(0, Math.floor((diff % 60000) / 1000)),
  };

  return (
    <section style={{ position: "relative", padding: "96px 56px 64px", minHeight: "100vh", overflow: "hidden" }}>
      <Header onNewRun={onNewRun} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.3fr 1fr",
          gap: 40,
          alignItems: "center",
          position: "relative",
          minHeight: "70vh",
        }}
      >
        {/* left */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <HeroWord scroll={scroll} pointer={pointer} />
          <div style={{ marginTop: 28, maxWidth: 520, display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.25 }}>
              Welcome to the dorm&apos;s <span className="rainbow">running club</span>.
              Lace up, show up, run together — no login, just a shared board.
            </div>
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
              <Stat label="NEXT RACE" value="MAY 31" />
              <Stat label="RUNNERS" value="24" />
              <Stat label="KM THIS WEEK" value="312" />
            </div>
          </div>
        </div>

        {/* right: runner + countdown */}
        <div style={{ position: "relative", height: 540 }}>
          <div
            style={{
              position: "absolute",
              right: -40,
              top: -20,
              transform: `translateY(${scroll * 0.12}px)`,
            }}
          >
            <Runner scroll={scroll} pointer={pointer} velocity={velocity} size={560} />
          </div>
          <div
            style={{
              position: "absolute",
              left: -40,
              bottom: 0,
              background: "var(--ink)",
              color: "var(--bg)",
              padding: "18px 22px",
              borderRadius: 2,
              boxShadow: "0 24px 48px rgba(0,0,0,.18)",
              transform: `translateY(${scroll * -0.06}px)`,
            }}
          >
            <div className="mono" style={{ fontSize: 11, letterSpacing: "0.12em", opacity: 0.7 }}>
              HALF MARATHON STARTS IN
            </div>
            <div className="display" style={{ fontSize: 44, lineHeight: 1, marginTop: 6 }}>
              <Digit n={countdown.d} />D <Digit n={countdown.h} />H{" "}
              <Digit n={countdown.m} />M <Digit n={countdown.s} />S
            </div>
          </div>
        </div>
      </div>

      <Marquee />
    </section>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  id,
  number,
  kicker,
  title,
  subtitle,
  action,
  children,
}: {
  id: string;
  number: string;
  kicker: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} style={{ padding: "96px 56px", position: "relative" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 24,
          marginBottom: 48,
          flexWrap: "wrap",
          borderBottom: "1.5px solid var(--ink)",
          paddingBottom: 24,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
            <div
              className="mono"
              style={{
                fontSize: 11,
                letterSpacing: "0.15em",
                fontWeight: 700,
                background: "var(--ink)",
                color: "var(--bg)",
                padding: "4px 10px",
                whiteSpace: "nowrap",
              }}
            >
              § {number}
            </div>
            <div className="mono" style={{ fontSize: 11, letterSpacing: "0.15em", color: "var(--muted)" }}>
              {kicker}
            </div>
          </div>
          <h2
            className="display"
            style={{ fontSize: "clamp(48px, 7vw, 96px)", margin: 0, letterSpacing: "-0.02em" }}
          >
            {title}
          </h2>
          <div style={{ fontSize: 16, color: "var(--muted)", marginTop: 10, maxWidth: 600 }}>
            {subtitle}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer
      style={{
        background: "var(--ink)",
        color: "var(--bg)",
        padding: "64px 56px 32px",
        marginTop: 64,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        className="display"
        style={{ fontSize: "clamp(80px, 14vw, 220px)", lineHeight: 0.85, letterSpacing: "-0.03em" }}
      >
        JUST<br />RUN.
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginTop: 48,
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        <div className="mono" style={{ fontSize: 11, letterSpacing: "0.12em", opacity: 0.6 }}>
          SHIMODA RUNNING CLUB · EST 2024 · NO LOGIN · NO BS
        </div>
        <div className="mono" style={{ fontSize: 11, letterSpacing: "0.12em", opacity: 0.6 }}>
          MAY 31 · HALF MARATHON
        </div>
      </div>
    </footer>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function Dashboard() {
  const [upcoming, setUpcoming] = useState<Event[]>(SEED_UPCOMING);
  const [past, setPast] = useState<Event[]>(SEED_PAST);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinEvent, setJoinEvent] = useState<Event | null>(null);

  const tweaks = useTweaks({ accent: "rainbow", grain: true, cardStyle: "solid-shadow" });

  const { pointer, velocity } = usePointer();
  const scroll = useScroll();

  // reveal-on-scroll
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [upcoming, past]);

  const addEvent = useCallback((ev: Event) => {
    setUpcoming((prev) =>
      [...prev, ev].sort((a, b) => new Date(a.run_at).getTime() - new Date(b.run_at).getTime())
    );
  }, []);

  const joinRun = useCallback((id: string, names: string[]) => {
    setUpcoming((prev) =>
      prev.map((e) => (e.id === id ? { ...e, participants: [...e.participants, ...names] } : e))
    );
  }, []);

  const removePart = useCallback((id: string, idx: number) => {
    setUpcoming((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, participants: e.participants.filter((_, i) => i !== idx) } : e
      )
    );
  }, []);

  const completeRun = useCallback((id: string) => {
    setUpcoming((prev) => {
      const ev = prev.find((e) => e.id === id);
      if (!ev) return prev;
      setPast((p) => [
        { ...ev, id: "p" + Date.now(), status: "completed" as const, photo_url: null, photo_hue: Math.floor(Math.random() * 360) },
        ...p,
      ]);
      return prev.filter((e) => e.id !== id);
    });
  }, []);

  const uploadPhoto = useCallback((id: string) => {
    setPast((prev) =>
      prev.map((p) => (p.id === id ? { ...p, photo_url: `https://picsum.photos/seed/${id}/600/400` } : p))
    );
  }, []);

  const sorted = [...upcoming].sort(
    (a, b) => new Date(a.run_at).getTime() - new Date(b.run_at).getTime()
  );

  const bigBtn: React.CSSProperties = {
    background: "var(--ink)",
    color: "var(--bg)",
    padding: "16px 24px",
    borderRadius: 999,
    fontWeight: 800,
    letterSpacing: "0.08em",
    fontSize: 13,
  };

  return (
    <div style={{ position: "relative" }}>
      {tweaks.grain && <GrainOverlay />}

      <Hero onNewRun={() => setCreateOpen(true)} pointer={pointer} scroll={scroll} velocity={velocity} />

      <Section
        id="upcoming"
        number="01"
        kicker="THIS WEEK"
        title="UPCOMING RUNS"
        subtitle={`${sorted.length} runs on the board. Show up or add one.`}
        action={
          <button onClick={() => setCreateOpen(true)} style={bigBtn}>
            + NEW RUN
          </button>
        }
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
            gap: 20,
          }}
        >
          {sorted.map((ev, i) => (
            <EventCard
              key={ev.id}
              event={ev}
              index={i}
              onJoin={setJoinEvent}
              onComplete={completeRun}
              onRemove={removePart}
            />
          ))}
        </div>
      </Section>

      <Section
        id="past"
        number="02"
        kicker="IN THE BOOKS"
        title="PAST RUNS"
        subtitle="The archive. No deletes."
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 20,
          }}
        >
          {past.map((ev) => (
            <EventCardPast key={ev.id} event={ev} onUpload={uploadPhoto} />
          ))}
        </div>
      </Section>

      <Footer />

      <CreateEventModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={addEvent} />
      <JoinDialog event={joinEvent} onClose={() => setJoinEvent(null)} onJoin={joinRun} />

      <TweaksPanel tweaks={tweaks}>
        <TweakSection title="Accent" />
        <TweakRadio
          label="Style"
          tweaks={tweaks}
          k="accent"
          options={[
            { value: "rainbow", label: "Rainbow" },
            { value: "mono", label: "Monochrome" },
          ]}
        />
        <TweakSection title="Atmosphere" />
        <TweakToggle label="Grain overlay" tweaks={tweaks} k="grain" />
        <TweakSection title="Card style" />
        <TweakRadio
          label="Shadow"
          tweaks={tweaks}
          k="cardStyle"
          options={[
            { value: "solid-shadow", label: "Solid" },
            { value: "soft", label: "Soft" },
            { value: "flat", label: "Flat" },
          ]}
        />
      </TweaksPanel>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/Dashboard.tsx
git commit -m "feat: Dashboard with Hero, Runner, sections, footer, and state"
```

---

## Task 13: app/page.tsx

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Write `app/page.tsx`**

```tsx
import { Dashboard } from "@/components/layout/Dashboard";

export default function Page() {
  return <Dashboard />;
}
```

- [ ] **Step 2: Run dev server and verify**

```bash
npm run dev
```

Open `http://localhost:3000`. Verify:
- Hero section renders with SHIMODA RUNNING CLUB wordmark
- Runner SVG figure visible on right
- Countdown timer ticking
- Marquee scrolling
- 4 upcoming cards visible with seed data
- 3 past cards visible with gradient placeholders
- MusicPlayer shows in header
- NEW RUN button opens modal
- TweaksPanel visible in bottom-right corner
- Grain overlay visible

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: page.tsx renders Dashboard"
```

---

## Task 14: Playwright smoke tests

**Files:**
- Modify: `tests/e2e/dashboard.spec.ts`
- Modify: `tests/e2e/create-event.spec.ts`
- Modify: `tests/e2e/join-event.spec.ts`

- [ ] **Step 1: Install Playwright browsers**

```bash
npx playwright install --with-deps chromium
```

- [ ] **Step 2: Write `tests/e2e/dashboard.spec.ts`**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("renders hero section", async ({ page }) => {
    await page.goto("http://localhost:3000");
    await expect(page.getByText("SHIMODA")).toBeVisible();
    await expect(page.getByText("RUNNING")).toBeVisible();
    await expect(page.getByText("CLUB.")).toBeVisible();
  });

  test("shows upcoming and past section headings", async ({ page }) => {
    await page.goto("http://localhost:3000");
    await expect(page.getByText("UPCOMING RUNS")).toBeVisible();
    await expect(page.getByText("PAST RUNS")).toBeVisible();
  });

  test("shows seed event cards", async ({ page }) => {
    await page.goto("http://localhost:3000");
    await expect(page.getByText("Shimoda lobby — bench by the vending machines")).toBeVisible();
    await expect(page.getByText("East gate, under the red torii")).toBeVisible();
  });

  test("shows music player", async ({ page }) => {
    await page.goto("http://localhost:3000");
    await expect(page.getByText("MUTED")).toBeVisible();
  });

  test("complete button moves event to past", async ({ page }) => {
    await page.goto("http://localhost:3000");
    const completeBtn = page.getByRole("button", { name: "COMPLETE" }).first();
    await completeBtn.click();
    const pastCards = page.locator("text=✓ COMPLETED");
    await expect(pastCards).toHaveCount(4);
  });
});
```

- [ ] **Step 3: Write `tests/e2e/create-event.spec.ts`**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Create event flow", () => {
  test("NEW RUN button opens modal", async ({ page }) => {
    await page.goto("http://localhost:3000");
    await page.getByRole("button", { name: /NEW RUN/ }).first().click();
    await expect(page.getByText("NEW RUN").nth(1)).toBeVisible();
    await expect(page.getByPlaceholder("Who's organizing?")).toBeVisible();
  });

  test("submit is disabled until required fields filled", async ({ page }) => {
    await page.goto("http://localhost:3000");
    await page.getByRole("button", { name: /NEW RUN/ }).first().click();
    const submit = page.getByRole("button", { name: "CREATE RUN →" });
    await expect(submit).toBeDisabled();
  });

  test("creates event and shows it in upcoming", async ({ page }) => {
    await page.goto("http://localhost:3000");
    await page.getByRole("button", { name: /NEW RUN/ }).first().click();

    await page.getByPlaceholder("Who's organizing?").fill("TestRunner");
    await page.locator('input[type="datetime-local"]').fill("2026-06-01T08:00");
    await page.getByPlaceholder("Where do we meet?").fill("Main gate");
    await page.locator('input[type="number"]').fill("10");
    await page.getByPlaceholder("5:30").fill("5:00");

    await page.getByRole("button", { name: "CREATE RUN →" }).click();
    await expect(page.getByText("Main gate")).toBeVisible();
  });
});
```

- [ ] **Step 4: Write `tests/e2e/join-event.spec.ts`**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Join event flow", () => {
  test("JOIN RUN button opens dialog", async ({ page }) => {
    await page.goto("http://localhost:3000");
    await page.getByRole("button", { name: "JOIN RUN →" }).first().click();
    await expect(page.getByText("JOIN RUN")).toBeVisible();
    await expect(page.getByPlaceholder("Yuki, Tobi")).toBeVisible();
  });

  test("joining adds names to participant list", async ({ page }) => {
    await page.goto("http://localhost:3000");
    await page.getByRole("button", { name: "JOIN RUN →" }).first().click();
    await page.getByPlaceholder("Yuki, Tobi").fill("NewRunner");
    await page.getByRole("button", { name: "JOIN →" }).click();
    await expect(page.getByText("NewRunner")).toBeVisible();
  });
});
```

- [ ] **Step 5: Add `playwright.config.ts`**

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://localhost:3000",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
});
```

- [ ] **Step 6: Run tests**

```bash
npm run test:e2e
```

Expected: All tests pass.

- [ ] **Step 7: Commit**

```bash
git add tests/e2e/ playwright.config.ts
git commit -m "test: Playwright smoke tests for dashboard, create, and join flows"
```
