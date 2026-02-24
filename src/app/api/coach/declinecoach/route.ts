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
import {
  coaches,
  sports,
  coachaccount,
  countries,
  licenses,
  playerEvaluation,
} from "@/lib/schema";
import {
  eq,
  ilike,
  and,
  or,
  gte,
  desc,
  sql,
  count,
} from "drizzle-orm";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  const search = url.searchParams.get("search")?.trim() || "";
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const offset = (page - 1) * limit;

  const timeRange = url.searchParams.get("timeRange") || "";
  const sport = parseInt(url.searchParams.get("sport") || "0", 10);
  const crownedParam = url.searchParams.get("crowned");

  const now = new Date();
  let timeFilterCondition;

  // 🕒 Time filter
  switch (timeRange) {
    case "24h":
      timeFilterCondition = gte(
        coaches.createdAt,
        new Date(now.getTime() - 24 * 60 * 60 * 1000)
      );
      break;
    case "1w":
      timeFilterCondition = gte(
        coaches.createdAt,
        new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      );
      break;
    case "1m":
      timeFilterCondition = gte(
        coaches.createdAt,
        new Date(new Date().setMonth(now.getMonth() - 1))
      );
      break;
    case "1y":
      timeFilterCondition = gte(
        coaches.createdAt,
        new Date(new Date().setFullYear(now.getFullYear() - 1))
      );
      break;
  }

  try {
    // 🔹 Build dynamic conditions array
    const conditions = [];

    // ✅ Base condition (change 2 → 1 if needed in your DB)
    conditions.push(eq(coaches.approved_or_denied, 2));

    // 🔍 Search filter
    if (search) {
      conditions.push(
        or(
          ilike(coaches.firstName, `%${search}%`),
          ilike(coaches.lastName, `%${search}%`),
          ilike(countries.name, `%${search}%`),
          ilike(coaches.gender, `%${search}%`),
          ilike(coaches.state, `%${search}%`),
          ilike(coaches.city, `%${search}%`),
          ilike(coaches.slug, `%${search}%`),
          ilike(coaches.status, `%${search}%`)
        )
      );
    }

    // 🏅 Crowned filter
    // 👉 If verified column is BOOLEAN use true/false
    if (crownedParam === "1") {
      conditions.push(eq(coaches.verified, 1)); // use true if boolean
    } else if (crownedParam === "0") {
      conditions.push(eq(coaches.verified, 0)); // use false if boolean
    }

    // 🏀 Sport filter
    if (sport !== 0) {
      conditions.push(eq(coaches.sport, sport));
    }

    // 🕒 Time filter
    if (timeFilterCondition) {
      conditions.push(timeFilterCondition);
    }

    const whereClause = and(...conditions);

    // ===============================
    // 📊 MAIN QUERY
    // ===============================
    const coachesData = await db
      .select({
        id: coaches.id,
        percentage: coaches.percentage,
        firstName: coaches.firstName,
        lastName: coaches.lastName,
        email: coaches.email,
        verified: coaches.verified,
        phoneNumber: coaches.phoneNumber,
        slug: coaches.slug,
        gender: coaches.gender,
        image: coaches.image,
        countryName: countries.name,
        state: coaches.state,
        city: coaches.city,
        sport: sports.name,
        qualifications: coaches.qualifications,
        status: coaches.status,
        suspend: coaches.suspend,
        createdAt: coaches.createdAt,
        updated_at: coaches.updated_at,
        suspend_days: coaches.suspend_days,
        approved_or_denied: coaches.approved_or_denied,
        is_deleted: coaches.is_deleted,

        consumeLicenseCount:
          sql<number>`COUNT(CASE WHEN ${licenses.status} = 'Consumed' THEN 1 END)`,

        assignedLicenseCount:
          sql<number>`COUNT(CASE WHEN ${licenses.status} = 'Assigned' THEN 1 END)`,

        earnings:
          sql<number>`COALESCE(SUM(${coachaccount.amount}),0)`,

        totalEvaluations:
          sql<number>`COUNT(CASE WHEN ${playerEvaluation.status} = 2 THEN ${playerEvaluation.id} END)`,
      })
      .from(coaches)
      .leftJoin(licenses, eq(licenses.assigned_to, coaches.id))
      .leftJoin(coachaccount, eq(coachaccount.coach_id, coaches.id))
      .leftJoin(playerEvaluation, eq(playerEvaluation.coach_id, coaches.id))
      .leftJoin(sports, eq(sports.id, coaches.sport))
      .leftJoin(
        countries,
        eq(countries.id, sql<number>`CAST(${coaches.country} AS INTEGER)`)
      )
      .where(whereClause)
      .groupBy(
        coaches.id,
        sports.name,
        countries.name
      )
      .orderBy(desc(coaches.createdAt))
      .limit(limit)
      .offset(offset);

    // ===============================
    // 🔢 TOTAL COUNT FOR PAGINATION
    // ===============================
    const totalCountResult = await db
      .select({ count: count() })
      .from(coaches)
      .leftJoin(
        countries,
        eq(countries.id, sql<number>`CAST(${coaches.country} AS INTEGER)`)
      )
      .where(whereClause);

    const totalCount = Number(totalCountResult[0]?.count || 0);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      coaches: coachesData,
      currentPage: page,
      totalPages,
      hasNextPage: page * limit < totalCount,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch coaches",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}