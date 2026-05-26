// app/api/video-payments/[playerId]/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

import {
  video_payments,
  bookings,
  users,
  coaches,
  playerEvaluation,
} from "@/lib/schema";

import {
  eq,
  desc,
  and,
  sql,
} from "drizzle-orm";

import { alias } from "drizzle-orm/pg-core";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const num = (v: unknown): number =>
  parseFloat(String(v ?? "0")) || 0;

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// GET API
// ─────────────────────────────────────────────

export async function GET(
  _req: Request,
  {
    params,
  }: {
    params: Promise<{ playerId: string }>;
  }
) {
  try {

    // ─────────────────────────────────────────
    // Get Player ID
    // ─────────────────────────────────────────

    const { playerId: playerIdStr } = await params;

    if (!playerIdStr) {
      return NextResponse.json(
        {
          success: false,
          message: "Player ID is required",
        },
        { status: 400 }
      );
    }

    const playerId = Number(playerIdStr);

    if (isNaN(playerId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Player ID",
        },
        { status: 400 }
      );
    }

    console.log("PLAYER ID:", playerId);

    const playerUser = alias(users, "player_user");

    // ─────────────────────────────────────────
    // 1. Fetch Payments
    // ─────────────────────────────────────────

    const payments = await db
      .select({
        id: video_payments.id,

        player_id: video_payments.player_id,
        coach_id: video_payments.coach_id,

        booking_id: video_payments.booking_id,

        amount: video_payments.amount,
        original_amount: video_payments.original_amount,

        status: video_payments.status,
        currency: video_payments.currency,

        payment_info: video_payments.payment_info,

        created_at: video_payments.created_at,

        description: video_payments.description,

        intent_id: video_payments.intent_id,
        charge_id: video_payments.charge_id,

        is_deleted: video_payments.is_deleted,

        company_amount: video_payments.company_amount,
        commission_rate: video_payments.commission_rate,

        // ✅ Booking fields
        start_time: bookings.start_time,
        end_time: bookings.end_time,
        evaluationId: bookings.evaluation_id,

        // ✅ Evaluation title
        review_title: playerEvaluation.review_title,

        // ✅ Player name
        player_name: sql<string>`
          concat(
            ${playerUser.first_name},
            ' ',
            ${playerUser.last_name}
          )
        `,

        // ✅ Coach name
        coach_name: sql<string>`
          concat(
            ${coaches.firstName},
            ' ',
            ${coaches.lastName}
          )
        `,
      })

      .from(video_payments)

      // ✅ FIRST join bookings
      .leftJoin(
        bookings,
        eq(video_payments.booking_id, bookings.id)
      )

      // ✅ THEN join evaluation
      .leftJoin(
        playerEvaluation,
        eq(bookings.evaluation_id, playerEvaluation.id)
      )

      // ✅ Player
      .leftJoin(
        playerUser,
        eq(video_payments.player_id, playerUser.id)
      )

      // ✅ Coach
      .leftJoin(
        coaches,
        eq(video_payments.coach_id, coaches.id)
      )

      .where(
        and(
          eq(video_payments.is_deleted, false),
          eq(video_payments.player_id, playerId)
        )
      )

      .orderBy(desc(video_payments.created_at));

    // ─────────────────────────────────────────
    // 2. Fetch Bookings
    // ─────────────────────────────────────────

    const allBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.player_id, playerId))
      .orderBy(desc(bookings.created_at));

    // ─────────────────────────────────────────
    // 3. Revenue Summary
    // ─────────────────────────────────────────

    let totalVideoPayment = 0;
    let totalEvaluationPayment = 0;
    let totalCompanyRevenue = 0;

    payments.forEach((p) => {
      totalVideoPayment += num(p.original_amount);
      totalEvaluationPayment += num(p.amount);
      totalCompanyRevenue += num(p.company_amount);
    });

    const totalCombined =
      totalVideoPayment + totalEvaluationPayment;

    const totalRecords = payments.length;

    // ─────────────────────────────────────────
    // 4. Booking Stats
    // ─────────────────────────────────────────

    const completedBookings = allBookings.filter(
      (b) => b.status === "completed"
    );

    const scheduledBookings = allBookings.filter(
      (b) => b.status === "scheduled"
    );

    const cancelledBookings = allBookings.filter(
      (b) => b.status === "cancelled"
    );

    const totalBookings = allBookings.length;

    const cancellationRate =
      totalBookings > 0
        ? parseFloat(
            (
              (cancelledBookings.length / totalBookings) *
              100
            ).toFixed(2)
          )
        : 0;

    // ─────────────────────────────────────────
    // 5. Payment Map
    // ─────────────────────────────────────────

    const paymentByBookingId =
      new Map<number, (typeof payments)[0]>();

    payments.forEach((payment) => {
      if (
        payment.booking_id !== null &&
        payment.booking_id !== undefined
      ) {
        paymentByBookingId.set(
          payment.booking_id,
          payment
        );
      }
    });

    // ─────────────────────────────────────────
    // 6. Player Data
    // ─────────────────────────────────────────

    const playerData: PlayerData = {
      player_id: playerId,

      total_bookings: totalBookings,

      completed_bookings:
        completedBookings.length,

      scheduled_bookings:
        scheduledBookings.length,

      cancelled_bookings:
        cancelledBookings.length,

      cancellation_rate: cancellationRate,

      total_video_spent: 0,
      total_eval_received: 0,

      booking_flow: [],
    };

    // ─────────────────────────────────────────
    // 7. Booking Flow
    // ─────────────────────────────────────────

    allBookings.forEach((booking) => {

      const payment =
        paymentByBookingId.get(booking.id);

      if (payment) {
        playerData.total_video_spent +=
          num(payment.original_amount);

        playerData.total_eval_received +=
          num(payment.amount);
      }

      playerData.booking_flow.push({
        booking_id: booking.id,

        status: booking.status ?? null,

        created_at: booking.created_at
          ? String(booking.created_at)
          : null,

        has_evaluation: !!payment,

        evaluation_amount:
          payment?.amount ?? null,

        video_amount:
          payment?.original_amount ?? null,

        payment_status:
          payment?.status ?? null,

        payment_created_at:
          payment?.created_at
            ? String(payment.created_at)
            : null,
      });
    });

    // ─────────────────────────────────────────
    // Final Response
    // ─────────────────────────────────────────

    return NextResponse.json({
      success: true,

      player: playerData,

      summary: {
        totalVideoPayment,
        totalEvaluationPayment,
        totalCombined,
        totalCompanyRevenue,
        totalRecords,
      },

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
        message: "Failed to fetch video payments",
      },
      { status: 500 }
    );
  }
}