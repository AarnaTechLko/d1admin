/* import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { coaches } from "@/lib/schema";
import { eq, ilike, and, or, SQL } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { search, page, limit } = Object.fromEntries(
      req.nextUrl.searchParams
    ) as {
      search?: string;
      page?: string;
      limit?: string;
    };

    const pageNum = parseInt(page || "1", 10);
    const pageLimit = parseInt(limit || "10", 10);
    const offset = (pageNum - 1) * pageLimit;

    // ✅ Base condition: only approved_or_denied = 0
    let Condition: SQL<unknown> = eq(coaches.approved_or_denied, 0);

    // Combine search if provided
    if (search?.trim()) {
      const WhereCondition = and(
        Condition,
        or(
          ilike(coaches.firstName, `%${search}%`),
          ilike(coaches.lastName, `%${search}%`),
          ilike(coaches.email, `%${search}%`)
        )
      );
    }

    // Fetch coaches that satisfy the condition
    const matchingCoaches = await db
      .select()
      .from(coaches)
      .where(Condition);

    // If no coach matches, return empty array
    if (matchingCoaches.length === 0) {
      return NextResponse.json({ coaches: [], totalPages: 0 });
    }

    const totalPages = Math.ceil(matchingCoaches.length / pageLimit);
    const paginatedCoaches = matchingCoaches.slice(offset, offset + pageLimit);

    return NextResponse.json({
      coaches: paginatedCoaches,
      totalPages,
    });
  } catch (error) {
    console.error("Fetch coaches error:", error);
    return NextResponse.json(
      { error: "Failed to fetch coaches" },
      { status: 500 }
    );
  }
}
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { coaches, sports, countries, coachaccount } from "@/lib/schema";
import { eq, sql, type SQL } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { search, page, limit } = Object.fromEntries(
      req.nextUrl.searchParams
    ) as { search?: string; page?: string; limit?: string };

    const crownedParam = req.nextUrl.searchParams.get("crowned");
    const sport = parseInt(req.nextUrl.searchParams.get("sport") || "0", 0);
    const pageNum = Math.max(parseInt(page || "1", 10), 1);
    const pageLimit = Math.max(parseInt(limit || "10", 10), 1);
    const offset = (pageNum - 1) * pageLimit;

    /* -------------------- BASE CONDITION -------------------- */

    let whereCondition: SQL = sql`1 = 1`;

    whereCondition = sql`${whereCondition}
      AND ${coaches.approved_or_denied} = 0
      AND ${coaches.isCompletedProfile} = true
    `;

    if (search?.trim()) {
      whereCondition = sql`${whereCondition}
        AND (
          ${coaches.firstName} ILIKE ${`%${search}%`}
          OR ${coaches.lastName} ILIKE ${`%${search}%`}
          OR ${coaches.email} ILIKE ${`%${search}%`}
        )
      `;
    }

    if (crownedParam === "1") {
      whereCondition = sql`${whereCondition} AND ${coaches.verified} = 1`;
    } else if (crownedParam === "0") {
      whereCondition = sql`${whereCondition} AND ${coaches.verified} = 0`;
    }
    if (sport !== 0) {
      whereCondition = sql`${whereCondition} AND ${coaches.sport} = ${sport}`;
    }
    /* -------------------- TOTAL COUNT -------------------- */
    const [{ total }] = await db
      .select({
        total: sql<number>`count(distinct ${coaches.id})`,
      })
      .from(coaches)
      .where(whereCondition);

    const totalPages = Math.ceil(total / pageLimit);

    /* -------------------- PAGINATED DATA -------------------- */
    const paginatedCoaches = await db
      .select({
        id: coaches.id,
        image: coaches.image,
        firstName: coaches.firstName,
        lastName: coaches.lastName,
        email: coaches.email,
        verified: coaches.verified,
        updated_at: coaches.updated_at,
        countryName: countries.name,
        status: coaches.status,
        state: coaches.state,
        city: coaches.city,
        sport: sports.name,
        earnings: sql<number>`COALESCE(SUM(${coachaccount.amount}), 0)`,
      })
      .from(coaches)
      .leftJoin(sports, eq(sports.id, coaches.sport))
      .leftJoin(coachaccount, eq(coachaccount.coach_id, coaches.id))
      .leftJoin(
        countries,
        eq(countries.id, sql<number>`CAST(${coaches.country} AS INTEGER)`)
      )
      .where(whereCondition)
      .groupBy(
        coaches.id,
        coaches.image,
        coaches.firstName,
        coaches.lastName,
        coaches.email,
        coaches.updated_at,
        countries.name,
        coaches.status,
        coaches.state,
        coaches.city,
        sports.name
      )
      .orderBy(sql`${coaches.updated_at} DESC`)
      .limit(pageLimit)
      .offset(offset);

    return NextResponse.json({
      coaches: paginatedCoaches,
      totalPages,
    });
  } catch (error) {
    console.error("Fetch coaches error:", error);
    return NextResponse.json(
      { error: "Failed to fetch coaches" },
      { status: 500 }
    );
  }
}
