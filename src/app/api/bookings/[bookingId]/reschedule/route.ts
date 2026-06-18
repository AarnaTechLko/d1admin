import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings, bookingStatusLogs } from "@/lib/schema";
import { eq, and, notInArray, ne } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const bookingId = Number(await (await params).bookingId);
    const body = await req.json();

    const {
      start_time,
      end_time,
      previous_status,
      changed_by_user_id,
      changed_by_user_type,
      reason,
    } = body;

    // ── Validate: slot past mein nahi hona chahiye ─────────────────────
    if (new Date(start_time) <= new Date()) {
      return NextResponse.json(
        { success: false, message: "Cannot reschedule to a past time slot." },
        { status: 400 }
      );
    }

    // ── Validate: slot kisi aur ne already book na kiya ho ─────────────
    const conflicting = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.start_time, new Date(start_time)),
          eq(bookings.end_time, new Date(end_time)),
          ne(bookings.id, bookingId), // current booking ko skip kar
          notInArray(bookings.status, ["booked", "suggestion pending"])
        )
      );

    if (conflicting.length > 0) {
      return NextResponse.json(
        { success: false, message: "This slot has just been taken. Please pick another." },
        { status: 409 }
      );
    }

    // ── Update booking ─────────────────────────────────────────────────
    await db
      .update(bookings)
      .set({
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        status: "requested",
        meeting_id: null,
        updated_at: new Date(),
      })
      .where(eq(bookings.id, bookingId));

    // ── Audit log ──────────────────────────────────────────────────────
    await db.insert(bookingStatusLogs).values({
      booking_id: bookingId,
      previous_status: previous_status,
      new_status: "requested",
      changed_by_user_id: changed_by_user_id,
      changed_by_user_type: changed_by_user_type,
      reason: reason,
    });

    return NextResponse.json({ success: true });

  } catch (err: unknown) {
    console.error("🔴 Reschedule error:", err);
    return NextResponse.json(
      { success: false, message: (err as Error)?.message ?? "Failed to reschedule booking." },
      { status: 500 }
    );
  }
}