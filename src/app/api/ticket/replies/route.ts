import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ticket_messages } from "@/lib/schema";
import { eq } from "drizzle-orm";

// GET /api/browse/ticket/replies?ticketId=123
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get("ticketId");

    if (!ticketId) {
      return NextResponse.json({ error: "ticketId is required" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const rawReplies = await db
      .select()
      .from(ticket_messages)
      .where(eq(ticket_messages.ticket_id, Number(ticketId)))
      .orderBy(ticket_messages.createdAt);

    const replies = rawReplies.map((reply) => ({
      id: reply.id,
      ticket_id: reply.ticket_id,
      replied_by: reply.replied_by,
      message: reply.message,
      status: reply.status,
      createdAt: reply.createdAt,
      filename: reply.filename,
      fullAttachmentUrl: reply.filename ? `${baseUrl}${reply.filename}` : null,
    }));

    return NextResponse.json({ replies }, { status: 200 });

  } catch (error) {
    console.error("Failed to fetch replies:", error);
    return NextResponse.json({ error: "Failed to fetch replies" }, { status: 500 });
  }
}
