import { NextRequest, NextResponse } from 'next/server';
// import { hash } from 'bcryptjs';
import { db } from '@/lib/db';
import { users, countries} from '@/lib/schema';
// import debug from 'debug';
// import jwt from 'jsonwebtoken';
// import { SECRET_KEY } from '@/lib/constants';
import {
  eq,
  ilike,
  or,
  and,
  count,
  desc,
  sql
} from 'drizzle-orm';
// import { sendEmail } from '@/lib/helpers';
 


export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const search = url.searchParams.get('search')?.trim() || '';
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);
  const offset = (page - 1) * limit;
  // const timeRange = url.searchParams.get('timeRange') || '';

  // const now = new Date();
//   let timeFilterCondition;
//   switch (timeRange) {
//     case '24h':
//       timeFilterCondition = gte(users.createdAt, new Date(now.getTime() - 24 * 60 * 60 * 1000));
//       break;
//     case '1w':
//       timeFilterCondition = gte(users.createdAt, new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
//       break;
//     case '1m':
//       timeFilterCondition = gte(users.createdAt, new Date(now.setMonth(now.getMonth() - 1)));
//       break;
//     case '1y':
//       timeFilterCondition = gte(users.createdAt, new Date(now.setFullYear(now.getFullYear() - 1)));
//       break;
//     default:
//       break;
//   }

  try {
    const baseCondition = eq(users.isCompletedProfile, false);

    const searchCondition = search
      ? or(

          ilike(users.email, `%${search}%`),
        )
      : undefined;

    const whereClause = and(
      baseCondition,
      ...(searchCondition ? [searchCondition] : []),
    //   ...(timeFilterCondition ? [timeFilterCondition] : [])
    );

    const coachesData = await db
      .select({
        id: users.id,
        email: users.email,
      })
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    console.log("DATA: ", coachesData);

    const totalCountResult = await db
      .select({ count: count() })
      .from(users)
      .leftJoin(countries, eq(countries.id, sql<number>`CAST(${users.country} AS INTEGER)`))
      .where(whereClause);

    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      users: coachesData,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Failed to fetch users',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
