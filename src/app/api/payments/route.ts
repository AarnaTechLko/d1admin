// import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/lib/db";
// import { payments, playerEvaluation, users } from "@/lib/schema";
// import { eq, desc, gte, and, sql } from "drizzle-orm";

// type TimeRange = "24h" | "1w" | "1m" | "1y";

// // ⏳ Time range helper
// function getTimeFilterCondition(column: typeof payments.created_at, timeRange: TimeRange | string | null) {
//   if (!timeRange) return undefined;
//   const now = new Date();
//   switch (timeRange) {
//     case '24h':
//       return gte(column, new Date(now.getTime() - 24 * 60 * 60 * 1000));
//     case '1w':
//       return gte(column, new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
//     case '1m':
//       return gte(column, new Date(new Date().setMonth(now.getMonth() - 1)));
//     case '1y':
//       return gte(column, new Date(new Date().setFullYear(now.getFullYear() - 1)));
//     default:
//       return undefined;
//   }
// }

// export async function GET(req: NextRequest) {
//   try {
//     const url = new URL(req.url);
//     const timeRange = url.searchParams.get("timeRange") || "";
//     const page = parseInt(url.searchParams.get("page") ?? "1", 10);
//     const limit = parseInt(url.searchParams.get("limit") ?? "10", 10);
//     const offset = (page - 1) * limit;

//     const conditions = [];
//     const timeCondition = getTimeFilterCondition(payments.created_at, timeRange);
//     if (timeCondition) {
//       conditions.push(timeCondition);
//     }

//     const whereClause = conditions.length > 0 ? and(...conditions) : sql`1=1`;
//  const totalRec = await db
//       .select({
//         count: sql<number>`COUNT(*)::int`,
//       }) 
//       .from(payments)
//       .where(whereClause);

//     const total = totalRec[0]?.count ?? 0;

//     // ---------
//     const data = await db
//       .select({
//         id: payments.id,
//         coach_id: payments.coach_id,
//         evaluation_id: payments.evaluation_id,
//         player_id: payments.player_id,
//         amount: payments.amount,
//         status: payments.status,
//         currency: payments.currency,
//         payment_info: payments.payment_info,
//         description: payments.description,
//         created_at: payments.created_at,
//         is_deleted: payments.is_deleted,
//         review_title: playerEvaluation.review_title,
//         playerFirstName: users.first_name,
//       })
//       .from(payments)
//       .leftJoin(playerEvaluation, eq(payments.evaluation_id, playerEvaluation.id))
//       .leftJoin(users, eq(payments.player_id, users.id))
//       .where(whereClause)
//       .limit(limit)
//       .offset(offset)
//       .orderBy(desc(payments.created_at));

//     return NextResponse.json({
//       data,
//       totalCount: data.length,
//       currentPage: page,
//       totalPages: Math.ceil(total / limit),
//       hasNextPage: page * limit < total,
//       hasPrevPage: page > 1,
//     });

//   } catch (error) {
//     console.error("[GET /api/payments] Error:", error);
//     return new Response("Failed to fetch payments", { status: 500 });
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { payments, playerEvaluation, users,coaches } from "@/lib/schema";
import { eq, desc, gte, and, sql } from "drizzle-orm";

type TimeRange = "24h" | "1w" | "1m" | "1y";

// ⏳ Time range helper
function getTimeFilterCondition(
  column: typeof payments.created_at,
  timeRange: TimeRange | string | null
) {
  if (!timeRange) return undefined;

  const now = new Date();

  switch (timeRange) {
    case "24h":
      return gte(column, new Date(now.getTime() - 24 * 60 * 60 * 1000));
    case "1w":
      return gte(column, new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
    case "1m":
      return gte(column, new Date(new Date().setMonth(now.getMonth() - 1)));
    case "1y":
      return gte(column, new Date(new Date().setFullYear(now.getFullYear() - 1)));
    default:
      return undefined;
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);

    const timeRange = url.searchParams.get("timeRange");
    const page = Math.max(Number(url.searchParams.get("page") ?? 1), 1);
    const limit = Math.max(Number(url.searchParams.get("limit") ?? 10), 1);
    const offset = (page - 1) * limit;

    const conditions = [];
    const timeCondition = getTimeFilterCondition(payments.created_at, timeRange);
    if (timeCondition) conditions.push(timeCondition);

    const whereClause =
      conditions.length > 0 ? and(...conditions) : sql`true`;

    // ✅ Total count
    const [{ count }] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(payments)
      .where(whereClause);

    // ✅ Paginated data
    const data = await db
      .select({
        id: payments.id,
        coach_id: payments.coach_id,
        evaluation_id: payments.evaluation_id,
        player_id: payments.player_id,
        amount: payments.amount,
        status: payments.status,
        currency: payments.currency,
        payment_info: payments.payment_info,
        description: payments.description,
        created_at: payments.created_at,
        is_deleted: payments.is_deleted,
        review_title: playerEvaluation.review_title,
        playerFirstName: users.first_name,
        playerLastName: users.last_name,
        coachFirstName: coaches.firstName,
        coachesLastName: coaches.lastName,
      })
      .from(payments)
      .leftJoin(playerEvaluation, eq(payments.evaluation_id, playerEvaluation.id))
      .leftJoin(users, eq(payments.player_id, users.id))
      .leftJoin(coaches, eq(payments.coach_id, coaches.id))
      .where(whereClause)
      .orderBy(desc(payments.created_at))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      data,
      pagination: {
        totalItems: count,
        currentPage: page,
        pageSize: limit,
        totalPages: Math.ceil(count / limit),
        hasNextPage: page * limit < count,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("[GET /api/payments]", error);
    return new NextResponse("Failed to fetch payments", { status: 500 });
  }
}
