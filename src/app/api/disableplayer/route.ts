import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, countries } from '@/lib/schema';
import { eq, and, not, ilike, sql, count, or, gte, desc } from 'drizzle-orm';

type TimeRange = '24h' | '1w' | '1m' | '1y';

function getTimeFilterCondition(column: typeof users.createdAt, timeRange: TimeRange | string | null) {
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
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const country = searchParams.get('country') || '';
    const state = searchParams.get('state') || '';
    const city = searchParams.get('city') || '';
    const graduation = searchParams.get('graduation') || '';
    const birthyear = searchParams.get('birthyear') || '';
    const position = searchParams.get('position') || '';
    const timeRange = searchParams.get('timeRange') || '';

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;

    const conditions = [
      eq(users.status, 'Active'),
      eq(users.is_deleted, 0), // Only fetch users that are not suspended
      not(eq(users.first_name, '')),
      eq(users.visibility, 'on'),
    ];

    if (country) conditions.push(eq(users.country, country));
    if (state) conditions.push(eq(users.state, state));
    if (city) conditions.push(ilike(users.city, `%${city}%`));
    if (graduation) conditions.push(ilike(users.graduation, `%${graduation}%`));
    if (position) conditions.push(ilike(users.position, `%${position}%`));
    if (birthyear) conditions.push(sql`EXTRACT(YEAR FROM ${users.birthday}) = ${birthyear}`);

    const searchCondition = search
      ? or(
          ilike(users.first_name, `%${search}%`),
          ilike(users.last_name, `%${search}%`),
          ilike(users.last_name, `%${search}%`),          
          ilike(users.grade_level, `%${search}%`),          
          ilike(users.position, `%${search}%`),          
          ilike(users.state, `%${search}%`),          
          ilike(users.city, `%${search}%`),          
          ilike(users.league, `%${search}%`),          
          ilike(users.gender, `%${search}%`),          

          
        )
      : undefined;

    const timeCondition = getTimeFilterCondition(users.createdAt, timeRange);
    if (timeCondition) conditions.push(timeCondition);
    if (searchCondition) conditions.push(searchCondition);

    const whereClause = and(...conditions);

    const result = await db
      .select({
        id: users.id,
        first_name: users.first_name,
        last_name: users.last_name,
        image: users.image,
        position: users.position,
        grade_level: users.grade_level,
        location: users.location,
        height: users.height,
        jersey: users.jersey,
        weight: users.weight,
        birthday: users.birthday,
        graduation: users.graduation,
        suspend: users.suspend,
        suspend_days: users.suspend_days,
        birth_year: users.birth_year,
        age_group: users.age_group,
        status: users.status,
        countryName: countries.name,
        state: users.state,
        league: users.league,
        city: users.city,
        gender: users.gender,
        createdAt: users.createdAt,
        is_deleted: users.is_deleted,
        coachName: sql`coa."firstName"`.as("coachName"),
        coachLastName: sql`coa."lastName"`.as("coachLastName"),
        enterpriseName: sql`ent."organizationName"`.as("enterpriseName"),
      })
      .from(users)
      .leftJoin(sql`enterprises AS ent`, sql`NULLIF(${users.enterprise_id}, '')::integer = ent.id`)
      .leftJoin(sql`coaches AS coa`, sql`NULLIF(${users.coach_id}, '')::integer = coa.id`)
      .leftJoin(countries, sql`${users.country}::int = ${countries.id}`)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select({ count: count() })
      .from(users)
      .leftJoin(countries, eq(countries.id, sql<number>`CAST(${users.country} AS INTEGER)`))
      .where(whereClause)
      .then((res) => res[0]?.count || 0);

    return NextResponse.json({
      coaches: result,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page * limit < totalCount,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error('Error fetching player:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch player',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
