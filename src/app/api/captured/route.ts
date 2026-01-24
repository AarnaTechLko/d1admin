import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { payments, users, coaches } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { PaymentStatus } from '@/app/types/types';

export async function GET() {
  try {
    const result = await db
      .select({
        id: payments.id,
        playerName: users.first_name,
        playerImage: users.image,
        coachName: coaches.firstName,
        coachImage: coaches.image,
        evalId: payments.evaluation_id,
        amount: payments.amount,
        status: payments.status,
        created_at: payments.created_at,
      })
      .from(payments)
      .leftJoin(users, eq(payments.player_id, users.id))
      .leftJoin(coaches, eq(payments.coach_id, coaches.id))
      .where(eq(payments.status, PaymentStatus.CAPTURED))
      .orderBy(desc(payments.created_at)); // ✅ fetch only captured payments

    console.log("Captured Payments:", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
