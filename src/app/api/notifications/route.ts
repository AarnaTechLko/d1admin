// src/app/api/notifications/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ticket_messages, ticket } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const notifications = await db
      .select({
        messageId: ticket_messages.id,
        ticketId: ticket_messages.ticket_id,
        message: ticket_messages.message,
        createdAt: ticket_messages.createdAt,

        // ✅ Ticket info
        ticketName: ticket.name,
        ticketEmail: ticket.email,
        ticketSubject: ticket.subject,
        ticketRole: ticket.role,
      })
      .from(ticket_messages)
      .leftJoin(ticket, eq(ticket.id, ticket_messages.ticket_id))
      .where(eq(ticket_messages.read, 1))
      .orderBy(desc(ticket_messages.createdAt))
      .limit(10);

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Notification fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
