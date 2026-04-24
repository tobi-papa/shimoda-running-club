# Shimoda Running Club — UI Design Spec

**Date:** 2026-04-24  
**Scope:** UI-only implementation (no backend, no API calls). Full Next.js project scaffold + pixel-perfect translation of the HTML prototype from the handoff ZIP.

---

## 1. Project Setup

### Files to create / populate

| File | Purpose |
|---|---|
| `package.json` | Next.js 14.2, React 19, TypeScript, Tailwind 3.4, shadcn/ui, Prisma 5 |
| `next.config.ts` | Minimal — no special config needed for UI-only phase |
| `tailwind.config.ts` | Content paths only, no token extensions |
| `postcss.config.js` | Standard Tailwind + autoprefixer |
| `components.json` | shadcn/ui config pointing at `components/ui/` |
| `app/globals.css` | CSS custom properties, font face classes, global resets, keyframes |
| `app/layout.tsx` | Root layout with next/font/google, applies font classes to `<html>` |
| `app/page.tsx` | Server component — renders `<Dashboard />` |

### CSS custom properties (globals.css)

```css
--bg: #f3f1ec
--ink: #0b0b0c
--ink-2: #1a1a1d
--muted: #6b6b70
--paper: #ffffff
--accent-a: #ff2d55   /* magenta-red */
--accent-b: #ffb300   /* amber */
--accent-c: #00c2a8   /* teal */
--accent-d: #3d5afe   /* indigo */
--accent-e: #8e24ff   /* violet */
```

### Fonts (next/font/google)

- `Archivo Black` — display headings (`.display` class)
- `Archivo` — body text
- `JetBrains Mono` — monospaced labels (`.mono` class)

### Keyframes

- `marquee` — horizontal scroll for the hero ticker
- `tick` — bounce for countdown digits
- `spin` — rotating logo dot
- `fadeIn` / `rise` — modal entrance animations
- `.reveal` / `.reveal.in` — scroll-triggered opacity + translateY

---

## 2. Component Breakdown

### `types/index.ts`
TypeScript interfaces matching the PRD data model:
- `Event` — id, creator_name, run_at, meeting_point, distance_km, pace, strava_url, notes, status, photo_url, participants
- `Participant` — id, event_id, name, joined_at

### `lib/seed.ts`
- `SEED_UPCOMING` — 4 prototype events (Aiko, Dmitri, Sora, Leni)
- `SEED_PAST` — 3 completed events (Hanae, Yuki, Tobi)
- `fmtDate(iso)` — returns `{ day, dd, mon, hh, mm }`
- `timeUntil(iso)` — returns human string like "IN 2D 4H"

### `components/layout/MusicPlayer.tsx`
- Play/pause toggle with SVG icons
- Mute/unmute toggle with SVG icons
- 5-bar animated visualizer (random heights when playing + unmuted)
- Starts: playing=true, muted=true (matches PRD autoplay policy workaround)

### `components/layout/Header.tsx`
- Left: spinning gradient dot + "SHIMODA / RUN CLUB / EST. 2024" mono label
- Right: `<MusicPlayer />`, UPCOMING anchor, PAST anchor, NEW RUN CTA button
- Receives `onNewRun` callback prop

### `components/layout/Dashboard.tsx`
The page root — `"use client"`. Contains:
- `GrainOverlay` — fixed noise SVG overlay (toggled by tweaks.grain)
- `<Hero>` — receives onNewRun, pointer, scroll
- Upcoming `<Section>` — grid of `<EventCard>`
- Past `<Section>` — grid of `<EventCardPast>`
- `<Footer>` — large "JUST RUN." type + club tagline
- `<CreateEventModal>` + `<JoinModal>`
- `<TweaksPanel>` with accent/grain/cardStyle controls
- `usePointer()` and `useScroll()` hooks (defined inline)
- All state: upcoming, past, createOpen, joinEvent, tweaks

Hero sub-components (defined inside Dashboard, not exported):
- `HeroWord` — 3-line animated wordmark reacting to pointer
- `Runner` — SVG polygon figure with motion streaks
- `Digit` — bouncing countdown digit
- `Stat` — label + large display number
- `Marquee` — ticker strip

### `components/events/ParticipantList.tsx`
- Renders participant chips with name + × remove button
- Hover inverts chip colors
- Receives `participants: string[]` + `onRemove(index)` prop

### `components/events/EventCard.tsx`
- Reveal-on-scroll, 3D tilt on mouse move
- Rainbow accent streak on hover (top border)
- Date block (inverts on hover), distance/pace, meeting point
- Notes blockquote (conditional)
- `<ParticipantList />`
- JOIN RUN button → `onJoin(event)`, COMPLETE button → `onComplete(id)`
- STRAVA ROUTE link (conditional)
- Solid shadow style: 4px → 10px on hover (driven by tweaks.cardStyle)

### `components/events/EventCardPast.tsx`
- Photo area: real image if `photo_url` set, else gradient placeholder with stripe pattern
- UPLOAD PHOTO button (appears on hover, simulates upload with picsum URL)
- "✓ COMPLETED" badge
- Distance, pace, runner count, notes, participant chips
- No remove/join actions

### `components/events/CreateEventModal.tsx`
- Modal wrapper with dark header, × close, click-outside-to-close
- Fields: creator name, datetime-local, distance, meeting point, pace, strava_url (optional), notes (optional)
- Submit disabled until required fields filled
- On submit: calls `onCreate(event)`, resets form, closes

### `components/events/JoinDialog.tsx`
- Modal with run summary (day, distance, pace, creator + participant count)
- Single text input for name(s) — comma-separated for multiple
- On submit: splits, calls `onJoin(eventId, names[])`, closes

### `components/ui/TweaksPanel.tsx`
- Translated directly from `tweaks-panel.jsx` in the prototype
- Self-contained: draggable panel, accordion sections, radio + toggle controls
- Exports `useTweaks(defaults)` hook

---

## 3. State & Data Flow

All state in `Dashboard.tsx` — no API calls in this phase.

```
Dashboard
  state: upcoming[], past[], createOpen, joinEvent, tweaks
  │
  ├── Header (onNewRun → setCreateOpen(true))
  ├── Hero (onNewRun, pointer, scroll)
  ├── Section "upcoming"
  │     └── EventCard[] (onJoin, onComplete, onRemove)
  ├── Section "past"
  │     └── EventCardPast[] (onUpload)
  ├── Footer
  ├── CreateEventModal (onCreate → addEvent)
  ├── JoinModal (onJoin → joinRun)
  └── TweaksPanel
```

**State mutations (local only):**
- `addEvent(ev)` — append + sort upcoming by run_at
- `joinRun(id, names[])` — append names to event.participants
- `removePart(id, idx)` — filter participant by index
- `completeRun(id)` — move from upcoming → past (with random photo_hue)
- `uploadPhoto(id)` — set photo_url on past event (picsum simulation)

---

## 4. Styling Approach

**Option A — Inline styles faithful to prototype.**

- All colors via CSS custom properties (`var(--ink)`, etc.)
- Animations via `globals.css` keyframes
- Dynamic values (tilt transforms, hover states, streak widths) via `style` prop
- No Tailwind design token extensions
- Tailwind used only for global resets and any structural utility classes where natural

---

## 5. Out of Scope

- No API routes (stubs remain empty)
- No Prisma schema / database
- No Supabase realtime
- No real audio file (MusicPlayer UI only, no `<audio>` element yet)
- No photo upload to Supabase Storage (simulated with picsum)
- No E2E tests
