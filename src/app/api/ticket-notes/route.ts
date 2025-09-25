import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // your drizzle db connection
import { ticket_notes } from "@/lib/schema"; // adjust import

// POST /api/ticket-notes
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ticketId, notes } = body;
    if (!ticketId || !notes) {
      return NextResponse.json(
        { error: "ticketId and notes are required" },
        { status: 400 }
      );
    }

    const inserted = await db
      .insert(ticket_notes)
      .values({ ticketId, notes })
      .returning();

    return NextResponse.json({ success: true, data: inserted[0] });
  } catch (error: unknown) {
  console.error("Error inserting ticket note:", error);
  return NextResponse.json(
    { error: "Failed to insert ticket note" },
    { status: 500 }
  );
}

}
