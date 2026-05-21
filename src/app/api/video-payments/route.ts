/* // app/api/video-payments/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

import {
  video_payments,
  bookings,
} from "@/lib/schema";

import {
  eq,
  desc,
} from "drizzle-orm";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const num = (v: unknown) => Number(v ?? 0);

// ─────────────────────────────────────────────
// GET /api/video-payments
// ─────────────────────────────────────────────

export async function GET() {
  try {
    // ─────────────────────────────────────────
    // 1. Fetch active payments
    // ─────────────────────────────────────────
    const payments = await db
      .select()
      .from(video_payments)
      .where(eq(video_payments.is_deleted, false))
      .orderBy(desc(video_payments.created_at));

    // ─────────────────────────────────────────
    // 2. Revenue summary
    // ─────────────────────────────────────────
    let totalVideoPayment = 0;
    let totalEvaluationPayment = 0;
    let totalCompanyRevenue = 0;

    payments.forEach((payment) => {
      totalVideoPayment += num(
        payment.original_amount
      );

      totalEvaluationPayment += num(
        payment.amount
      );

      totalCompanyRevenue += num(
        payment.company_amount
      );
    });

    const totalCombined =
      totalVideoPayment +
      totalEvaluationPayment;

    const totalRecords = payments.length;

    // ─────────────────────────────────────────
    // 3. Fetch bookings
    // ─────────────────────────────────────────
    const allBookings = await db
      .select()
      .from(bookings)
      .orderBy(desc(bookings.created_at));

    // ─────────────────────────────────────────
    // 4. Booking stats
    // ─────────────────────────────────────────
    const completedBookings =
      allBookings.filter(
        (b) => b.status === "completed"
      );

    const scheduledBookings =
      allBookings.filter(
        (b) => b.status === "scheduled"
      );

    const cancelledBookings =
      allBookings.filter(
        (b) => b.status === "cancelled"
      );

    const totalBookings =
      allBookings.length;

    const cancellationRate =
      totalBookings > 0
        ? parseFloat(
            (
              (cancelledBookings.length /
                totalBookings) *
              100
            ).toFixed(2)
          )
        : 0;

    // ─────────────────────────────────────────
    // 5. Payment lookup by booking_id
    // ─────────────────────────────────────────
    const paymentByBookingId =
      new Map<
        number,
        (typeof payments)[0]
      >();

    payments.forEach((p) => {
      // ✅ FIX NULL ISSUE
      if (
        p.booking_id !== null &&
        p.booking_id !== undefined
      ) {
        paymentByBookingId.set(
          p.booking_id,
          p
        );
      }
    });

    // ─────────────────────────────────────────
    // 6. Player aggregation
    // ─────────────────────────────────────────
    const playerMap = new Map<
      number,
      {
        player_id: number;
        total_bookings: number;
        completed_bookings: number;
        scheduled_bookings: number;
        cancelled_bookings: number;
        cancellation_rate: number;
        total_video_spent: number;
        total_eval_received: number;

        booking_flow: Array<{
          booking_id: number;
          status: string | null;
          created_at: string | null;

          has_evaluation: boolean;

          evaluation_amount:
            | string
            | null;

          video_amount:
            | string
            | null;

          payment_status:
            | string
            | null;

          payment_created_at:
            | string
            | null;
        }>;
      }
    >();

    allBookings.forEach((booking) => {
      // ✅ FIX NULL ISSUE
      if (
        booking.player_id === null ||
        booking.player_id === undefined
      ) {
        return;
      }

      const playerId =
        booking.player_id;

      // Create player bucket
      if (!playerMap.has(playerId)) {
        playerMap.set(playerId, {
          player_id: playerId,

          total_bookings: 0,

          completed_bookings: 0,

          scheduled_bookings: 0,

          cancelled_bookings: 0,

          cancellation_rate: 0,

          total_video_spent: 0,

          total_eval_received: 0,

          booking_flow: [],
        });
      }

      const player =
        playerMap.get(playerId)!;

      player.total_bookings++;

      // Status counts
      if (
        booking.status === "completed"
      ) {
        player.completed_bookings++;
      }

      if (
        booking.status === "scheduled"
      ) {
        player.scheduled_bookings++;
      }

      if (
        booking.status === "cancelled"
      ) {
        player.cancelled_bookings++;
      }

      // Payment data
      const payment =
        paymentByBookingId.get(
          booking.id
        );

      if (payment) {
        player.total_video_spent +=
          num(
            payment.original_amount
          );

        player.total_eval_received +=
          num(payment.amount);
      }

      // Booking flow
      if (
        booking.status ===
          "scheduled" ||
        booking.status ===
          "completed"
      ) {
        player.booking_flow.push({
          booking_id: booking.id,

          status:
            booking.status ?? null,

          created_at:
            booking.created_at
              ? String(
                  booking.created_at
                )
              : null,

          has_evaluation:
            !!payment,

          evaluation_amount:
            payment?.amount ?? null,

          video_amount:
            payment?.original_amount ??
            null,

          payment_status:
            payment?.status ?? null,

          payment_created_at:
            payment?.created_at
              ? String(
                  payment.created_at
                )
              : null,
        });
      }
    });

    // ─────────────────────────────────────────
    // 7. Player cancellation %
    // ─────────────────────────────────────────
    playerMap.forEach((player) => {
      player.cancellation_rate =
        player.total_bookings > 0
          ? parseFloat(
              (
                (player.cancelled_bookings /
                  player.total_bookings) *
                100
              ).toFixed(2)
            )
          : 0;
    });

    const playerStats =
      Array.from(
        playerMap.values()
      ).sort(
        (a, b) =>
          b.total_bookings -
          a.total_bookings
      );

    // ─────────────────────────────────────────
    // Final Response
    // ─────────────────────────────────────────
    return NextResponse.json({
      success: true,

      summary: {
        totalVideoPayment,

        totalEvaluationPayment,

        totalCombined,

        totalCompanyRevenue,

        totalRecords,
      },

      bookings: {
        total: totalBookings,

        completed:
          completedBookings.length,

        scheduled:
          scheduledBookings.length,

        cancelled:
          cancelledBookings.length,

        cancellationRate,
      },

      playerStats,

      payments,
    });
  } catch (error) {
    console.error(
      "[video-payments] GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch video payments",
      },
      {
        status: 500,
      }
    );
  }
} */


// app/api/video-payments/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { video_payments, bookings, users, coaches } from "@/lib/schema";
import { eq, desc, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

const num = (v: unknown): number => parseFloat(String(v ?? "0")) || 0;

type BookingFlowItem = {
  booking_id: number;
  status: string | null;
  created_at: string | null;
  has_evaluation: boolean;
  evaluation_amount: string | null;
  video_amount: string | null;
  payment_status: string | null;
  payment_created_at: string | null;
};

type PlayerData = {
  player_id: number;
  total_bookings: number;
  completed_bookings: number;
  scheduled_bookings: number;
  cancelled_bookings: number;
  cancellation_rate: number;
  total_video_spent: number;
  total_eval_received: number;
  booking_flow: BookingFlowItem[];
};

export async function GET() {
  try {
    const playerUser = alias(users, "player_user");

    // ─────────────────────────────────────────
    // 1. Fetch payments with player & coach names
    // ─────────────────────────────────────────
    const payments = await db
      .select({
        id:              video_payments.id,
        player_id:       video_payments.player_id,
        coach_id:        video_payments.coach_id,
        booking_id:      video_payments.booking_id,
        amount:          video_payments.amount,
        original_amount: video_payments.original_amount,
        status:          video_payments.status,
        currency:        video_payments.currency,
        payment_info:    video_payments.payment_info,
        created_at:      video_payments.created_at,
        description:     video_payments.description,
        intent_id:       video_payments.intent_id,
        charge_id:       video_payments.charge_id,
        is_deleted:      video_payments.is_deleted,
        company_amount:  video_payments.company_amount,
        commission_rate: video_payments.commission_rate,
        player_name: sql<string>`concat(${playerUser.first_name}, ' ', ${playerUser.last_name})`,
        coach_name:  sql<string>`concat(${coaches.firstName}, ' ', ${coaches.lastName})`,
      })
      .from(video_payments)
      .leftJoin(playerUser, eq(video_payments.player_id, playerUser.id))
      .leftJoin(coaches, eq(video_payments.coach_id, coaches.id))
      .where(eq(video_payments.is_deleted, false))
      .orderBy(desc(video_payments.created_at));

    // ─────────────────────────────────────────
    // 2. Revenue summary
    // ─────────────────────────────────────────
    let totalVideoPayment      = 0;
    let totalEvaluationPayment = 0;
    let totalCompanyRevenue    = 0;

    payments.forEach((p) => {
      totalVideoPayment      += num(p.original_amount);
      totalEvaluationPayment += num(p.amount);
      totalCompanyRevenue    += num(p.company_amount);
    });

    const totalCombined = totalVideoPayment + totalEvaluationPayment;
    const totalRecords  = payments.length;

    // ─────────────────────────────────────────
    // 3. All bookings
    // ─────────────────────────────────────────
    const allBookings = await db
      .select()
      .from(bookings)
      .orderBy(desc(bookings.created_at));

    // ─────────────────────────────────────────
    // 4. Overall booking stats
    // ─────────────────────────────────────────
    const completedBookings = allBookings.filter((b) => b.status === "completed");
    const scheduledBookings = allBookings.filter((b) => b.status === "scheduled");
    const cancelledBookings = allBookings.filter((b) => b.status === "cancelled");
    const totalBookings     = allBookings.length;

    const cancellationRate =
      totalBookings > 0
        ? parseFloat(((cancelledBookings.length / totalBookings) * 100).toFixed(2))
        : 0;

    // ─────────────────────────────────────────
    // 5. ✅ Video-specific cancellation stats
    //    — directly from video_payments table
    //    — NOT from bookings table
    // ─────────────────────────────────────────
    const videoCancelledCount = payments.filter(
      (p) => p.status?.toLowerCase() === "cancelled"
    ).length;

    const videoBookingsTotal = payments.length; // total video payment records

    const videoCancellationRate =
      videoBookingsTotal > 0
        ? parseFloat(((videoCancelledCount / videoBookingsTotal) * 100).toFixed(2))
        : 0;

    // ─────────────────────────────────────────
    // 6. Payment lookup by booking_id
    // ─────────────────────────────────────────
    const paymentByBookingId = new Map<number, (typeof payments)[0]>();
    payments.forEach((p) => {
      if (p.booking_id !== null && p.booking_id !== undefined) {
        paymentByBookingId.set(p.booking_id, p);
      }
    });

    // ─────────────────────────────────────────
    // 7. Player aggregation
    // ─────────────────────────────────────────
    const playerMap = new Map<number, PlayerData>();

    allBookings.forEach((booking) => {
      if (booking.player_id === null || booking.player_id === undefined) return;

      const playerId = booking.player_id;

      if (!playerMap.has(playerId)) {
        playerMap.set(playerId, {
          player_id:           playerId,
          total_bookings:      0,
          completed_bookings:  0,
          scheduled_bookings:  0,
          cancelled_bookings:  0,
          cancellation_rate:   0,
          total_video_spent:   0,
          total_eval_received: 0,
          booking_flow:        [],
        });
      }

      const player = playerMap.get(playerId)!;
      player.total_bookings++;

      if (booking.status === "completed") player.completed_bookings++;
      if (booking.status === "scheduled") player.scheduled_bookings++;
      if (booking.status === "cancelled") player.cancelled_bookings++;

      const payment = paymentByBookingId.get(booking.id);

      if (payment) {
        player.total_video_spent   += num(payment.original_amount);
        player.total_eval_received += num(payment.amount);
      }

      if (booking.status === "scheduled" || booking.status === "completed") {
        player.booking_flow.push({
          booking_id:         booking.id,
          status:             booking.status ?? null,
          created_at:         booking.created_at ? String(booking.created_at) : null,
          has_evaluation:     !!payment,
          evaluation_amount:  payment?.amount ?? null,
          video_amount:       payment?.original_amount ?? null,
          payment_status:     payment?.status ?? null,
          payment_created_at: payment?.created_at ? String(payment.created_at) : null,
        });
      }
    });

    // ─────────────────────────────────────────
    // 8. Player cancellation %
    // ─────────────────────────────────────────
    playerMap.forEach((player) => {
      player.cancellation_rate =
        player.total_bookings > 0
          ? parseFloat(((player.cancelled_bookings / player.total_bookings) * 100).toFixed(2))
          : 0;
    });

    const playerStats = Array.from(playerMap.values()).sort(
      (a, b) => b.total_bookings - a.total_bookings
    );

    // ─────────────────────────────────────────
    // Final Response
    // ─────────────────────────────────────────
    return NextResponse.json({
      success: true,
      summary: {
        totalVideoPayment,
        totalEvaluationPayment,
        totalCombined,
        totalCompanyRevenue,
        totalRecords,
      },
      bookings: {
        total:                totalBookings,
        completed:            completedBookings.length,
        scheduled:            scheduledBookings.length,
        cancelled:            cancelledBookings.length,
        cancellationRate,
        videoCancellationRate,  // ✅ from video_payments
        videoCancelledCount,    // ✅ from video_payments
        videoBookingsTotal,     // ✅ from video_payments
      },
      playerStats,
      payments,
    });

  } catch (error) {
    console.error("[video-payments] GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch video payments" },
      { status: 500 }
    );
  }
}