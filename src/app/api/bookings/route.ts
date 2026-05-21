import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings } from "@/lib/schema";
import { coaches, users, playerEvaluation } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    const result = await db
      .select({
        id: bookings.id,
        coach_id: bookings.coach_id,
        player_id: bookings.player_id,
        evaluation_id: bookings.evaluation_id,
        start_time: bookings.start_time,
        end_time: bookings.end_time,
        status: bookings.status,
        coach_name: sql<string>`CONCAT(${coaches.firstName}, ' ', ${coaches.lastName})`,
        player_name: sql<string>`CONCAT(${users.first_name}, ' ', ${users.last_name})`,
        evaluation_title: playerEvaluation.review_title,
      })
      .from(bookings)
      .leftJoin(coaches, eq(bookings.coach_id, coaches.id))
      .leftJoin(users, eq(bookings.player_id, users.id))
      .leftJoin(playerEvaluation, eq(bookings.evaluation_id, playerEvaluation.id))
      .orderBy(bookings.id);

    return NextResponse.json({ success: true, bookings: result });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}