# UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add edit/delete for upcoming and past runs, re-upload photo for past runs, Strava link on past runs, hide Tweaks panel by default, fix mobile title sizing.

**Architecture:** All changes are UI-only except two API stubs (PATCH and DELETE on `/api/events/[id]/route.ts`) that need implementing. A new `EditEventModal` component reuses the `CreateEventModal` pattern. Inline confirmation UX (no third-party library) matches existing pill-button style.

**Tech Stack:** Next.js App Router, React, TypeScript, Supabase (server client), Tailwind (globals.css for media queries), inline styles (existing pattern).

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `components/ui/TweaksPanel.tsx` | Modify | Default hidden; add floating toggle button |
| `components/events/EventCardPast.tsx` | Modify | Re-upload photo on hover; delete with confirm; Strava link |
| `components/events/EventCard.tsx` | Modify | Edit button; delete with inline confirm |
| `components/events/EditEventModal.tsx` | Create | Pre-filled edit form modal |
| `components/layout/Dashboard.tsx` | Modify | Wire editRun, deleteRun handlers; pass to cards |
| `app/api/events/[id]/route.ts` | Modify | Implement PATCH and DELETE (currently 501) |
| `app/globals.css` | Modify | Fix hero h1 clamp minimum; center hero word on mobile |

---

### Task 1: Implement PATCH and DELETE API endpoints

**Files:**
- Modify: `app/api/events/[id]/route.ts`

- [ ] **Step 1: Replace the stub with real implementations**

Replace the entire file with:

```ts
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET() {
  return NextResponse.json({}, { status: 501 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = createServerClient();
  const body = await request.json();

  const { data, error } = await db
    .from("events")
    .update({
      run_at: body.run_at,
      meeting_point: body.meeting_point,
      distance_km: body.distance_km,
      pace: body.pace,
      strava_url: body.strava_url || null,
      notes: body.notes || null,
    })
    .eq("id", id)
    .select("*, participants(id, name)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ...data, distance_km: Number(data.distance_km) });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = createServerClient();

  const { error } = await db.from("events").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return new NextResponse(null, { status: 204 });
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/events/\[id\]/route.ts
git commit -m "feat: implement PATCH and DELETE for events API"
```

---

### Task 2: Create EditEventModal

**Files:**
- Create: `components/events/EditEventModal.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useState, useEffect } from "react";
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

interface EditEventModalProps {
  event: Event | null;
  onClose: () => void;
  onSave: (id: string, patch: {
    run_at: string;
    meeting_point: string;
    distance_km: number;
    pace: string;
    strava_url?: string;
    notes?: string;
  }) => void;
}

export function EditEventModal({ event, onClose, onSave }: EditEventModalProps) {
  const [form, setForm] = useState({
    run_at: "",
    meeting_point: "",
    distance_km: "",
    pace: "",
    strava_url: "",
    notes: "",
  });

  useEffect(() => {
    if (!event) return;
    // datetime-local expects "YYYY-MM-DDTHH:mm"
    const local = new Date(event.run_at).toISOString().slice(0, 16);
    setForm({
      run_at: local,
      meeting_point: event.meeting_point,
      distance_km: String(event.distance_km),
      pace: event.pace,
      strava_url: event.strava_url ?? "",
      notes: event.notes ?? "",
    });
  }, [event]);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [k]: e.target.value });

  const canSubmit = form.run_at && form.meeting_point && form.distance_km && form.pace;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !event) return;
    onSave(event.id, {
      run_at: form.run_at,
      meeting_point: form.meeting_point,
      distance_km: Number(form.distance_km),
      pace: form.pace,
      strava_url: form.strava_url || undefined,
      notes: form.notes || undefined,
    });
    onClose();
  };

  if (!event) return null;

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
          <div className="display" style={{ fontSize: 22 }}>EDIT RUN</div>
          <button onClick={onClose} style={{ fontSize: 22, lineHeight: 1, color: "var(--bg)" }}>×</button>
        </div>

        <form onSubmit={submit} style={{ padding: 24 }}>
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
              SAVE CHANGES →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/events/EditEventModal.tsx
git commit -m "feat: add EditEventModal component"
```

---

### Task 3: Update EventCard (upcoming runs — edit + delete)

**Files:**
- Modify: `components/events/EventCard.tsx`

The card needs an `onEdit` and `onDelete` prop. Delete shows an inline confirmation replacing the action buttons row.

- [ ] **Step 1: Replace the file with the updated version**

```tsx
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
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}

export function EventCard({ event, index, onJoin, onComplete, onRemove, onEdit, onDelete }: EventCardProps) {
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
          background: "linear-gradient(90deg,#ff2d55,#ffb300,#00c2a8,#3d5afe,#8e24ff)",
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
      {confirming ? (
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span className="mono" style={{ fontSize: 11, letterSpacing: "0.08em", color: "var(--muted)" }}>
            DELETE THIS RUN?
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
                color: "var(--ink)",
              }}
            >
              STRAVA ROUTE ↗
            </a>
          )}
        </div>
      )}

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

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: errors about missing `onEdit`/`onDelete` props in `Dashboard.tsx` — that's expected, fixed in Task 5.

- [ ] **Step 3: Commit**

```bash
git add components/events/EventCard.tsx
git commit -m "feat: add edit and delete actions to EventCard"
```

---

### Task 4: Update EventCardPast (re-upload photo, delete, Strava link)

**Files:**
- Modify: `components/events/EventCardPast.tsx`

Changes:
- Upload button shown on hover whether or not a photo exists (overlaid on photo area).
- Delete button in content area with inline confirmation.
- Strava link in content area.

- [ ] **Step 1: Replace the file with the updated version**

```tsx
"use client";

import { useState, useRef } from "react";
import type { Event } from "@/types";
import { fmtDate } from "@/lib/utils";

interface EventCardPastProps {
  event: Event;
  onUpload: (id: string, file: File) => void;
  onDelete: (id: string) => void;
}

export function EventCardPast({ event, onUpload, onDelete }: EventCardPastProps) {
  const d = fmtDate(event.run_at);
  const [hover, setHover] = useState(false);
  const [confirming, setConfirming] = useState(false);
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
          </>
        )}

        {/* upload button — always available on hover */}
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
          {event.photo_url ? "CHANGE PHOTO ↑" : "UPLOAD PHOTO ↑"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

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

        {/* strava link */}
        {event.strava_url && (
          <a
            href={event.strava_url}
            target="_blank"
            rel="noreferrer"
            className="mono"
            style={{
              display: "inline-block",
              marginTop: 12,
              fontSize: 11,
              letterSpacing: "0.1em",
              textDecoration: "underline",
              color: "var(--ink)",
            }}
          >
            STRAVA ROUTE ↗
          </a>
        )}

        {/* delete */}
        <div style={{ marginTop: 16 }}>
          {confirming ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span className="mono" style={{ fontSize: 11, letterSpacing: "0.08em", color: "var(--muted)" }}>
                DELETE THIS RUN?
              </span>
              <button
                onClick={() => { onDelete(event.id); setConfirming(false); }}
                style={{
                  background: "var(--accent-a)",
                  color: "#fff",
                  padding: "8px 14px",
                  borderRadius: 999,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  fontSize: 11,
                }}
              >
                CONFIRM
              </button>
              <button
                onClick={() => setConfirming(false)}
                style={{
                  border: "1.5px solid var(--ink)",
                  padding: "8px 14px",
                  borderRadius: 999,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  fontSize: 11,
                }}
              >
                CANCEL
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="mono"
              style={{
                fontSize: 11,
                letterSpacing: "0.1em",
                color: "var(--muted)",
                textDecoration: "underline",
              }}
            >
              DELETE RUN
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: errors about missing `onDelete` prop passed from `Dashboard.tsx` — fixed in Task 5.

- [ ] **Step 3: Commit**

```bash
git add components/events/EventCardPast.tsx
git commit -m "feat: add photo re-upload, delete, and strava link to past run cards"
```

---

### Task 5: Wire everything up in Dashboard

**Files:**
- Modify: `components/layout/Dashboard.tsx`

Changes:
- Import `EditEventModal`
- Add `editEvent` state
- Add `editRun` callback (PATCH)
- Add `deleteRun` callback (DELETE, works for both upcoming and past)
- Pass `onEdit`, `onDelete` to `EventCard`
- Pass `onDelete` to `EventCardPast`
- Render `EditEventModal`

- [ ] **Step 1: Apply changes to Dashboard.tsx**

In the imports section, add:
```tsx
import { EditEventModal } from "@/components/events/EditEventModal";
```

In the state section (after `joinEvent` state), add:
```tsx
const [editEvent, setEditEvent] = useState<Event | null>(null);
```

After the `uploadPhoto` callback, add:
```tsx
const editRun = useCallback(async (id: string, patch: {
  run_at: string;
  meeting_point: string;
  distance_km: number;
  pace: string;
  strava_url?: string;
  notes?: string;
}) => {
  await fetch(`/api/events/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
}, []);

const deleteRun = useCallback(async (id: string) => {
  await fetch(`/api/events/${id}`, { method: "DELETE" });
}, []);
```

Update the `EventCard` render call:
```tsx
<EventCard
  key={ev.id}
  event={ev}
  index={i}
  onJoin={setJoinEvent}
  onComplete={completeRun}
  onRemove={removePart}
  onEdit={setEditEvent}
  onDelete={deleteRun}
/>
```

Update the `EventCardPast` render call:
```tsx
<EventCardPast key={ev.id} event={ev} onUpload={uploadPhoto} onDelete={deleteRun} />
```

After the `JoinDialog` render, add:
```tsx
<EditEventModal event={editEvent} onClose={() => setEditEvent(null)} onSave={editRun} />
```

- [ ] **Step 2: Verify TypeScript compiles with no errors**

```bash
npx tsc --noEmit
```
Expected: clean (no errors).

- [ ] **Step 3: Commit**

```bash
git add components/layout/Dashboard.tsx
git commit -m "feat: wire up edit and delete handlers in Dashboard"
```

---

### Task 6: Hide TweaksPanel by default + add toggle button

**Files:**
- Modify: `components/ui/TweaksPanel.tsx`

Changes:
- `useState(true)` → `useState(false)`
- When panel is hidden, render a small floating "TWEAKS" pill button that opens it.

- [ ] **Step 1: Edit TweaksPanel.tsx**

Change line 105 from:
```tsx
export function TweaksPanel({ children }: TweaksPanelProps) {
  const [visible, setVisible] = useState(true);
```
to:
```tsx
export function TweaksPanel({ children }: TweaksPanelProps) {
  const [visible, setVisible] = useState(false);
```

Then change the early-return block:
```tsx
if (!visible) return null;
```
to:
```tsx
if (!visible) return (
  <>
    <style>{PANEL_STYLES}</style>
    <button
      onClick={() => setVisible(true)}
      className="mono"
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 2147483646,
        background: "rgba(250,249,247,.85)",
        color: "#29261b",
        border: ".5px solid rgba(255,255,255,.6)",
        borderRadius: 999,
        padding: "8px 16px",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        backdropFilter: "blur(24px) saturate(160%)",
        WebkitBackdropFilter: "blur(24px) saturate(160%)",
        boxShadow: "0 4px 16px rgba(0,0,0,.14)",
        cursor: "pointer",
      }}
    >
      TWEAKS
    </button>
  </>
);
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/TweaksPanel.tsx
git commit -m "fix: hide tweaks panel by default, add toggle button"
```

---

### Task 7: Fix mobile title sizing

**Files:**
- Modify: `app/globals.css`

The hero h1 uses `clamp(80px, 11.5vw, 192px)` — on phones (≤390px) the 80px minimum makes "SHIMODA" overflow. Lower min to `52px`. Also center the hero word text block on mobile.

- [ ] **Step 1: Add a mobile override to globals.css**

In the `@media (max-width: 768px)` block, add these two lines after `.header-new-run`:

```css
  .hero-word { font-size: clamp(52px, 14vw, 80px) !important; text-align: center !important; }
  .header-outer .mono { font-size: 11px !important; }
```

- [ ] **Step 2: Add the `hero-word` className to the h1 in Dashboard.tsx**

Find the `HeroWord` component's `<h1>` in `components/layout/Dashboard.tsx`:
```tsx
<h1
  className="display"
  style={{ fontSize: "clamp(80px, 11.5vw, 192px)", margin: 0, lineHeight: 0.85 }}
>
```
Change to:
```tsx
<h1
  className="display hero-word"
  style={{ fontSize: "clamp(80px, 11.5vw, 192px)", margin: 0, lineHeight: 0.85 }}
>
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css components/layout/Dashboard.tsx
git commit -m "fix: reduce hero title size on mobile, center header text"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Tweaks panel hidden on open → Task 6
- ✅ Past runs: change photo → Task 4 (upload button always visible on hover)
- ✅ Past runs: delete with confirmation → Task 4 + Task 1 (DELETE API)
- ✅ Past runs: Strava link → Task 4
- ✅ Upcoming runs: edit info (participants untouched) → Task 2 + Task 3 + Task 5 + Task 1 (PATCH API)
- ✅ Upcoming runs: delete with confirmation → Task 3 + Task 5 + Task 1 (DELETE API)
- ✅ Mobile title smaller and centered → Task 7

**Placeholder scan:** None found.

**Type consistency:**
- `onDelete: (id: string) => void` — consistent across EventCard (Task 3), EventCardPast (Task 4), Dashboard (Task 5).
- `onEdit: (event: Event) => void` — consistent across EventCard (Task 3) and Dashboard (Task 5).
- `EditEventModal.onSave` signature matches `editRun` callback signature in Dashboard (Task 5).
- PATCH body fields (`run_at`, `meeting_point`, `distance_km`, `pace`, `strava_url`, `notes`) match what the API endpoint reads in Task 1.
