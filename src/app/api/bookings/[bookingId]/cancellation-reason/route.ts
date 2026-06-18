// app/api/bookings/[bookingId]/cancellation-reason/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { and, desc, eq, inArray } from "drizzle-orm";
import { bookingStatusLogs, bookings, video_payments } from "@/lib/schema";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

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

    const cancellationLog = await db.query.bookingStatusLogs.findFirst({
      where: and(
        eq(bookingStatusLogs.booking_id, bookingId),
        inArray(bookingStatusLogs.new_status, ["cancelled", "declined"])
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
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─── Constants ───────────────────────────────────────────────────────────────

const VALID_STATUSES = [
  "pending",
  "confirmed",
  "cancelled",
  "declined",
  "booked",
  "requested",
  "accepted",
] as const;

const VALID_USER_TYPES = ["admin", "user", "player"] as const;

type BookingStatus = (typeof VALID_STATUSES)[number];
type ChangedByType = (typeof VALID_USER_TYPES)[number];

// ─── PATCH /api/bookings/[bookingId]/cancellation-reason ─────────────────────

export async function PATCH(
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

    const body = await req.json();
    const { status, reason, changed_by_user_id, changed_by_user_type } =
      body as {
        status: BookingStatus;
        reason?: string;
        changed_by_user_id: number;
        changed_by_user_type: ChangedByType;
      };

    // ── Validate status ────────────────────────────────────────────────────
    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
        },
        { status: 422 }
      );
    }

    // ── Validate required fields for the log ──────────────────────────────
    if (!changed_by_user_id || !changed_by_user_type) {
      return NextResponse.json(
        {
          success: false,
          message: "changed_by_user_id and changed_by_user_type are required",
        },
        { status: 400 }
      );
    }

    // ── Validate user type ─────────────────────────────────────────────────
    if (!VALID_USER_TYPES.includes(changed_by_user_type)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid user type. Must be one of: ${VALID_USER_TYPES.join(", ")}`,
        },
        { status: 422 }
      );
    }

    // ── Check booking exists ───────────────────────────────────────────────
    const existing = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    const previousStatus = existing.status;

    // ── Update bookings row ────────────────────────────────────────────────
    const [updatedBooking] = await db
      .update(bookings)
      .set({
        status,
        updated_at: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    // ── Insert status log ──────────────────────────────────────────────────
    await db.insert(bookingStatusLogs).values({
      booking_id:           bookingId,
      previous_status:      previousStatus ?? "none",
      new_status:           status,
      changed_by_user_id:   changed_by_user_id,
      changed_by_user_type: changed_by_user_type,
      reason:               reason ?? null,
    });

    // ── Step 4: Release payment if cancelled or declined ──────────────────
    if (status === "cancelled" || status === "declined") {
      const paymentRow = await db.query.video_payments.findFirst({
        where: eq(video_payments.booking_id, bookingId),
      });

      if (paymentRow?.intent_id) {
        try {
          await stripe.paymentIntents.cancel(paymentRow.intent_id);
        } catch (stripeError: unknown) {
          // If already cancelled/captured, Stripe throws — log but don't fail the request
          console.warn(
            `Stripe cancel warning for intent ${paymentRow.intent_id}:`,
            (stripeError as Error)?.message
          );
        }

        await db
          .update(video_payments)
          .set({
            status: "Cancelled",
            updated_at: new Date(),
          })
          .where(eq(video_payments.booking_id, bookingId));
      }
    }

    return NextResponse.json({
      success: true,
      message: "Booking status updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Booking status update error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}