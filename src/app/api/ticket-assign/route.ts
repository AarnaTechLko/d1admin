// app/api/assign-ticket/route.ts

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { admin, ticket_assign, ticket } from "@/lib/schema";

// POST /api/assign-ticket
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ticketId, toId, escalate, fromId } = body;
    console.log("dataetdd:", body);
    // ⚠️ Example: Extract fromId (current user ID) from headers or cookies (replace as needed)
    // In real apps, use JWT/session to extract user info securely
    // const fromId = Number(req.headers.get("x-user-id"));

    if (!ticketId || !toId || !fromId) {
      return NextResponse.json(
        { error: "ticketId, toId, and fromId are required." },
        { status: 400 }
      );
    }

    // ✅ Check if ticket exists
    const [ticketExists] = await db
      .select()
      .from(ticket)
      .where(eq(ticket.id, ticketId));

    if (!ticketExists) {
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }

    // ✅ Check if fromId and toId exist in admin table
    const [fromAdmin] = await db
      .select()
      .from(admin)
      .where(eq(admin.id, fromId));

    const [toAdmin] = await db
      .select()
      .from(admin)
      .where(eq(admin.id, toId));

    if (!fromAdmin || !toAdmin) {
      return NextResponse.json({ error: "Assigner or assignee not found." }, { status: 404 });
    }


    // ✅ Insert ticket assignment
    await db.insert(ticket_assign).values({
      ticketId: Number(ticketId),
      fromId: Number(fromId),
      toId: Number(toId),
      escalate: escalate ?? false,
    });

    await db
      .update(ticket)
      .set({
        assign_to: Number(toId),
        escalate: escalate ?? false,
      })
      .where(eq(ticket.id, Number(ticketId)));

    return NextResponse.json({ message: "Ticket assigned successfully." }, { status: 201 });
  } catch (error) {
    console.error("Assign Ticket Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
