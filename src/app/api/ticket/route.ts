// import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/lib/db";
// import { ticket } from "@/lib/schema";
// import { ilike, desc, and, sql, or, eq, gte } from "drizzle-orm";

// // Change this to your actual admin ID logic if needed
// const ADMIN_ID = 9;

// type TimeRange = "24h" | "1w" | "1m" | "1y";

// /**
//  * Utility: Get time filter condition based on time range
//  */
// function getTimeFilterCondition(column: typeof ticket.createdAt, timeRange: TimeRange | null) {
//   const now = new Date();
//   switch (timeRange) {
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
//  * ✅ POST: Create a new ticket
//  */
// export async function POST(req: Request) {
//   try {
//     const { name, email, subject, message, assign_to, status } = await req.json();

//     const result = await db.insert(ticket).values({
//       name,
//       email,
//       subject,
//       message: message ?? "",
//       assign_to,
//       status,
//       createdAt: new Date(), // Ensure timestamp is inserted
//     }).returning();

//     return NextResponse.json({ message: "Ticket created successfully", result }, { status: 200 });
//   } catch (error) {
//     console.error("❌ Error creating ticket:", error);
//     return NextResponse.json({ error: "Error creating ticket" }, { status: 500 });
//   }
// }

// /**
//  * ✅ GET: Fetch tickets with pagination, search, time filter, and user-role filtering
//  */
// export async function GET(req: NextRequest) {
//   try {
//     const url = new URL(req.url);
//     const search = url.searchParams.get("search")?.trim() || "";
//     const timeRange = url.searchParams.get("timeRange") as TimeRange | null;
//     const page = parseInt(url.searchParams.get("page") || "1", 10);
//     const limit = parseInt(url.searchParams.get("limit") || "10", 10);
//     const userId = parseInt(url.searchParams.get("userId") || "0", 10);

//     if (!userId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const offset = (page - 1) * limit;
//     const isAdmin = userId === ADMIN_ID;

//     const conditions = [];

//     // 🔍 Search Filter
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

//     // 🕒 Time Range Filter
//     const timeCondition = getTimeFilterCondition(ticket.createdAt, timeRange);
//     if (timeCondition) {
//       conditions.push(timeCondition);
//     }

//     // 👤 User Role Filter
//     if (!isAdmin) {
//       conditions.push(eq(ticket.assign_to, userId));
//     }

//     const whereClause = conditions.length ? and(...conditions) : undefined;

//     // 📦 Fetch data and count
//     const [ticketList, totalResult] = await Promise.all([
//       db
//         .select()
//         .from(ticket)
//         .where(whereClause)
//         .orderBy(desc(ticket.id))
//         .limit(limit)
//         .offset(offset),

//       db
//         .select({ count: sql<number>`count(*)` })
//         .from(ticket)
//         .where(whereClause),
//     ]);

//     const total = totalResult[0]?.count ?? 0;

//     return NextResponse.json({
//       ticket: ticketList,
//       currentPage: page,
//       totalPages: Math.ceil(total / limit),
//       totalCount: total,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching tickets:", error);
//     return NextResponse.json({ error: "Failed to load tickets" }, { status: 500 });
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ticket, admin } from "@/lib/schema";
import { ilike, desc, and, sql, or, eq, gte } from "drizzle-orm";

// Default admin user ID (you can replace this with env config or session auth)
const ADMIN_ID = 9;
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

/**
 * ✅ POST /api/tickets → Create a new ticket
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message = "", assign_to, status } = body;

    const result = await db
      .insert(ticket)
      .values({
        name,
        email,
        subject,
        message,
        assign_to,
        status,
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json(
      { message: "Ticket created successfully", result },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error creating ticket:", error);
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}

/**
 * ✅ GET /api/tickets → Fetch paginated tickets with filters
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);

    // Extract query params
    const search = url.searchParams.get("search")?.trim() || "";
    const timeRange = url.searchParams.get("timeRange") as TimeRange | null;
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const userId = parseInt(url.searchParams.get("userId") || "0", 10);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const offset = (page - 1) * limit;
    const isAdmin = userId === ADMIN_ID;

    // WHERE conditions
    const conditions = [];

    // 🔍 Search filter
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

    // 🕒 Time range filter
    const timeCondition = getTimeFilterCondition(ticket.createdAt, timeRange);
    if (timeCondition) {
      conditions.push(timeCondition);
    }

    // 👤 Role-based filter
    if (!isAdmin) {
      conditions.push(eq(ticket.assign_to, userId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Fields to select
    const ticketSelectFields = {
      id: ticket.id,
      name: ticket.name,
      email: ticket.email,
      subject: ticket.subject,
      message: ticket.message,
      assign_to: ticket.assign_to,
      status: ticket.status,
      createdAt: ticket.createdAt,
      assign_to_username: admin.username, // From joined admin table
    };

    // Fetch paginated data & total count
    const [ticketList, totalResult] = await Promise.all([
      db
        .select(ticketSelectFields)
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

    return NextResponse.json({
      ticket: ticketList,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
    });
  } catch (error) {
    console.error("❌ Error fetching tickets:", error);
    return NextResponse.json({ error: "Failed to load tickets" }, { status: 500 });
  }
}
