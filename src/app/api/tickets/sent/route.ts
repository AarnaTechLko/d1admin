import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ticket, admin } from "@/lib/schema";
import { eq, SQL, or, ilike, and, gte } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const search = url.searchParams.get("search")?.trim() || "";
    const status = url.searchParams.get("status")?.trim() || "";
    const days = Number(url.searchParams.get("days")) || 0;

    if (!userId) {
      return NextResponse.json(
        { message: "Missing userId parameter" },
        { status: 400 }
      );
    }

    const conditions: (SQL | undefined)[] = [];

    // Search filters
    if (search) {
      conditions.push(
        or(
          ilike(ticket.name, `%${search}%`),
          ilike(ticket.email, `%${search}%`),
          ilike(ticket.subject, `%${search}%`),
          ilike(ticket.message, `%${search}%`)
        )
      );
    }

    // Filter by user
    conditions.push(eq(ticket.ticket_from, Number(userId)));

    // Filter by status (exact match is usually better)
    if (status) {
      conditions.push(eq(ticket.status, status));
    }

    // Filter by date if days > 0
    if (days > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // start of today
      const fromDate = new Date(today);
      fromDate.setDate(today.getDate() - days);
      conditions.push(gte(ticket.createdAt, fromDate));
    }

    const whereClause = and(...conditions);

    const ticketsSent = await db
      .select({
        id: ticket.id,
        name: ticket.name,
        email: ticket.email,
        subject: ticket.subject,
        escalate: ticket.escalate,
        priority: ticket.priority,
        message: ticket.message,
        assign_to: ticket.assign_to,
        status: ticket.status,
        createdAt: ticket.createdAt,
        assign_to_username: admin.username,
      })
      .from(ticket)
      .leftJoin(admin, eq(ticket.assign_to, admin.id))
      .where(whereClause);
// console.log("ticketsent",ticketsSent);
    return NextResponse.json({
      sent: ticketsSent,
    });
  } catch (error) {
    console.log("Error: ", String(error));
    return NextResponse.json(
      {
        message: "Failed to fetch user tickets",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
