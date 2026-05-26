// app/api/bookings/[bookingId]/cancellation-reason/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

import { and, desc, eq ,inArray } from "drizzle-orm";
import { bookingStatusLogs } from "@/lib/schema";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const bookingId = Number((await params).bookingId);

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: "Invalid booking id" },
        { status: 400 }
      );
    }

    // Fetch latest cancelled/rejected log with reason
    const cancellationLog = await db.query.bookingStatusLogs.findFirst({
      where: and(
        eq(bookingStatusLogs.booking_id, bookingId),
         inArray(bookingStatusLogs.new_status, [
      "cancelled",
      "declined",
    ])
  ),
     
      orderBy: [desc(bookingStatusLogs.created_at)],
    });

    return NextResponse.json({
      success: true,
      reason: cancellationLog?.reason ?? null,
      log: cancellationLog ?? null,
    });
  } catch (error) {
    console.error("Cancellation reason fetch error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}