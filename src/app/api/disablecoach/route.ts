import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  coaches,
  licenses,
  coachaccount,
  countries,
  playerEvaluation
} from '@/lib/schema';
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
  gte
} from 'drizzle-orm';

// ================= GET ===================
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const search = url.searchParams.get('search')?.trim() || '';
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);
  const offset = (page - 1) * limit;
  const timeRange = url.searchParams.get('timeRange') || '';

  const now = new Date();
  let timeFilterCondition;

  switch (timeRange) {
    case '24h':
      timeFilterCondition = gte(coaches.createdAt, new Date(now.getTime() - 24 * 60 * 60 * 1000));
      break;
    case '1w':
      timeFilterCondition = gte(coaches.createdAt, new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
      break;
    case '1m':
      timeFilterCondition = gte(coaches.createdAt, new Date(now.setMonth(now.getMonth() - 1)));
      break;
    case '1y':
      timeFilterCondition = gte(coaches.createdAt, new Date(now.setFullYear(now.getFullYear() - 1)));
      break;
    default:
      break;
  }

  try {
    const baseCondition = and(
      isNotNull(coaches.firstName),
      ne(coaches.firstName, ''),
      eq(coaches.is_deleted, 0) // ✅ Only suspended coaches
    );

    const searchCondition = search
      ? or(
          ilike(coaches.firstName, `%${search}%`),
          ilike(coaches.lastName, `%${search}%`),
          ilike(coaches.email, `%${search}%`),
          ilike(coaches.phoneNumber, `%${search}%`),
          ilike(coaches.sport, `%${search}%`),
          ilike(coaches.status, `%${search}%`),
          ilike(countries.name, `%${search}%`),
          ilike(coaches.state, `%${search}%`),
          ilike(coaches.city, `%${search}%`),
          ilike(coaches.gender, `%${search}%`)
        )
      : undefined;

    const whereClause = and(
      baseCondition,
      ...(searchCondition ? [searchCondition] : []),
      ...(timeFilterCondition ? [timeFilterCondition] : [])
    );

    const coachesData = await db
      .select({
        firstName: coaches.firstName,
        lastName: coaches.lastName,
        gender: coaches.gender,
        image: coaches.image,
        id: coaches.id,
        email: coaches.email,
        phoneNumber: coaches.phoneNumber,
        slug: coaches.slug,
        countryName: countries.name,
        state: coaches.state,
        city: coaches.city,
        sport: coaches.sport,
        qualifications: coaches.qualifications,
        suspend: coaches.suspend,
        createdAt: coaches.createdAt,
        suspend_days: coaches.suspend_days,
        status: coaches.status,
        is_deleted: coaches.is_deleted,
        consumeLicenseCount: sql<number>`COUNT(CASE WHEN licenses.status = 'Consumed' THEN 1 END)`,
        assignedLicenseCount: sql<number>`COUNT(CASE WHEN licenses.status = 'Assigned' THEN 1 END)`,
        earnings: sql<number>`SUM(CASE WHEN coachaccount.coach_id = coaches.id THEN coachaccount.amount ELSE 0 END)`,
        totalEvaluations: sql<number>`COUNT(CASE WHEN player_evaluation.status = 2 THEN player_evaluation.id END)`
      })
      .from(coaches)
      .leftJoin(licenses, sql`${licenses.assigned_to} = ${coaches.id}`)
      .leftJoin(coachaccount, sql`${coachaccount.coach_id} = ${coaches.id}`)
      .leftJoin(playerEvaluation, sql`${playerEvaluation.coach_id} = ${coaches.id}`)
      .leftJoin(countries, eq(countries.id, sql<number>`CAST(${coaches.country} AS INTEGER)`))
      .where(whereClause)
      .groupBy(
        coaches.id,
        coaches.firstName,
        coaches.lastName,
        coaches.gender,
        coaches.image,
        coaches.email,
        coaches.phoneNumber,
        coaches.slug,
        coaches.sport,
        coaches.qualifications,
        coaches.status,
        coaches.createdAt,
        coaches.suspend,
        coaches.suspend_days,
        coaches.is_deleted,
        countries.name,
        coaches.state,
        coaches.city
      )
      .orderBy(desc(coaches.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCountResult = await db
      .select({ count: count() })
      .from(coaches)
      .leftJoin(countries, eq(countries.id, sql<number>`CAST(${coaches.country} AS INTEGER)`))
      .where(whereClause);

    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      coaches: coachesData,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Failed to fetch coaches',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
