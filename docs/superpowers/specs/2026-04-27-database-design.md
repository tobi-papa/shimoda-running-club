# Database Implementation — Shimoda Running Club

**Date:** 2026-04-27  
**Status:** Approved

## Overview

Implementare persistenza dati reale usando Supabase (PostgreSQL + Realtime + Storage), sostituendo i dati mock in-memory attualmente usati dal frontend.

## Requisiti

- Dati persistenti tra sessioni
- Aggiornamenti in tempo reale visibili a tutti gli utenti connessi
- Upload e salvataggio reale delle foto dei past runs
- Nessuna autenticazione — accesso libero per nome

## Architettura

**Supabase** come unico backend:
- PostgreSQL per i dati
- Realtime per subscriptions live
- Storage per le foto

**Next.js API routes** come layer intermedio server-side (usano service key Supabase).

**Frontend** usa anon key Supabase solo per subscriptions realtime.

## Schema Database

### Tabella `events`

```sql
create table events (
  id           uuid        primary key default gen_random_uuid(),
  creator      text        not null,
  run_at       timestamptz not null,
  meeting_point text       not null,
  distance_km  numeric(5,2) not null,
  pace         text        not null,
  strava_url   text,
  notes        text,
  status       text        not null default 'upcoming'
                           check (status in ('upcoming', 'completed')),
  photo_url    text,
  photo_hue    int,
  created_at   timestamptz default now()
);
```

### Tabella `participants`

```sql
create table participants (
  id         uuid        primary key default gen_random_uuid(),
  event_id   uuid        not null references events(id) on delete cascade,
  name       text        not null,
  joined_at  timestamptz default now()
);
```

### Storage

Bucket Supabase Storage: `run-photos` (public read, authenticated write via service key).

## API Routes

Tutte le route esistono già come stub — vengono collegate a Supabase:

| Route | Metodo | Azione |
|---|---|---|
| `/api/events` | GET | Lista eventi con partecipanti aggregati |
| `/api/events` | POST | Crea evento |
| `/api/events/[id]` | GET | Singolo evento con partecipanti |
| `/api/events/[id]/complete` | POST | Marca evento come completato, assegna photo_hue random |
| `/api/events/[id]/participants` | POST | Aggiungi partecipante (body: `{ name: string }`) |
| `/api/events/[id]/participants/[pid]` | DELETE | Rimuovi partecipante per id |
| `/api/events/[id]/photo` | POST | Upload foto (multipart), salva su Storage, aggiorna photo_url |

## Flusso Dati

### Lettura iniziale
1. Dashboard monta → `fetch('/api/events')`
2. API route usa service key Supabase → query `events` + `participants`
3. Risposta: array di eventi, ciascuno con campo `participants: string[]`

### Mutazioni
- Crea evento → `POST /api/events` → insert in `events`
- Join corsa → `POST /api/events/[id]/participants` → insert in `participants`
- Rimuovi partecipante → `DELETE /api/events/[id]/participants/[pid]`
- Completa corsa → `POST /api/events/[id]/complete` → update `status` + `photo_hue`
- Upload foto → `POST /api/events/[id]/photo` → upload su Storage + update `photo_url`

### Realtime
- Client-side subscription su tabelle `events` e `participants`
- Ogni cambiamento (INSERT/UPDATE/DELETE) triggera un re-fetch `/api/events`
- Aggiorna stato React → UI si aggiorna per tutti gli utenti connessi

## File Modificati / Creati

```
lib/supabase.ts           ← createBrowserClient (anon key)
lib/supabase-server.ts    ← createServerClient (service key)
lib/realtime.ts           ← hook useRealtimeEvents(onRefresh)

app/api/events/route.ts
app/api/events/[id]/route.ts
app/api/events/[id]/complete/route.ts
app/api/events/[id]/participants/route.ts
app/api/events/[id]/participants/[pid]/route.ts
app/api/events/[id]/photo/route.ts

components/layout/Dashboard.tsx  ← rimuove seed, fetch + realtime

.env.local  ← NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY
```

## File Rimossi / Puliti

- `lib/prisma.ts` — eliminato
- `lib/seed.ts` — eliminato (fmtDate/timeUntil si spostano in lib/utils.ts)
- `prisma/` directory — eliminata
- Dipendenze Prisma rimosse da `package.json`

## Variabili d'Ambiente

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_KEY=<service-role-key>
```

## Considerazioni

- Le API routes usano il service key → bypass Row Level Security → nessun problema di permessi
- Il realtime usa l'anon key sul client → solo subscribe, non scrive
- Upload foto: limit ragionevole 5MB lato API route
- `participants` sono ancora `string[]` nell'interfaccia Event per compatibilità col frontend esistente — le API aggregano da tabella `participants` → array di nomi
