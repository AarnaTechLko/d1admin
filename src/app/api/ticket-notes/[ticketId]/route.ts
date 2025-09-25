import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ticket_notes } from "@/lib/schema";
import { eq } from "drizzle-orm";

// GET /api/ticket-notes/:ticketId
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const notes = await db
      .select()
      .from(ticket_notes)
      .where(eq(ticket_notes.ticketId, Number((await params).ticketId)));

    return NextResponse.json(Array.isArray(notes) ? notes : [], { status: 200 });
  } catch (error) {
    console.error("Error fetching ticket notes:", error);
    return NextResponse.json([], { status: 500 }); // always return []
  }
}
