import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { payments, playerEvaluation, users } from "@/lib/schema";
import { eq, desc, gte, and, sql } from "drizzle-orm";

type TimeRange = "24h" | "1w" | "1m" | "1y";

// ⏳ Time range helper
function getTimeFilterCondition(column: typeof payments.created_at, timeRange: TimeRange | string | null) {
  if (!timeRange) return undefined;
  const now = new Date();
  switch (timeRange) {
    case '24h':
      return gte(column, new Date(now.getTime() - 24 * 60 * 60 * 1000));
    case '1w':
      return gte(column, new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
    case '1m':
      return gte(column, new Date(new Date().setMonth(now.getMonth() - 1)));
    case '1y':
      return gte(column, new Date(new Date().setFullYear(now.getFullYear() - 1)));
    default:
      return undefined;
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const timeRange = url.searchParams.get("timeRange") || "";

    const conditions = [];
    const timeCondition = getTimeFilterCondition(payments.created_at, timeRange);
    if (timeCondition) {
      conditions.push(timeCondition);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : sql`1=1`;

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
      })
      .from(payments)
      .leftJoin(playerEvaluation, eq(payments.evaluation_id, playerEvaluation.id))
      .leftJoin(users, eq(payments.player_id, users.id))
      .where(whereClause)
      .orderBy(desc(payments.created_at));

    return NextResponse.json({
      data,
      totalCount: data.length,
    });

  } catch (error) {
    console.error("[GET /api/payments] Error:", error);
    return new Response("Failed to fetch payments", { status: 500 });
  }
}
