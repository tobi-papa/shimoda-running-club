import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = createServerClient();

  // clear all featured, then set this one
  const { error: clearError } = await db
    .from("race_events")
    .update({ is_featured: false })
    .neq("id", id);

  if (clearError) return NextResponse.json({ error: clearError.message }, { status: 500 });

  const { error } = await db
    .from("race_events")
    .update({ is_featured: true })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
