import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teams, enterprises, coaches, users } from "@/lib/schema"; // Ensure correct imports
import { eq, ilike, or, count, desc } from "drizzle-orm";



export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const search = url.searchParams.get("search")?.trim() || "";
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const offset = (page - 1) * limit;

  try {
    const whereClause = search
      ? or(
          ilike(teams.team_name, `%${search}%`),
          ilike(teams.team_type, `%${search}%`),
          ilike(teams.status, `%${search}%`),
          ilike(teams.manager_name, `%${search}%`),
          ilike(teams.country, `%${search}%`),
          ilike(teams.city, `%${search}%`)
        )
      : undefined;

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
      })
      .from(teams)
      .leftJoin(enterprises, eq(teams.club_id, enterprises.id))
      .where(whereClause)
      .orderBy(desc(teams.createdAt))
      .offset(offset)
      .limit(limit);

    const teamsWithCounts = await Promise.all(
      teamsData.map(async (team) => {
        const totalCoaches = await db
          .select({ count: count() })
          .from(coaches)
          .where(eq(coaches.enterprise_id, String(team.club_id)))
          .then((result) => result[0]?.count || 0);

        const totalPlayers = await db
          .select({ count: count() })
          .from(users)
          .where(eq(users.enterprise_id, String(team.club_id)))
          .then((result) => result[0]?.count || 0);

        return { ...team, totalCoaches, totalPlayers };
      })
    );

    const totalCount = await db
      .select({ count: count() })
      .from(teams)
      .where(whereClause)
      .then((result) => result[0]?.count || 0);

    return NextResponse.json({
      teams: teamsWithCounts,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page < Math.ceil(totalCount / limit),
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
