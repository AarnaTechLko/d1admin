
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { coaches, bookings, sports } from "@/lib/schema";
import { eq, and, sql } from "drizzle-orm";

// ─────────────────────────────────────────────
// GET API
// ─────────────────────────────────────────────
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const search = searchParams.get("search") || "";
        const video = searchParams.get("video") || "all";

        const conditions = [];

        // ─────────────────────────────────────────────
        // Search filter
        // ─────────────────────────────────────────────
        if (search) {
            conditions.push(
                sql`
          LOWER(CONCAT(${coaches.firstName}, ' ', ${coaches.lastName}))
          LIKE ${`%${search.toLowerCase()}%`}
        `
            );
        }

        // ─────────────────────────────────────────────
        // Video filter
        // ─────────────────────────────────────────────
        if (video === "enabled") {
            conditions.push(eq(coaches.visibility, "on"));
        }

        if (video === "disabled") {
            conditions.push(eq(coaches.visibility, "off"));
        }

        // ─────────────────────────────────────────────
        // Main query
        // ─────────────────────────────────────────────
        const data = await db
            .select({
                id: coaches.id,

                name: sql<string>`
          CONCAT(${coaches.firstName}, ' ', ${coaches.lastName})
        `,

                email: coaches.email,

                sport: sports.name,

                phone: coaches.phoneNumber,

                videoEnabled: sql<boolean>`
          CASE
            WHEN ${coaches.visibility} = 'on'
            THEN true
            ELSE false
          END
        `,

                feePerSession: coaches.expectedCharge,
                totalSessions: sql<number>`
                   COUNT(${bookings.id})
                     `,

                totalEarnings: sql<number>`
            COALESCE(SUM(${coaches.expectedCharge}), 0)
            `,
                      lastSessionDate: sql<Date | null>`
                    MAX(${bookings.created_at})
                    `.as("lastSessionDate"),
                    
            })
            .from(coaches)

            // sports join
            .leftJoin(
                sports,
                eq(sports.id, coaches.sport)
            )

            // bookings join
            .leftJoin(
                bookings,
                eq(bookings.coach_id, coaches.id)
            )

            .where(
                and(
                    eq(coaches.is_deleted, 1),
                    ...(conditions.length ? conditions : [])
                )
            )

            .groupBy(
                coaches.id,
                sports.name
            )

            .orderBy(sql`${coaches.createdAt} DESC`);

            
        // ─────────────────────────────────────────────
        // Response formatting
        // ─────────────────────────────────────────────
        const formatted = data.map((coach) => ({
            id: coach.id,

            name: coach.name?.trim() || "N/A",

            email: coach.email || "",

            sport: coach.sport || "—",

            phone: coach.phone || "",

            videoEnabled: coach.videoEnabled,

            feePerSession: Number(coach.feePerSession || 0),

            totalSessions: Number(coach.totalSessions || 0),

            totalEarnings: Number(coach.totalEarnings || 0),

            joinedDate: null,

            lastSessionDate: coach.lastSessionDate
                ? new Date(coach.lastSessionDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                })
                : null,
        }));
console.log("[VIDEO SETTINGS API] Fetched coaches:", formatted);
        return NextResponse.json({
            success: true,
            data: formatted,
        });
    } catch (error: unknown) {
        console.error("[VIDEO SETTINGS API ERROR]", error);

        return NextResponse.json(
            {
                success: false,
                error: (error as Error).message || "Internal Server Error",
            },
            { status: 500 }
        );
    }
}

