import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import type { RaceEvent } from "@/types";

export async function GET() {
  const db = createServerClient();

  const { data, error } = await db
    .from("race_events")
    .select("*, race_participants(id, name)")
    .order("run_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const events: RaceEvent[] = (data ?? []).map((e) => ({
    id: e.id,
    name: e.name,
    race_type: e.race_type,
    run_at: e.run_at,
    location: e.location,
    distance_km: Number(e.distance_km),
    registration_url: e.registration_url ?? undefined,
    notes: e.notes ?? undefined,
    is_featured: e.is_featured,
    participants: e.race_participants ?? [],
  }));

  return NextResponse.json(events);
}

export async function POST(request: Request) {
  const db = createServerClient();
  const body = await request.json();

  const { data, error } = await db
    .from("race_events")
    .insert({
      name: body.name,
      race_type: body.race_type,
      run_at: body.run_at,
      location: body.location,
      distance_km: body.distance_km,
      registration_url: body.registration_url || null,
      notes: body.notes || null,
      is_featured: false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const event: RaceEvent = { ...data, participants: [], distance_km: Number(data.distance_km) };
  return NextResponse.json(event, { status: 201 });
}
