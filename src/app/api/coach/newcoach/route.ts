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
import { coaches } from "@/lib/schema";
import { eq, ilike, and, or } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { search, page, limit } = Object.fromEntries(
      req.nextUrl.searchParams
    ) as { search?: string; page?: string; limit?: string };

    const pageNum = parseInt(page || "1", 10);
    const pageLimit = parseInt(limit || "10", 10);
    const offset = (pageNum - 1) * pageLimit;

    // Inline condition: search or not
    const condition = search?.trim()
      ? and(
          eq(coaches.approved_or_denied, 0),
          or(
            ilike(coaches.firstName, `%${search}%`),
            ilike(coaches.lastName, `%${search}%`),
            ilike(coaches.email, `%${search}%`)
          )
        )
      : eq(coaches.approved_or_denied, 0);

    // Fetch total count for pagination
    const totalCoaches = await db
      .select()
      .from(coaches)
      .where(condition);

    const totalPages = Math.ceil(totalCoaches.length / pageLimit);

    // Fetch paginated data
    const paginatedCoaches = await db
      .select()
      .from(coaches)
      .where(condition)
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
