// import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/lib/db";
// import { ticket, admin } from "@/lib/schema";
// import { ilike, desc, and, sql, or, gte, eq } from "drizzle-orm";

// type TimeRange = "24h" | "1w" | "1m" | "1y";

// /**
//  * Utility: Get date filter based on time range
//  */
// function getTimeFilterCondition(column: typeof ticket.createdAt, range: TimeRange | null) {
//   const now = new Date();
//   switch (range) {
//     case "24h":
//       return gte(column, new Date(now.getTime() - 24 * 60 * 60 * 1000));
//     case "1w":
//       return gte(column, new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
//     case "1m":
//       return gte(column, new Date(now.setMonth(now.getMonth() - 1)));
//     case "1y":
//       return gte(column, new Date(now.setFullYear(now.getFullYear() - 1)));
//     default:
//       return undefined;
//   }
// }

// /**
//  * ✅ GET: Fetch tickets (all users), with pagination, search, time filter, and include assigned admin username
//  */
// export async function GET(req: NextRequest) {
//   try {
//     const url = new URL(req.url);

//     const search = url.searchParams.get("search")?.trim() || "";
//     const status = url.searchParams.get("status")?.trim() || "";
//     const timeRange = url.searchParams.get("timeRange") as TimeRange | null;

//     const page = parseInt(url.searchParams.get("page") ?? "1", 10);
//     const limit = parseInt(url.searchParams.get("limit") ?? "10", 10);
//     const offset = (page - 1) * limit;

//     const conditions = [];

//     // 🔍 Search filter
//     if (search) {
//       conditions.push(
//         or(
//           ilike(ticket.subject, `%${search}%`),
//           ilike(ticket.name, `%${search}%`),
//           ilike(ticket.email, `%${search}%`),
//           ilike(ticket.message, `%${search}%`)
//         )
//       );
//     }

//     // 🔁 Status filter
//     if (status) {
//       conditions.push(ilike(ticket.status, `%${status}%`));
//     }

//     // 🕒 Time range filter
//     const timeCond = getTimeFilterCondition(ticket.createdAt, timeRange);
//     if (timeCond) conditions.push(timeCond);

//     const whereClause = conditions.length ? and(...conditions) : undefined;

//     // ⭐ FIX: Include escalate + correct assign_to username join
//     const selectedFields = {
//       id: ticket.id,
//       name: ticket.name,
//       email: ticket.email,
//       subject: ticket.subject,
//       message: ticket.message,
//       escalate: ticket.escalate,              // 👈 IMPORTANT FIX
//       assign_to: ticket.assign_to,
//       status: ticket.status,
//       createdAt: ticket.createdAt,
//       priority: ticket.priority,
//       assign_to_username: admin.username,     // 👈 JOIN ADMIN
//     };

//     const [ticketList, totalRec] = await Promise.all([
//       db
//         .select(selectedFields)
//         .from(ticket)
//         .leftJoin(admin, eq(ticket.assign_to, admin.id))
//         .where(whereClause)
//         .orderBy(desc(ticket.id))
//         .limit(limit)
//         .offset(offset),

//       db
//         .select({ count: sql<number>`count(*)` })
//         .from(ticket)
//         .where(whereClause),
//     ]);

//     const total = totalRec[0]?.count ?? 0;

//     return NextResponse.json({
//       ticket: ticketList,
//       currentPage: page,
//       totalPages: Math.ceil(total / limit),
//       totalCount: total,
//       hasNextPage: page * limit < total,
//       hasPrevPage: page > 1,
//     });
//   } catch (err) {
//     console.error("❌ Error fetching tickets:", err);
//     return NextResponse.json(
//       { error: "Failed to load tickets" },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ticket, admin, coaches, users } from "@/lib/schema";
import { ilike, desc, and, sql, or, gte, eq } from "drizzle-orm";

type TimeRange = "24h" | "1w" | "1m" | "1y";

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

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);

    const search = url.searchParams.get("search")?.trim() || "";
    const status = url.searchParams.get("status")?.trim() || "";
    const timeRange = url.searchParams.get("timeRange") as TimeRange | null;

    const page = parseInt(url.searchParams.get("page") ?? "1", 10);
    const limit = parseInt(url.searchParams.get("limit") ?? "10", 10);
    const offset = (page - 1) * limit;

    const conditions = [];

    // 🔍 Search filter
    if (search) {
      conditions.push(
        or(
          ilike(ticket.subject, `%${search}%`),
          ilike(ticket.name, `%${search}%`),
          ilike(ticket.email, `%${search}%`),
          ilike(ticket.message, `%${search}%`)
        )
      );
    }

    // 🔁 Status filter
    if (status) conditions.push(ilike(ticket.status, `%${status}%`));

    // 🕒 Time filter
    const timeCond = getTimeFilterCondition(ticket.createdAt, timeRange);
    if (timeCond) conditions.push(timeCond);

    const whereClause = conditions.length ? and(...conditions) : undefined;

    /**
     * ⭐ Add coach + user image join fields
     */
    const selectedFields = {
      id: ticket.id,
      name: ticket.name,
      email: ticket.email,
      subject: ticket.subject,
      message: ticket.message,
      escalate: ticket.escalate,
      assign_to: ticket.assign_to,
      status: ticket.status,
      createdAt: ticket.createdAt,
      priority: ticket.priority,
      assign_to_username: admin.username,

      // 🔥 Images from coach/user
      coachImage: coaches.image,
      userImage: users.image,
    };

    /**
     * ⭐ LEFT JOIN admin + coaches + users
     */
    const [ticketList, totalRec] = await Promise.all([
      db
        .select(selectedFields)
        .from(ticket)
        .leftJoin(admin, eq(ticket.assign_to, admin.id))
        .leftJoin(coaches, eq(ticket.ticket_from, coaches.id)) // 👈 Join coach image
        .leftJoin(users, eq(ticket.ticket_from, users.id))       // 👈 Join user image
        .where(whereClause)
        .orderBy(desc(ticket.id))
        .limit(limit)
        .offset(offset),

      db
        .select({ count: sql<number>`count(*)` })
        .from(ticket)
        .where(whereClause),
    ]);

    const total = totalRec[0]?.count ?? 0;

    return NextResponse.json({
      ticket: ticketList,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    });
  } catch (err) {
    console.error("❌ Error fetching tickets:", err);
    return NextResponse.json(
      { error: "Failed to load tickets" },
      { status: 500 }
    );
  }
}
