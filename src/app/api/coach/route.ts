import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  coaches,
  licenses,
  coachaccount,
  countries,
  playerEvaluation,
} from "@/lib/schema";
import {
  eq,
  ilike,
  or,
  and,
  isNotNull,
  ne,
  count,
  desc,
  sql,
  gte,
} from "drizzle-orm";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const search = url.searchParams.get("search")?.trim() || "";
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const offset = (page - 1) * limit;
  const timeRange = url.searchParams.get("timeRange") || "";
  const sport = parseInt(url.searchParams.get("sport") || "0", 0)


  // 🕒 time filter
  const now = new Date();
  let timeFilterCondition;
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
    default:
      break;
  }

  try {
    // 🛠️ base filters
    const baseCondition = and(
      isNotNull(coaches.firstName),
      ne(coaches.firstName, ""),
      eq(coaches.suspend, 1),
      eq(coaches.is_deleted, 1),
      eq(coaches.approved_or_denied, 1) // ✅ NEW condition
    );

    const sportCondition = sport !== 0 ? eq(coaches.sport, sport) : undefined;

    // 🔍 search filters
    const searchCondition = search
      ? or(
          ilike(coaches.firstName, `%${search}%`),
          ilike(coaches.lastName, `%${search}%`),
          ilike(countries.name, `%${search}%`),
          ilike(coaches.gender, `%${search}%`),
          ilike(coaches.state, `%${search}%`),
          ilike(coaches.city, `%${search}%`),
          ilike(coaches.slug, `%${search}%`),
          ilike(coaches.status, `%${search}%`)
        )
      : undefined;

    // 📌 final where clause
    const whereClause = and(
      baseCondition,
      ...(searchCondition ? [searchCondition] : []),
      ...(timeFilterCondition ? [timeFilterCondition] : []),
      sportCondition,
    );

    // 📊 main query with aggregations
    const coachesData = await db
      .select({
        id: coaches.id,
        firstName: coaches.firstName,
        lastName: coaches.lastName,
        email: coaches.email,
        phoneNumber: coaches.phoneNumber,
        slug: coaches.slug,
        gender: coaches.gender,
        image: coaches.image,
        countryName: countries.name,
        state: coaches.state,
        city: coaches.city,
        sport: coaches.sport,
        qualifications: coaches.qualifications,
        status: coaches.status,
        suspend: coaches.suspend,
        suspend_days: coaches.suspend_days,
        approved_or_denied: coaches.approved_or_denied,
        is_deleted: coaches.is_deleted,
        consumeLicenseCount: sql<number>`COUNT(CASE WHEN ${licenses.status} = 'Consumed' THEN 1 END)`,
        assignedLicenseCount: sql<number>`COUNT(CASE WHEN ${licenses.status} = 'Assigned' THEN 1 END)`,
        earnings: sql<number>`SUM(CASE WHEN ${coachaccount.coach_id} = ${coaches.id} THEN ${coachaccount.amount} ELSE 0 END)`,
        totalEvaluations: sql<number>`COUNT(CASE WHEN ${playerEvaluation.status} = 2 THEN ${playerEvaluation.id} END)`,
      })
      .from(coaches)
      .leftJoin(licenses, eq(licenses.assigned_to, coaches.id))
      .leftJoin(coachaccount, eq(coachaccount.coach_id, coaches.id))
      .leftJoin(playerEvaluation, eq(playerEvaluation.coach_id, coaches.id))
      .leftJoin(
        countries,
        eq(countries.id, sql<number>`CAST(${coaches.country} AS INTEGER)`)
      )
      .where(whereClause)
      .groupBy(
        coaches.id,
        coaches.firstName,
        coaches.lastName,
        coaches.email,
        coaches.phoneNumber,
        coaches.slug,
        coaches.gender,
        coaches.image,
        coaches.sport,
        coaches.qualifications,
        coaches.status,
        coaches.suspend,
        coaches.suspend_days,
        coaches.is_deleted,
        countries.name,
        coaches.state,
        coaches.city,
        coaches.approved_or_denied
      )
      .orderBy(desc(coaches.createdAt))
      .limit(limit)
      .offset(offset);

    // 🔢 total count (for pagination)
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
      hasNextPage: page < totalPages,
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


export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const coachId = url.searchParams.get("id");

    if (!coachId) {
      return NextResponse.json(
        { message: "Coach ID is required" },
        { status: 400 }
      );
    }

    const coachIdNumber = Number(coachId);
    if (isNaN(coachIdNumber)) {
      return NextResponse.json(
        { message: "Invalid Coach ID" },
        { status: 400 }
      );
    }

    await db.delete(coaches).where(eq(coaches.id, coachIdNumber));

    return NextResponse.json({ message: "Coach deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to delete coach",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { coachId, newStatus } = await req.json();

    if (!coachId || !newStatus) {
      return NextResponse.json(
        { message: "Coach ID and new status are required" },
        { status: 400 }
      );
    }

    if (newStatus !== "Active" && newStatus !== "Inactive") {
      return NextResponse.json(
        {
          message: "Invalid status. Only Active or Inactive are allowed.",
        },
        { status: 400 }
      );
    }

    await db
      .update(coaches)
      .set({ status: newStatus })
      .where(eq(coaches.id, coachId));

    return NextResponse.json({ message: "Status updated successfully" });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to update status",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}