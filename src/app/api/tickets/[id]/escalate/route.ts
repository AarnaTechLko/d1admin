import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ticket } from "@/lib/schema";
import { eq } from "drizzle-orm";
// PATCH /api/tickets/[id]/escalate
export async function PATCH(
  req: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ticketId = Number((await params).id);
    if (isNaN(ticketId)) {
      return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });
    }

    // mark ticket as escalated (if you have an `escalate` column)
    const updated = await db
      .update(ticket)
      .set({ escalate: true }) // ✅ assumes you added a boolean "escalate" column in schema
      .where(eq(ticket.id, ticketId))
      .returning();
console.log("updated",updated);
    if (updated.length === 0) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Ticket escalated successfully",
      ticket: updated[0],
    });
  } catch (error) {
    console.error("❌ Error escalating ticket:", error);
    return NextResponse.json(
      { error: "Failed to escalate ticket" },
      { status: 500 }
    );
  }
}

