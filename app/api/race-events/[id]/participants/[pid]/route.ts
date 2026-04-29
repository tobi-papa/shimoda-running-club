import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function DELETE(_req: Request, { params }: { params: Promise<{ pid: string }> }) {
  const { pid } = await params;
  const db = createServerClient();

  const { error } = await db.from("race_participants").delete().eq("id", pid);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
