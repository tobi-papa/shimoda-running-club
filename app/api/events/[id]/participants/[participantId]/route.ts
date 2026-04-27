import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; participantId: string }> }
) {
  const { participantId } = await params;
  const db = createServerClient();

  const { error } = await db
    .from("participants")
    .delete()
    .eq("id", participantId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return new NextResponse(null, { status: 204 });
}
