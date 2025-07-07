import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ticket, ticket_messages } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { put } from '@vercel/blob';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const ticketId = formData.get("ticketId");
    const repliedBy = formData.get("repliedBy");
    const message = formData.get("message");
    const status = formData.get("status");
    const file = formData.get("attachment") as File | null;

    if (!ticketId || !repliedBy || !message || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let filename = '';

    if (file && file.size > 0) {
      const blob = await put(file.name, file, { access: 'public' });
      filename = blob.url;
    }

    const insertedReply = await db.insert(ticket_messages).values({ 
      ticket_id: Number(ticketId),
      replied_by: repliedBy.toString(),
      message: message.toString(),
      status: status.toString(),
      createdAt: new Date(),
      filename,
    }).returning();

    await db.update(ticket)
      .set({
        status: status.toString(),
        message: message.toString(),
      })
      .where(eq(ticket.id, Number(ticketId)));

    return NextResponse.json({ success: true, reply: insertedReply }, { status: 200 });

  } catch (error) {
    console.error("Error uploading file or saving ticket reply:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    await db.delete(ticket_messages).where(eq(ticket_messages.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete reply error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
