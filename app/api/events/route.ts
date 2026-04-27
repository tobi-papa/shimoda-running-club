import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import type { Event } from "@/types";

export async function GET() {
  const db = createServerClient();

  const { data, error } = await db
    .from("events")
    .select("*, participants(id, name)")
    .order("run_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const events: Event[] = (data ?? []).map((e) => ({
    id: e.id,
    creator: e.creator,
    run_at: e.run_at,
    meeting_point: e.meeting_point,
    distance_km: Number(e.distance_km),
    pace: e.pace,
    strava_url: e.strava_url ?? undefined,
    notes: e.notes ?? undefined,
    status: e.status,
    photo_url: e.photo_url ?? null,
    photo_hue: e.photo_hue ?? undefined,
    participants: e.participants ?? [],
  }));

  return NextResponse.json(events);
}

export async function POST(request: Request) {
  const db = createServerClient();
  const body = await request.json();

  const { data, error } = await db
    .from("events")
    .insert({
      creator: body.creator,
      run_at: body.run_at,
      meeting_point: body.meeting_point,
      distance_km: body.distance_km,
      pace: body.pace,
      strava_url: body.strava_url || null,
      notes: body.notes || null,
      status: "upcoming",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const event: Event = { ...data, participants: [], distance_km: Number(data.distance_km) };
  return NextResponse.json(event, { status: 201 });
}
