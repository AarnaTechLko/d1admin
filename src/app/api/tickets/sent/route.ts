// import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/lib/db";
// import { ticket, admin } from "@/lib/schema";
// import { eq, SQL, or, ilike, and, gte } from "drizzle-orm";

// export async function GET(req: NextRequest) {
//   try {
//     const url = new URL(req.url);
//     const userId = url.searchParams.get("userId");
//     const search = url.searchParams.get("search")?.trim() || "";
//     const status = url.searchParams.get("status")?.trim() || "";
//     const days = Number(url.searchParams.get("days")) || 0;
// console.log("userid",userId);
//     if (!userId) {
//       return NextResponse.json(
//         { message: "Missing userId parameter" },
//         { status: 400 }
//       );
//     }

//     const conditions: (SQL | undefined)[] = [];

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

//     // Filter by user
//     conditions.push(eq(ticket.ticket_from, Number(userId)));

//     // Filter by status (exact match is usually better)
//     if (status) {
//       conditions.push(eq(ticket.status, status));
//     }

//     // Filter by date if days > 0
//     if (days > 0) {
//       const today = new Date();
//       today.setHours(0, 0, 0, 0); // start of today
//       const fromDate = new Date(today);
//       fromDate.setDate(today.getDate() - days);
//       conditions.push(gte(ticket.createdAt, fromDate));
//     }

//     const whereClause = and(...conditions);

//     const ticketsSent = await db
//       .select({
//         id: ticket.id,
//         name: ticket.name,
//         email: ticket.email,
//         subject: ticket.subject,
//         escalate: ticket.escalate,
//         priority: ticket.priority,
//         message: ticket.message,
//         assign_to: ticket.assign_to,
//         status: ticket.status,
//         createdAt: ticket.createdAt,
//         assign_to_username: admin.username,
//       })
//       .from(ticket)
//       .leftJoin(admin, eq(ticket.assign_to, admin.id))
//       .where(whereClause);
// // console.log("ticketsent",ticketsSent);
//     return NextResponse.json({
//       sent: ticketsSent,
//     });
//   } catch (error) {
//     console.log("Error: ", String(error));
//     return NextResponse.json(
//       {
//         message: "Failed to fetch user tickets",
//         error: error instanceof Error ? error.message : String(error),
//       },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ticket, users, coaches, admin } from "@/lib/schema";
import { eq, SQL, or, ilike, and, gte, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    let role = url.searchParams.get("role")?.trim() || "";
    const search = url.searchParams.get("search")?.trim() || "";
    const status = url.searchParams.get("status")?.trim() || "";
    const days = Number(url.searchParams.get("days")) || 0;
 const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;
    if (!userId || !role) {
      return NextResponse.json(
        { message: "Missing userId or role parameter" },
        { status: 400 }
      );
    }

    role = role.toLowerCase();
    const conditions: SQL[] = [];

    /** -----------------------------
     * SEARCH CONDITION
     ------------------------------*/
    if (search) {
      const searchCondition = or(
        ilike(ticket.name, `%${search}%`),
        ilike(ticket.email, `%${search}%`),
        ilike(ticket.subject, `%${search}%`),
        ilike(ticket.message, `%${search}%`)
      ) as SQL;

      conditions.push(searchCondition);
    }

    /** -----------------------------
     * ROLE CONDITIONS
     ------------------------------*/
    let roleCondition: SQL | undefined;

    if (role === "player") {
      roleCondition = and(
        eq(ticket.role, "player"),
        eq(ticket.ticket_from, Number(userId))
      );
    }

    else if (role === "coach") {
      roleCondition = and(
        eq(ticket.role, "coach"),
        eq(ticket.ticket_from, Number(userId))
      );
    }

    else if (role === "customer support") {
      roleCondition = and(
        eq(ticket.role, "Customer Support"),
        eq(ticket.ticket_from, Number(userId))
      );
    }

    else if (role === "manager") {
      roleCondition = and(
        eq(ticket.role, "Manager"),
        eq(ticket.ticket_from, Number(userId))
      );
    }

    else if (role === "staff") {
      roleCondition = and(
        eq(ticket.role, "staff"),
        eq(ticket.ticket_from, Number(userId))
      );
    }

    else if (role === "tech") {
      roleCondition = and(
        eq(ticket.role, "Tech"),
        eq(ticket.ticket_from, Number(userId))
      );
    }

    else if (role === "executive level") {
      roleCondition = and(
        eq(ticket.role, "Executive Level"),
        eq(ticket.ticket_from, Number(userId))
      );
    }

    else if (role === "admin") {
      roleCondition = undefined; // admin sees all tickets
    }

    if (roleCondition) conditions.push(roleCondition);

    /** -----------------------------
     * STATUS FILTER
     ------------------------------*/
    if (status) {
      conditions.push(eq(ticket.status, status));
    }

    /** -----------------------------
     * DAYS FILTER
     ------------------------------*/
    if (days > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const fromDate = new Date(today);
      fromDate.setDate(today.getDate() - days);

      conditions.push(gte(ticket.createdAt, fromDate));
    }

    /** -----------------------------
     * FINAL WHERE CLAUSE
     ------------------------------*/
    const whereClause = conditions.length ? and(...conditions) : undefined;
    /** -----------------------------
     * TOTAL COUNT FOR PAGINATION
     ------------------------------*/
    const totalCountResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(ticket)
      .where(whereClause);
    const totalTickets = totalCountResult[0]?.count ?? 0;

    /** -----------------------------
     * FETCH TICKETS
     ------------------------------*/
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
        role: ticket.role,
        status: ticket.status,
        createdAt: ticket.createdAt,

        assign_to_username: admin.username,
        player_name: users.first_name,
        coach_name: coaches.firstName,
      })
      .from(ticket)
      .leftJoin(admin, eq(ticket.assign_to, admin.id))
      .leftJoin(users, eq(ticket.ticket_from, users.id))
      .leftJoin(coaches, eq(ticket.ticket_from, coaches.id))
      .where(whereClause)
            .limit(limit)
            .offset(offset);


 return NextResponse.json({
      tickets: ticketsSent,
      limit,
      currentPage: page,
      totalPages: Math.ceil(totalTickets / limit),
      totalTickets,
    });
  } catch (error) {
    console.log("Error:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch user tickets",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
