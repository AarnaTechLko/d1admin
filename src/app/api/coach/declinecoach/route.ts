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
import { coaches, sports, coachaccount } from "@/lib/schema";
import { eq, ilike, and, or, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // const { search, page, limit } = Object.fromEntries(
    //   req.nextUrl.searchParams
    // ) as { search?: string; page?: string; limit?: string };

    // const pageNum = parseInt(page || "1", 10);
    // const pageLimit = parseInt(limit || "10", 10);
    // const offset = (pageNum - 1) * pageLimit;
    // const crowned = req.nextUrl.searchParams.get("crowned");
    // const sportParam = req.nextUrl.searchParams.get("sport");

    // const sport = sportParam ? Number(sportParam) : 0

    const search = req.nextUrl.searchParams.get("search") || "";
    const page = Number(req.nextUrl.searchParams.get("page") || 1);
    const limit = Number(req.nextUrl.searchParams.get("limit") || 10);
    const crowned = req.nextUrl.searchParams.get("crowned");
    const sportParam = req.nextUrl.searchParams.get("sport");

    const sport = sportParam ? Number(sportParam) : 0;
    const offset = (page - 1) * limit;

    // Inline condition: search or not
    const conditions = [];

    // Declined coaches only
    conditions.push(eq(coaches.approved_or_denied, 2));

    // Search filter
    if (search.trim()) {
      conditions.push(
        or(
          ilike(coaches.firstName, `%${search}%`),
          ilike(coaches.lastName, `%${search}%`),
          ilike(coaches.email, `%${search}%`)
        )
      );
    }

    // Crowned filter
    if (crowned === "1") {
      conditions.push(eq(coaches.verified, 1));
    } else if (crowned === "0") {
      conditions.push(eq(coaches.verified, 0));
    }

    // Sport filter (safe)
    if (!Number.isNaN(sport) && sport !== 0) {
      conditions.push(eq(coaches.sport, sport));
    }

    const whereCondition = and(...conditions);

    // Fetch total count for pagination
    const totalResult = await db
      .select({ count: sql<number>`COUNT(${coaches.id})` })
      .from(coaches)
      .where(whereCondition);

    const totalCount = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Fetch paginated data
    const paginatedCoaches = await db
      .select({
        id: coaches.id,
        image: coaches.image,
        firstName: coaches.firstName,
        lastName: coaches.lastName,
        email: coaches.email,
        verified: coaches.verified,
        gender: coaches.gender,
        updated_at: coaches.updated_at,
        status: coaches.status,
        state: coaches.state,
        city: coaches.city,
        sport: sports.name,
      })
      .from(coaches)
      .leftJoin(sports, eq(sports.id, coaches.sport))
      .leftJoin(coachaccount, eq(coachaccount.coach_id, coaches.id))

      .where(whereCondition)
      .limit(limit)
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
