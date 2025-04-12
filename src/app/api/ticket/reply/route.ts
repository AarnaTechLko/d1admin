
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ticket_messages ,ticket} from "@/lib/schema"; // Use correct table
import { eq } from "drizzle-orm";

// POST: Reply to a ticket
export async function POST(req: Request) {
  try {
    
    const body = await req.json();
    const { ticketId, repliedBy, message, status } = body;

    // Validate required fields
    if (!ticketId || !repliedBy || !message || !status) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Insert reply into the database
    const insertedReply = await db.insert(ticket_messages).values({
      ticket_id: Number(ticketId),
      replied_by: repliedBy,
      message,
      status,
      createdAt: new Date(), // Ensure createdAt is provided
    }).returning();

    // await db
    // .update(ticket)
    // .set({status, status })
    // .where(eq(ticket.id, ticket_id));
  // Update ticket status to match the latest ticket message status
  await db
  .update(ticket)
  .set({ status,
    message,
   })
  .where(eq(ticket.id, Number(ticketId)));


    return NextResponse.json({ success: true, reply: insertedReply }, { status: 200 });
  } catch (error) {
    console.error("Error saving ticket reply:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET: Fetch ticket messages
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get("ticketId");

    if (!ticketId) {
      return NextResponse.json({ error: "ticketId is required." }, { status: 400 });
    }

    // Fetch ticket messages
    const messages = await db
      .select()
      .from(ticket_messages)
      .where(eq(ticket_messages.ticket_id, Number(ticketId)))
      .orderBy(ticket_messages.createdAt);

    return NextResponse.json({ success: true, messages }, { status: 200 });
  } catch (error) {
    console.error("Error fetching ticket messages:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

