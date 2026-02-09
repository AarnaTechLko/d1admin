import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { ticket, admin, coaches, users } from '@/lib/schema';
import { and, eq, gte, ilike, or, sql, SQL,desc } from 'drizzle-orm';


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

  } catch (error:unknown) {
    // Log the detailed error for debugging
    console.error("Error assigning sub-admin:", error);

    // Provide more specific error response
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error assigning sub-admin"
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);

    const role = url.searchParams.get("role")?.trim() || "";
    const user_id = Number(url.searchParams.get("userId")) || 0;
    const search = url.searchParams.get("search")?.trim() || "";
    const status = url.searchParams.get("status")?.trim() || "";
    const days = Number(url.searchParams.get("days")) || 0;
    const staff = Number(url.searchParams.get("staff")) || 0;

    // ✅ PAGINATION PARAMS (MERGED)
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(50, Number(url.searchParams.get("limit")) || 10);
    const offset = (page - 1) * limit;

    const conditions: (SQL | undefined)[] = [];

    // 🔍 SEARCH
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

    // 👤 ROLE BASE
    let baseCondition: SQL | undefined;

    if (role === "Admin") {
      baseCondition = eq(ticket.assign_to, 0);
    } else if (
      role === "Customer Support" ||
      role === "Executive Level" ||
      role === "Manager" ||
      role === "Tech"
    ) {
      baseCondition = eq(ticket.ticket_from, user_id);
    } else {
      baseCondition = eq(ticket.ticket_from, user_id);
    }

    conditions.push(baseCondition);

    // 📌 STATUS
    if (status) {
      conditions.push(eq(ticket.status, status));
    }

    // 👨‍💼 STAFF
    if (staff > 0) {
      conditions.push(eq(ticket.assign_to, staff));
    }

    // 📅 DAYS FILTER
    if (days > 0) {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);
      conditions.push(gte(ticket.createdAt, fromDate));
    }

    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    // ✅ TOTAL COUNT (FOR PAGINATION)
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(ticket)
      .where(whereClause);

    const total = totalResult[0]?.count ?? 0;

    // ✅ PAGINATED TICKETS (FIXED)
    const tickets = await db
      .select({
        id: ticket.id,
        name: ticket.name,
        email: ticket.email,
        subject: ticket.subject,
        createdAt: ticket.createdAt,
        status: ticket.status,
        message: ticket.message,
        priority: ticket.priority,
        assign_to: ticket.assign_to,
        coachImage: coaches.image,
        userImage: users.image,
      })
      .from(ticket)
      .leftJoin(coaches, eq(ticket.ticket_from, coaches.id))
      .leftJoin(users, eq(ticket.ticket_from, users.id))
      .where(whereClause)
      .orderBy(desc(ticket.createdAt)) // latest first
      .limit(limit)                    // ✅ REQUIRED
      .offset(offset);                 // ✅ REQUIRED

    // 📊 METRICS (UNCHANGED)
    const metricCondition = baseCondition;

    const [
      pending,
      open,
      fixed,
      inprogress,
      closed,
      escalated,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` })
        .from(ticket)
        .where(and(metricCondition, eq(ticket.status, "Pending"))),

      db.select({ count: sql<number>`count(*)` })
        .from(ticket)
        .where(and(metricCondition, eq(ticket.status, "Open"))),

      db.select({ count: sql<number>`count(*)` })
        .from(ticket)
        .where(and(metricCondition, eq(ticket.status, "Fixed"))),

      db.select({ count: sql<number>`count(*)` })
        .from(ticket)
        .where(and(metricCondition, eq(ticket.status, "Inprogress"))),

      db.select({ count: sql<number>`count(*)` })
        .from(ticket)
        .where(and(metricCondition, eq(ticket.status, "Closed"))),

      db.select({ count: sql<number>`count(*)` })
        .from(ticket)
        .where(and(metricCondition, eq(ticket.escalate, true))),
    ]);

    return NextResponse.json(
      {
        tickets,
        total,
        metrics: {
          pending: pending[0]?.count ?? 0,
          open: open[0]?.count ?? 0,
          fixed: fixed[0]?.count ?? 0,
          inprogress: inprogress[0]?.count ?? 0,
          closed: closed[0]?.count ?? 0,
          escalated: escalated[0]?.count ?? 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}



// export async function GET(req: NextRequest) {
//   try {
//     const url = new URL(req.url);

//     const role = url.searchParams.get("role")?.trim() || "";
//     const user_id = Number(url.searchParams.get("userId")) || 0;
//     const search = url.searchParams.get("search")?.trim() || "";
//     const status = url.searchParams.get("status")?.trim() || "";
//     const days = Number(url.searchParams.get("days")) || 0;
//     const staff = Number(url.searchParams.get("staff")) || 0;

//     const conditions: (SQL | undefined)[] = [];

//     // SEARCH
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

//     // ROLE BASE
//     let baseCondition: SQL | undefined;

//     if (role === "Admin") {
//       baseCondition = eq(ticket.assign_to, 0);
//     } else if (
//       role === "Customer Support" ||
//       role === "Executive Level" ||
//       role === "Manager" ||
//       role === "Tech"
//     ) {
//       baseCondition = eq(ticket.ticket_from, user_id);
//     } else {
//       baseCondition = eq(ticket.ticket_from, user_id);
//     }

//     conditions.push(baseCondition);

//     // STATUS
//     if (status) {
//       conditions.push(eq(ticket.status, status));
//     }

//     // STAFF
//     if (staff > 0) {
//       conditions.push(eq(ticket.assign_to, staff));
//     }

//     // DAYS
//     if (days > 0) {
//       const fromDate = new Date();
//       fromDate.setDate(fromDate.getDate() - days);
//       conditions.push(gte(ticket.createdAt, fromDate));
//     }

//     const whereClause =
//       conditions.length > 0 ? and(...conditions) : undefined;

//     // TOTAL COUNT
//     const totalResult = await db
//       .select({ count: sql<number>`count(*)` })
//       .from(ticket)
//       .where(whereClause);

//     const total = totalResult[0]?.count ?? 0;

//     // 🔥 LATEST TICKETS FIRST
//     const tickets = await db
//       .select({
//         id: ticket.id,
//         name: ticket.name,
//         email: ticket.email,
//         subject: ticket.subject,
//         createdAt: ticket.createdAt,
//         status: ticket.status,
//         message: ticket.message,
//         priority: ticket.priority,
//         assign_to: ticket.assign_to,
//         coachImage: coaches.image,
//         userImage: users.image,
//       })
//       .from(ticket)
//       .leftJoin(coaches, eq(ticket.ticket_from, coaches.id))
//       .leftJoin(users, eq(ticket.ticket_from, users.id))
//       .where(whereClause)
//       .orderBy(desc(ticket.createdAt)); // ✅ latest on top

//     // METRICS
//     const metricCondition = baseCondition;

//     const [
//       pending,
//       open,
//       fixed,
//       inprogress,
//       closed,
//       escalated,
//     ] = await Promise.all([
//       db.select({ count: sql<number>`count(*)` })
//         .from(ticket)
//         .where(and(metricCondition, eq(ticket.status, "Pending"))),

//       db.select({ count: sql<number>`count(*)` })
//         .from(ticket)
//         .where(and(metricCondition, eq(ticket.status, "Open"))),

//       db.select({ count: sql<number>`count(*)` })
//         .from(ticket)
//         .where(and(metricCondition, eq(ticket.status, "Fixed"))),

//       db.select({ count: sql<number>`count(*)` })
//         .from(ticket)
//         .where(and(metricCondition, eq(ticket.status, "Inprogress"))),

//       db.select({ count: sql<number>`count(*)` })
//         .from(ticket)
//         .where(and(metricCondition, eq(ticket.status, "Closed"))),

//       db.select({ count: sql<number>`count(*)` })
//         .from(ticket)
//         .where(and(metricCondition, eq(ticket.escalate, true))),
//     ]);

//     return NextResponse.json(
//       {
//         tickets,
//         total,
//         metrics: {
//           pending: pending[0]?.count ?? 0,
//           open: open[0]?.count ?? 0,
//           fixed: fixed[0]?.count ?? 0,
//           inprogress: inprogress[0]?.count ?? 0,
//           closed: closed[0]?.count ?? 0,
//           escalated: escalated[0]?.count ?? 0,
//         },
//       },
//       { status: 200 }
//     );
//   } catch {
//     return NextResponse.json(
//       { error: "Failed to fetch tickets" },
//       { status: 500 }
//     );
//   }
// }


// export async function GET(req: NextRequest) {
//   try {
//     const url = new URL(req.url);
//     const role = url.searchParams.get("role")?.trim() || "";
//     const user_id = Number(url.searchParams.get("userId")) || 0;
//     const search = url.searchParams.get("search")?.trim() || "";
//     const status = url.searchParams.get("status")?.trim() || "";
//     const days = Number(url.searchParams.get("days")) || 0;
//     const staff = Number(url.searchParams.get("staff")) || 0;

//     const conditions: (SQL | undefined)[] = [];

//     // ---------------------------
//     // SEARCH FILTER
//     // ---------------------------
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

//     // ---------------------------
//     // ROLE-BASED LOGIC
//     // ---------------------------
//     let baseCondition: SQL | undefined;


//     if (role === "Admin") {
//       // Admin → All tickets where assign_to = 0
//       baseCondition = eq(ticket.assign_to, 0);
//     } else if (
//       role === "Customer Support" ||
//       role === "Executive Level" ||
//       role === "Manager" ||
//       role === "Tech"
//     ) {
//       // Staff roles → assigned to them OR created by them
//       baseCondition = or(
//         // eq(ticket.assign_to, user_id),
//         eq(ticket.ticket_from, user_id)
//       );
//     } else {
//       // Normal user → only created tickets
//       baseCondition = eq(ticket.ticket_from, user_id);
//     }

//     // push the base condition
//     conditions.push(baseCondition);

//     // ---------------------------
//     // STATUS FILTER
//     // ---------------------------
//     if (status) {
//       conditions.push(ilike(ticket.status, `%${status}%`));
//     }

//     // ---------------------------
//     // STAFF FILTER
//     // ---------------------------
//     if (staff > 0) {
//       conditions.push(eq(ticket.assign_to, staff));
//     }

//     // ---------------------------
//     // DAYS FILTER
//     // ---------------------------
//     if (days > 0) {
//       const today = new Date();
//       today.setDate(today.getDate() - days);
//       conditions.push(gte(ticket.createdAt, today));
//     }

//     // Final WHERE CLAUSE
//     const whereClause =
//       conditions.length > 0 ? and(...conditions) : undefined;

//     const totalResult = await db
//       .select({ count: sql<number>`count(*)` })
//       .from(ticket)
//       .where(whereClause);

//     const total = totalResult[0]?.count ?? 0;

//     // ---------------------------
//     // FETCH ALL TICKETS
//     // ---------------------------
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
//         assign_to: ticket.assign_to,
//         coachImage: coaches.image,
//         userImage: users.image,
//       })
//       .from(ticket)
//       .leftJoin(coaches, eq(ticket.ticket_from, coaches.id)) // 👈 Join coach image
//       .leftJoin(users, eq(ticket.ticket_from, users.id))
//       .where(whereClause)
//       .orderBy(desc(ticket.createdAt));;
//     // console.log("all data:", getTickets);
//     // ------------------------------------------------------------
//     // STATUS METRICS (based on role like data above)
//     // ------------------------------------------------------------

//     const metricCondition = baseCondition; // use same logic for metrics


//     const [
//       pending,
//       open,
//       fixed,
//       inprogress,
//       closed,
//       escalated,
//     ] = await Promise.all([
//       db.select({ count: sql<number>`count(*)` })
//         .from(ticket)
//         .where(and(metricCondition, eq(ticket.status, "Pending"))),

//       db.select({ count: sql<number>`count(*)` })
//         .from(ticket)
//         .where(and(metricCondition, eq(ticket.status, "Open"))),

//       db.select({ count: sql<number>`count(*)` })
//         .from(ticket)
//         .where(and(metricCondition, eq(ticket.status, "Fixed"))),

//       db.select({ count: sql<number>`count(*)` })
//         .from(ticket)
//         .where(and(metricCondition, eq(ticket.status, "Inprogress"))),

//       db.select({ count: sql<number>`count(*)` })
//         .from(ticket)
//         .where(and(metricCondition, eq(ticket.status, "Closed"))),

//       db.select({ count: sql<number>`count(*)` })
//         .from(ticket)
//         .where(and(metricCondition, eq(ticket.escalate, true))),
//     ]);

//     return NextResponse.json(
//       {
//         tickets: getTickets,
//          total,
//         metrics: {
//           pending: pending[0]?.count ?? 0,
//           open: open[0]?.count ?? 0,
//           fixed: fixed[0]?.count ?? 0,
//           inprogress: inprogress[0]?.count ?? 0,
//           closed: closed[0]?.count ?? 0,
//           escalated: escalated[0]?.count ?? 0,
//         },
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     return NextResponse.json(
//       {
//         error:
//           error instanceof Error
//             ? error.message
//             : "Unknown error retrieving tickets",
//       },
//       { status: 500 }
//     );
//   }
// }