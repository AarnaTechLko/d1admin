import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq, and, not, ilike, sql, count, or } from 'drizzle-orm';

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
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;

    const conditions = [
      eq(users.status, 'Active'),
      not(eq(users.first_name, '')),
      eq(users.visibility, 'on')
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
          ilike(users.email, `%${search}%`),
          ilike(users.sport, `%${search}%`),
          ilike(users.status, `%${search}%`)
        )
      : undefined;

    const whereClause = searchCondition ? and(...conditions, searchCondition) : and(...conditions);

    const query = db
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
        birth_year: users.birth_year,
        age_group: users.age_group,
        status: users.status,
        is_deleted:users.is_deleted,
        coachName: sql`coa."firstName"`.as("coachName"),
        coachLastName: sql`coa."lastName"`.as("coachLastName"),
        enterpriseName: sql`ent."organizationName"`.as("enterpriseName")
      })
      .from(users)
      .leftJoin(sql`enterprises AS ent`, sql`NULLIF(${users.enterprise_id}, '')::integer = ent.id`)
      .leftJoin(sql`coaches AS coa`, sql`NULLIF(${users.coach_id}, '')::integer = coa.id`)
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    const result = await query.execute();

    const totalCount = await db
      .select({ count: count() })
      .from(users)
      .where(whereClause)
      .then((res) => res[0]?.count || 0);

    return NextResponse.json({
      coaches: result,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page * limit < totalCount,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error("Error fetching player:", error);
    return NextResponse.json({
      message: "Failed to fetch player",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
