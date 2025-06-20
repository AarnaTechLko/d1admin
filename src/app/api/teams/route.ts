import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teams, enterprises, coaches, users } from "@/lib/schema";
import { eq, ilike, or, count, desc, and, gte } from "drizzle-orm";

type TimeRange = '24h' | '1w' | '1m' | '1y';
function getTimeFilterCondition(column: typeof teams.createdAt, timeRange: TimeRange | string | null) {
  if (!timeRange) return undefined;
  const now = new Date();
  switch (timeRange) {
    case '24h':
      return gte(column, new Date(now.getTime() - 24 * 60 * 60 * 1000));
    case '1w':
      return gte(column, new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
    case '1m':
      return gte(column, new Date(new Date().setMonth(now.getMonth() - 1)));
    case '1y':
      return gte(column, new Date(new Date().setFullYear(now.getFullYear() - 1)));
    default:
      return undefined;
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const search = url.searchParams.get("search")?.trim() || "";
  const timeRange = url.searchParams.get("timeRange") || ""; // e.g. '24h', '1w', '1m', '1y'
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const offset = (page - 1) * limit;

  try {
    const conditions = [];

    // Search filter
    if (search) {
      conditions.push(
        or(
          ilike(teams.team_name, `%${search}%`),
          ilike(teams.team_type, `%${search}%`),
          ilike(teams.status, `%${search}%`),
          ilike(teams.manager_name, `%${search}%`),
          ilike(teams.country, `%${search}%`),
          ilike(teams.city, `%${search}%`)
        )
      );
    }

    // Time range filter
    const timeCondition = getTimeFilterCondition(teams.createdAt, timeRange);
    if (timeCondition) {
      conditions.push(timeCondition);
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    // Main data query
    const teamsData = await db
      .select({
        id: teams.id,
        team_name: teams.team_name,
        logo: teams.logo,
        created_by: teams.created_by,
        team_type: teams.team_type,
        team_year: teams.team_year,
        status: teams.status,
        manager_name: teams.manager_name,
        country: teams.country,
        city: teams.city,
        organisation_name: enterprises.organizationName,
        club_id: teams.club_id,
        is_deleted: teams.is_deleted,
      })
      .from(teams)
      .leftJoin(enterprises, eq(teams.club_id, enterprises.id))
      .where(whereClause)
      .orderBy(desc(teams.createdAt))
      .offset(offset)
      .limit(limit);

    // Add counts per team
    const teamsWithCounts = await Promise.all(
      teamsData.map(async (team) => {
        const [totalCoaches, totalPlayers] = await Promise.all([
          db
            .select({ count: count() })
            .from(coaches)
            .where(eq(coaches.enterprise_id, String(team.club_id)))
            .then((res) => res[0]?.count || 0),
          db
            .select({ count: count() })
            .from(users)
            .where(eq(users.enterprise_id, String(team.club_id)))
            .then((res) => res[0]?.count || 0),
        ]);
        return { ...team, totalCoaches, totalPlayers };
      })
    );

    const totalCount = await db
      .select({ count: count() })
      .from(teams)
      .where(whereClause)
      .then((res) => res[0]?.count || 0);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      teams: teamsWithCounts,
      currentPage: page,
      totalPages,
      totalCount,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch teams", error: String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST API: Fetches total coaches and total players for a given enterprise
 */
export async function POST(req: NextRequest) {
  try {
    const { enterprise_id } = await req.json();

    // Fetch Total Coaches
    const totalCoaches = await db
      .select({ count: count() })
      .from(coaches)
      .where(eq(coaches.enterprise_id, enterprise_id))
      .then((result) => result[0]?.count || 0);

    // Fetch Total Players
    const totalPlayers = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.enterprise_id, enterprise_id))
      .then((result) => result[0]?.count || 0);

    return NextResponse.json({ totalCoaches, totalPlayers }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch data", error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const teamId = url.searchParams.get("id");

    if (!teamId) {
      return NextResponse.json({ message: "Team ID is required" }, { status: 400 });
    }

    const teamIdNumber = Number(teamId);
    if (isNaN(teamIdNumber)) {
      return NextResponse.json({ message: "Invalid Team ID" }, { status: 400 });
    }

    // Delete the coach by ID
    await db.delete(teams).where(eq(teams.id, teamIdNumber));

    return NextResponse.json({ message: "Teams deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete team", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}





export async function PUT(req: NextRequest) {
  try {
    const { teamId, newStatus } = await req.json();

    if (!teamId || !newStatus) {
      return NextResponse.json({ message: "Team ID and new status are required" }, { status: 400 });
    }

    if (newStatus !== "Active" && newStatus !== "Inactive") {
      return NextResponse.json({ message: "Invalid status. Only Active or Inactive are allowed." }, { status: 400 });
    }

    // Update Team's status
    await db
      .update(teams)
      .set({ status: newStatus })
      .where(eq(teams.id, teamId));

    return NextResponse.json({ message: "Status updated successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update status", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}