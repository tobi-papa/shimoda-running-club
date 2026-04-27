export interface Participant {
  id: string;
  event_id: string;
  name: string;
  joined_at?: string;
}

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
  participants: { id: string; name: string }[];
  metadata?: Record<string, unknown>;
}

export interface CreateEventForm {
  creator: string;
  run_at: string;
  meeting_point: string;
  distance_km: number;
  pace: string;
  strava_url?: string;
  notes?: string;
}
