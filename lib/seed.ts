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
