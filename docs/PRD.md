# Shimoda Running Club — Product Requirements Document

## Purpose

A lightweight, no-auth web app for a dormitory running club. The goal is to make it trivially easy for residents to see when someone is going for a run and join them. No login, no privacy concerns — just a shared live board for the dorm.

---

## Users & Access

- No authentication. Anyone with the URL can access and interact.
- Identity is self-reported: users type their name when creating an event or joining one.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14.2+ (App Router, React 19) |
| Database | Supabase Postgres v16 |
| ORM | Prisma 5.4+ |
| Real-time | Supabase Realtime (websockets) |
| Storage | Supabase Storage (photos) |
| UI | Tailwind 3.4 + shadcn/ui |
| Testing | Playwright E2E |

---

## Features

### 1. Dashboard (Upcoming Runs)

- Full-page dashboard with Shimoda layout (visual placeholder — to be designed separately).
- Music auto-plays on load, **muted by default**. User unmutes via volume control.
- Events sorted ascending by date/time (soonest first).
- "New Run" button opens an event creation modal.

### 2. Event Card (Upcoming)

Each card displays:

| Field | Notes |
|---|---|
| Creator name | Self-reported when creating |
| Date & time | |
| Meeting point | |
| Distance (km) | |
| Estimated pace (min/km) | e.g. "5:30" |
| Strava route link | Optional, opens in new tab |
| Notes | Optional |
| Participant list | Names, each with a Remove button |

Actions on the card:
- **Join** — opens a dialog where the user types their name (or multiple names) and confirms.
- **Remove** (next to each participant name) — removes that person immediately, no confirmation.
- **Complete Run** — moves the event to Past Runs and prompts for an optional photo upload.

### 3. Create Event Form (modal)

| Field | Type | Required |
|---|---|---|
| Your name (creator) | text | yes |
| Date & time | datetime-local | yes |
| Meeting point | text | yes |
| Distance (km) | number | yes |
| Estimated pace (min/km) | text | yes |
| Strava route link | url | no |
| Notes | textarea | no |

The data model includes a `metadata` JSONB column for future extensibility.

### 4. Past Runs Section

- Shown below the upcoming runs section.
- Sorted by most recent first.
- Each card shows all original event info + participants.
- If a photo was uploaded: displayed as the card image.
- If no photo: an "Upload Photo" button is shown (can be added at any time after completion).
- Photos stored in Supabase Storage.
- No deletion of past runs.

### 5. Music Player

- One local audio file bundled in the `public/` directory.
- Persistent in the page header.
- Controls: play/pause + volume.
- Starts muted on page load; user clicks volume to unmute.
- Note: this works around browsers' autoplay policy, which blocks unmuted autoplay without user interaction.

---

## Data Model

### `events` table

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | auto-generated |
| creator_name | text | required |
| run_at | timestamptz | required |
| meeting_point | text | required |
| distance_km | numeric | required |
| pace | text | e.g. "5:30" |
| strava_url | text | optional |
| notes | text | optional |
| status | text | `'upcoming'` or `'completed'` |
| photo_url | text | Supabase Storage public URL |
| metadata | jsonb | extensibility, default `{}` |
| created_at | timestamptz | auto |

### `participants` table

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | auto-generated |
| event_id | uuid FK | references events, cascade delete |
| name | text | required |
| joined_at | timestamptz | auto |

---

## Real-time Behavior

The dashboard subscribes to Supabase Realtime on mount. Any INSERT, UPDATE, or DELETE on `events` or `participants` is broadcast to all connected clients instantly — no page refresh needed. This means:

- A newly created event appears for everyone immediately.
- Joining or leaving an event updates the participant list for all viewers live.
- Completing an event moves it to Past Runs for everyone simultaneously.

---

## Non-Requirements

- No login or authentication
- No admin roles or permissions
- No push notifications
- No pagination (dorm scale)
- No mobile-specific design (responsive is nice-to-have, not required)
- No event deletion
