import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teams } from '@/lib/schema';
import { enterprises } from '@/lib/schema'; // Assuming you have a schema for enterprises
import { eq, ilike, or, count, desc, sql } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const search = url.searchParams.get('search')?.trim() || '';
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);

  try {
    const offset = (page - 1) * limit;

    // WHERE clause to filter search fields
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

    // Use a LEFT JOIN to get the organization name from enterprises table
    const teamsData = await db
      .select({
        id: teams.id,
        team_name: teams.team_name,
        logo: teams.logo,
        created_by: teams.created_by,
        team_type: teams.team_type,
        team_year: teams.team_year,
        coach_id: teams.coach_id,
        club_id: teams.club_id,
        status: teams.status,
        manager_name: teams.manager_name,
        country: teams.country,
        city: teams.city,
        rating: teams.rating,
        leage: teams.leage,
        organisation_name: enterprises.organizationName // Fetch organisationName from enterprises
      })
      .from(teams)
      .leftJoin(enterprises, eq(teams.club_id, enterprises.id)) // Left join with enterprises based on club_id
      .where(whereClause)
      .orderBy(desc(teams.createdAt))
      .offset(offset)
      .limit(limit);

    const totalCount = await db
      .select({ count: count() })
      .from(teams)
      .where(whereClause)
      .then((result) => result[0]?.count || 0);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      teams: teamsData,
      currentPage: page,
      totalPages: totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Failed to fetch teams',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}


