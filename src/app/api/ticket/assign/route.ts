import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { ticket,admin } from '@/lib/schema';
import { and, eq, gte, ilike, or, sql, SQL } from 'drizzle-orm';

// export async function GET(req: NextRequest) {
//   try {
//     const url = new URL(req.url);
//     const user_id = url.searchParams.get("userId");
//     const search = url.searchParams.get("search")?.trim() || '';
//     const status = url.searchParams.get("status")?.trim() || "";
//     const days = Number(url.searchParams.get("days")) || 0;

//     const conditions: (SQL | undefined)[] = [];

//     // Only filter by user_id if provided
//     // if (user_id) {
//     //   conditions.push(eq(ticket.assign_to, Number(user_id)));
//     // } else {
//     //   // If no user_id, fetch unassigned tickets
//     //   conditions.push(eq(ticket.assign_to, 0));
//     // }

//     // Search filters
//     if (search) {
//       conditions.push(
//         or(
//           ilike(ticket.name, `%${search}%`),
//           ilike(ticket.email, `%${search}%`),
//           ilike(ticket.subject, `%${search}%`),
//           ilike(ticket.message, `%${search}%`)
//         )
//       );
//     }

//     if (status) {
//       conditions.push(ilike(ticket.status, `%${status}%`));
//     }

//     if (days > 0) {
//       const today = new Date();
//       today.setDate(today.getDate() - days);
//       conditions.push(gte(ticket.createdAt, today));
//     }

//     const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

//     const getTickets = await db
//       .select({
//         id: ticket.id,
//         name: ticket.name,
//         email: ticket.email,
//         subject: ticket.subject,
//         createdAt: ticket.createdAt,
//         status: ticket.status,
//         message: ticket.message,
//         priority: ticket.priority,
//       })
//       .from(ticket)
//       .where(whereClause);

//     return NextResponse.json({ tickets: getTickets }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json(
//       {
//         error: error instanceof Error ? error.message : "Unknown error retrieving tickets",
//       },
//       { status: 500 }
//     );
//   }
// }

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
 const role = url.searchParams.get("role")?.trim() || "";
    const user_id = Number(url.searchParams.get("userId")) || 0;
    const search = url.searchParams.get("search")?.trim() || "";
    const status = url.searchParams.get("status")?.trim() || "";
    const days = Number(url.searchParams.get("days")) || 0;
    const staff = Number(url.searchParams.get("staff")) || 0;

    // Debug logs
    console.log("role:", role);
    console.log("user_id:", user_id);
    const conditions: (SQL | undefined)[] = [];

    // ✅ Search filters
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
        // conditions.push(eq(ticket.assign_to, 0));

  if (role === "Admin") {
      // Admin sees all tickets where assign_to = 0
      conditions.push(eq(ticket.assign_to, 0));
    } else {
      // Normal user sees only their own tickets where assign_to = 0
      conditions.push(
        and(
          eq(ticket.assign_to, 0),
          eq(ticket.ticket_from, user_id)
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

    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    // ✅ Fetch Tickets
    const getTickets = await db
      .select({
        id: ticket.id,
        name: ticket.name,
        email: ticket.email,
        subject: ticket.subject,
        createdAt: ticket.createdAt,
        status: ticket.status,
        message: ticket.message,
        priority: ticket.priority,
      })
      .from(ticket)
      .where(whereClause);

    // ✅ FETCH STATUS METRICS
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

    return NextResponse.json(
      {
        tickets: getTickets,

        // ✅ ADD STATUS COUNTS HERE
        metrics: {
          pending: pending[0]?.count ?? 0,
          fixed: fixed[0]?.count ?? 0,
          open: open[0]?.count ?? 0,
          inprogress: inprogress[0]?.count ?? 0,
          closed: closed[0]?.count ?? 0,
          escalated: escalated[0]?.count ?? 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error retrieving tickets",
      },
      { status: 500 }
    );
  }
}


export async function POST(req: Request) {
  try {
    const { ticketId, assignTo } = await req.json();

    // Validate the input data
    if (!ticketId || !assignTo) {
      return NextResponse.json({ error: "Ticket ID and sub-admin ID are required" }, { status: 400 });
    }

    // Log the received data for debugging
    // console.log(`Assigning ticket ID: ${ticketId} to sub-admin ID: ${assignTo}`);

    // Perform the update operation in the ticket table
    const updatedTicket = await db
      .update(ticket)
      .set({ assign_to: assignTo })
      .where(eq(ticket.id, ticketId))
      .returning();

    // Check if any ticket was updated
    if (updatedTicket.length === 0) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Fetch the assigned sub-admin username using a join query
    const assignedTicket = await db
      .select({
        id: ticket.id,
        assign_to_username: admin.username, // Get the sub-admin username
      })
      .from(ticket)
      .leftJoin(admin, eq(ticket.assign_to, admin.id)) // Join with the admin table
      .where(eq(ticket.id, ticketId));

    // Check if we got the assigned sub-admin details
    if (assignedTicket.length === 0) {
      return NextResponse.json({ error: "Assigned sub-admin not found" }, { status: 404 });
    }

    // Return the updated ticket with assigned username
    return NextResponse.json({
      message: "Ticket successfully assigned",
      ticket: {
        id: assignedTicket[0].id,
        assign_to: assignedTicket[0].assign_to_username,

        // id: assignedTicket[0].id,
        // assign_to: assignTo, // still the ID

        // assignToUsername: assignedTicket[0].assignToUsername,
      }
    }, { status: 200 });

  } catch (error) {
    // Log the detailed error for debugging
    console.error("Error assigning sub-admin:", error);

    // Provide more specific error response
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error assigning sub-admin"
    }, { status: 500 });
  }
}

// Convert ID to username