import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = createServerClient();

  const { data, error } = await db
    .from("events")
    .update({
      status: "completed",
      photo_hue: Math.floor(Math.random() * 360),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
