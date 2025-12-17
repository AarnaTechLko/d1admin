// src/app/api/notifications/mark-one/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ticket_messages } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request) {
  const { messageId } = await req.json();

  await db
    .update(ticket_messages)
    .set({ read: 0 })
    .where(eq(ticket_messages.id, messageId));

  return NextResponse.json({ success: true });
}
