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

export type RaceType = "half_marathon" | "10k" | "5k" | "marathon" | "other";

export interface RaceEvent {
  id: string;
  name: string;
  race_type: RaceType;
  run_at: string;
  location: string;
  distance_km: number;
  registration_url?: string;
  notes?: string;
  is_featured: boolean;
  participants: { id: string; name: string }[];
}

export interface CreateRaceEventForm {
  name: string;
  race_type: RaceType;
  run_at: string;
  location: string;
  distance_km: number;
  registration_url?: string;
  notes?: string;
}
