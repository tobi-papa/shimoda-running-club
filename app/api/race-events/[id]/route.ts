import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = createServerClient();
  const body = await request.json();

  const { error } = await db
    .from("race_events")
    .update({
      name: body.name,
      race_type: body.race_type,
      run_at: body.run_at,
      location: body.location,
      distance_km: body.distance_km,
      registration_url: body.registration_url || null,
      notes: body.notes || null,
    })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = createServerClient();

  const { error } = await db.from("race_events").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
