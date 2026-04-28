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
