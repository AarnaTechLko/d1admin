import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Your Drizzle DB setup
import { ticket_messages } from "@/lib/schema"; // Assuming you have a schema file
import { eq } from "drizzle-orm";

// GET /api/browse/ticket/replies?ticketId=123
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get("ticketId");

    if (!ticketId) {
      return NextResponse.json({ error: "ticketId is required" }, { status: 400 });
    }

    const replies = await db
      .select()
      .from(ticket_messages)
      .where(eq(ticket_messages.ticket_id, Number(ticketId)))
      .orderBy(ticket_messages.createdAt
        
      ); // Optional ordering

    return NextResponse.json({ replies }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch replies:", error);
    return NextResponse.json({ error: "Failed to fetch replies" }, { status: 500 });
  }
}
