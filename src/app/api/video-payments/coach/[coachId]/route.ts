import { NextResponse } from "next/server";
import { db } from "@/lib/db";

import {
    video_payments,
    bookings,
    coaches,
    users,
} from "@/lib/schema";

import {
    eq,
    desc,
    and,
} from "drizzle-orm";

import { alias } from "drizzle-orm/pg-core";

const num = (v: unknown): number =>
    parseFloat(String(v ?? "0")) || 0;

type BookingFlowItem = {
    booking_id: number;
    status: string | null;
    created_at: string | null;
    has_payment: boolean;
    evaluation_amount: string | null;
    video_amount: string | null;
    payment_status: string | null;
    payment_created_at: string | null;
};

type CoachSummary = {
    coach_id: number;
    total_bookings: number;
    completed_bookings: number;
    scheduled_bookings: number;
    cancelled_bookings: number;
    cancellation_rate: number;
    total_video_earned: number;
    total_eval_earned: number;
    booking_flow: BookingFlowItem[];
};

// ─────────────────────────────────────────────
// GET /api/video-payments/coach/[coachId]
// ─────────────────────────────────────────────

export async function GET(
    _req: Request,
    {
        params,
    }: {
        params: Promise<{ coachId: string }>;
    }
) {
    try {

        // ─────────────────────────────────────
        // 1. Validate Coach ID
        // ─────────────────────────────────────

        const { coachId: coachIdStr } =
            await params;

        if (!coachIdStr) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Coach ID is required",
                },
                { status: 400 }
            );
        }

        const coachId = Number(coachIdStr);

        if (
            isNaN(coachId) ||
            coachId <= 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid Coach ID",
                },
                { status: 400 }
            );
        }

        console.log(
            "[video-payments] coachId:",
            coachId
        );

        // ─────────────────────────────────────
        // 2. Aliases
        // ─────────────────────────────────────

        const coachUser = alias(
            coaches,
            "coach_user"
        );

        // ─────────────────────────────────────
        // 3. Fetch Payments
        // ─────────────────────────────────────

        const payments = await db
            .select({
                id: video_payments.id,
                player_id: video_payments.player_id,
                coach_id:video_payments.coach_id,
                booking_id: video_payments.booking_id,
                amount: video_payments.amount,
                original_amount: video_payments.original_amount,
                status:video_payments.status,
                currency:video_payments.currency,
                payment_info:video_payments.payment_info,
                created_at: video_payments.created_at,
                description:video_payments.description,
                intent_id:video_payments.intent_id,
                charge_id:video_payments.charge_id,
                is_deleted:video_payments.is_deleted,
                company_amount: video_payments.company_amount,
                commission_rate:video_payments.commission_rate,
                player_first:users.first_name,
                player_last:users.last_name,
                coach_first:coachUser.firstName,
                coach_last:coachUser.lastName,
                start_time: bookings.start_time,
                end_time: bookings.end_time,
            })

            .from(video_payments)

            .leftJoin(
                coachUser,
                eq(
                    video_payments.coach_id,
                    coachUser.id
                )
            )

            .leftJoin(
                users,
                eq(
                    video_payments.player_id,
                    users.id
                )
            )
            .leftJoin(
                    bookings,
                    eq(video_payments.booking_id, bookings.id)
                  )

            .where(
                and(
                    eq(
                        video_payments.is_deleted,
                        false
                    ),

                    eq(
                        video_payments.coach_id,
                        coachId
                    )
                )
            )

            .orderBy(
                desc(
                    video_payments.created_at
                )
            );

        console.log(
            "[video-payments] Payments:",
            payments.length
        );

        // ─────────────────────────────────────
        // 4. Fetch Coach Bookings
        // ─────────────────────────────────────

        const allBookings = await db
            .select({
                id: bookings.id,
                status: bookings.status,
                created_at:
                    bookings.created_at,
            })

            .from(bookings)

            .where(
                eq(
                    bookings.coach_id,
                    coachId
                )
            )

            .orderBy(
                desc(bookings.created_at)
            );

        console.log(
            "[video-payments] Bookings:",
            allBookings.length
        );

        // ─────────────────────────────────────
        // 5. Format Payments
        // ─────────────────────────────────────

        const formattedPayments =
            payments.map((p) => ({
                ...p,

                coach_name:
                    [
                        p.coach_first,
                        p.coach_last,
                    ]
                        .filter(Boolean)
                        .join(" ") || null,

                player_name:
                    [
                        p.player_first,
                        p.player_last,
                    ]
                        .filter(Boolean)
                        .join(" ") || null,
            }));

        // ─────────────────────────────────────
        // 6. Revenue Summary
        // ─────────────────────────────────────

        let totalVideoPayment = 0;
        let totalEvaluationPayment = 0;
        let totalCompanyRevenue = 0;

        payments.forEach((p) => {
            totalVideoPayment += num(
                p.original_amount
            );

            totalEvaluationPayment += num(
                p.amount
            );

            totalCompanyRevenue += num(
                p.company_amount
            );
        });

        const totalCombined =
            totalVideoPayment +
            totalEvaluationPayment;

        const totalRecords =
            payments.length;

        // ─────────────────────────────────────
        // 7. Booking Statistics
        // ─────────────────────────────────────

        const completedBookings =
            allBookings.filter(
                (b) =>
                    b.status ===
                    "completed"
            );

        const scheduledBookings =
            allBookings.filter(
                (b) =>
                    b.status ===
                    "scheduled"
            );

        const cancelledBookings =
            allBookings.filter(
                (b) =>
                    b.status ===
                    "cancelled"
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

        // ─────────────────────────────────────
        // 8. Payment Map
        // ─────────────────────────────────────

        const paymentByBookingId =
            new Map<
                number,
                (typeof payments)[0]
            >();

        payments.forEach((payment) => {
            if (
                payment.booking_id != null
            ) {
                paymentByBookingId.set(
                    payment.booking_id,
                    payment
                );
            }
        });

        // ─────────────────────────────────────
        // 9. Coach Summary
        // ─────────────────────────────────────

        const coachSummary: CoachSummary =
        {
            coach_id: coachId,

            total_bookings:
                totalBookings,

            completed_bookings:
                completedBookings.length,

            scheduled_bookings:
                scheduledBookings.length,

            cancelled_bookings:
                cancelledBookings.length,

            cancellation_rate:
                cancellationRate,

            total_video_earned: 0,

            total_eval_earned: 0,

            booking_flow: [],
        };

        allBookings.forEach((booking) => {

            const payment =
                paymentByBookingId.get(
                    booking.id
                );

            if (payment) {

                coachSummary.total_video_earned +=
                    num(
                        payment.original_amount
                    );

                coachSummary.total_eval_earned +=
                    num(payment.amount);
            }

            coachSummary.booking_flow.push({
                booking_id: booking.id,

                status:
                    booking.status ?? null,

                created_at:
                    booking.created_at
                        ? String(
                            booking.created_at
                        )
                        : null,

                has_payment: !!payment,

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
        });

        // ─────────────────────────────────────
        // 10. Final Response
        // ─────────────────────────────────────

        return NextResponse.json({
            success: true,

            coach: coachSummary,

            summary: {
                totalVideoPayment,
                totalEvaluationPayment,
                totalCombined,
                totalCompanyRevenue,
                totalRecords,
            },

            payments:
                formattedPayments,
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

                error:
                    error instanceof Error
                        ? error.message
                        : "Unknown error",
            },
            { status: 500 }
        );
    }
}