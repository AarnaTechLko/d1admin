
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ticket, admin } from "@/lib/schema";
import { ilike, desc, and, sql, or, eq, gte } from "drizzle-orm";

// Default admin user ID (you can replace this with env config or session auth)
type TimeRange = "24h" | "1w" | "1m" | "1y";

/**
 * Utility: Get time filter condition for createdAt
 */
function getTimeFilterCondition(column: typeof ticket.createdAt, range: TimeRange | null) {
  const now = new Date();
  switch (range) {
    case "24h":
      return gte(column, new Date(now.getTime() - 24 * 60 * 60 * 1000));
    case "1w":
      return gte(column, new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
    case "1m":
      return gte(column, new Date(now.setMonth(now.getMonth() - 1)));
    case "1y":
      return gte(column, new Date(now.setFullYear(now.getFullYear() - 1)));
    default:
      return undefined;
  }
}



export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      // recipient_name,
      // assign_to_name,
      // user_id,
      name,
      email,
      subject,
      message = "",
      status,
      recipientType,
      assign_to,
      ticket_from,
    } = body;

    if (!name || !email || !subject || !message || !recipientType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Store extra fields in message JSON
      const cleanMessage =
      typeof message === "string"
        ? message.trim()
        : message?.text?.trim() || "";

    const result = await db
      .insert(ticket)
      .values({
        name,
        email,
        subject,
        message: cleanMessage, // ✅ stored as JSON string
        status: status || "Pending",
        role: recipientType,       // ✅ still storing type in role column
        assign_to: Number(assign_to) || 0,
        ticket_from: Number(ticket_from) || 0,
        created_by: Number(ticket_from) || 0,   // stores ticket_from
        created_for: Number(assign_to) || 0,    // stores assign_to
        createdAt: new Date(),
      })
      .returning();
    console.log("result", result);
    return NextResponse.json(
      { message: "Ticket created successfully", ticket: result[0] },
      { status: 200 }
    );

  } catch (error) {
    console.error("❌ Error creating ticket:", error);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}
/**
 * ✅ GET /api/tickets → Fetch paginated tickets with filters
 */
type TicketMessagePayload = {
  text?: string;
  recipient_name?: string;
  assign_to_name?: string;
  role?: string;
  user_id?: number;
};
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);

    const search = url.searchParams.get("search")?.trim() || "";
    const timeRange = url.searchParams.get("timeRange") as TimeRange | null;
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const userId = parseInt(url.searchParams.get("userId") || "0", 10);
    const status = url.searchParams.get("status")?.trim() || "";
    const days = Number(url.searchParams.get("days")) || 0;
    const staff = Number(url.searchParams.get("staff")) || 0;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    const offset = (page - 1) * limit;

    // ✅ Get logged-in user's role
    const userRecord = await db
      .select({
        id: admin.id,
        role: admin.role,
      })
      .from(admin)
      .where(eq(admin.id, userId))
      .limit(1);

    if (!userRecord.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userRole = userRecord[0].role?.toLowerCase() || "";
    const isAdmin = userRole === "admin";

    // ✅ WHERE conditions
    const conditions = [];

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

    // ✅ Status filter
    if (status) {
      conditions.push(ilike(ticket.status, `%${status}%`));
    }

    // ✅ Staff filter (FINAL FIX)
    if (staff > 0) {
      conditions.push(eq(ticket.assign_to, staff));
    }

    // ✅ Days filter
    if (days > 0) {
      const today = new Date();
      today.setDate(today.getDate() - days);
      conditions.push(gte(ticket.createdAt, today));
    }

    const timeCondition = getTimeFilterCondition(ticket.createdAt, timeRange);
    if (timeCondition) conditions.push(timeCondition);

    // ✅ Non-admin can only see assigned tickets
    if (!isAdmin) {
      conditions.push(eq(ticket.assign_to, userId));
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const selectedFields = {
      id: ticket.id,
      name: ticket.name,
      email: ticket.email,
      subject: ticket.subject,
      escalate: ticket.escalate,
      message: ticket.message, // ✅ We will parse this after fetch
      assign_to: ticket.assign_to,
      created_by: ticket.created_by,
      created_for: ticket.created_for,
      status: ticket.status,
      createdAt: ticket.createdAt,
      priority: ticket.priority,
      assign_to_username: admin.username,
    };

    const [ticketList, totalResult] = await Promise.all([
      db
        .select(selectedFields)
        .from(ticket)
        .leftJoin(admin, eq(ticket.assign_to, admin.id))
        .where(whereClause)
        .orderBy(desc(ticket.id))
        .limit(limit)
        .offset(offset),

      db
        .select({ count: sql<number>`count(*)` })
        .from(ticket)
        .where(whereClause),
    ]);

    const total = totalResult[0]?.count ?? 0;

    // ✅ Parse message JSON here
    const formattedTickets = ticketList.map((t) => {
      let parsedMessage: TicketMessagePayload = {};
      let actualMessage = t.message;

      try {
        parsedMessage = JSON.parse(t.message);
        actualMessage = parsedMessage.text || t.message;
      } catch {
        // ❗ message was plain text (old tickets)
        parsedMessage = {};
      }

      return {
        ...t,
        message: actualMessage,
        recipient_name: parsedMessage.recipient_name || null,
        assign_to_name: parsedMessage.assign_to_name || t.assign_to_username || null,
        role: parsedMessage.role || null,
        created_by: parsedMessage.user_id || null,
      };
    });
const [
      pending,
      open,
      fixed,
      inprogress,
      closed,
      escalated,
    ] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(ticket)
        .where(eq(ticket.status, "Pending")),

      db
        .select({ count: sql<number>`count(*)` })
        .from(ticket)
        .where(eq(ticket.status, "Open")),
  db.select({ count: sql<number>`count(*)` }).from(ticket).where(eq(ticket.status, "Fixed")),

      db
        .select({ count: sql<number>`count(*)` })
        .from(ticket)
        .where(eq(ticket.status, "Inprogress")),

      db
        .select({ count: sql<number>`count(*)` })
        .from(ticket)
        .where(eq(ticket.status, "Closed")),

      db
        .select({ count: sql<number>`count(*)` })
        .from(ticket)
        .where(eq(ticket.escalate, true)),
    ]);
    return NextResponse.json({
       metrics: {
          pending: pending[0]?.count ?? 0,
          fixed: fixed[0]?.count ?? 0,
          open: open[0]?.count ?? 0,
          inprogress: inprogress[0]?.count ?? 0,
          closed: closed[0]?.count ?? 0,
          escalated: escalated[0]?.count ?? 0,
        },
      ticket: formattedTickets,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
      userRole,
    });

  } catch (error) {
    console.error("❌ Error fetching tickets:", error);
    return NextResponse.json({ error: "Failed to load tickets" }, { status: 500 });
  }
}
