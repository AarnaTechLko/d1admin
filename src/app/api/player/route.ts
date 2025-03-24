import { NextRequest, NextResponse } from 'next/server';
// import { hash } from 'bcryptjs';
import { db } from '@/lib/db';
import {  users } from '@/lib/schema';
// import debug from 'debug';
// import jwt from 'jsonwebtoken';
// import { SECRET_KEY } from '@/lib/constants';
import { eq, and, not, ilike, sql,count,or } from 'drizzle-orm';
// import { sendEmail } from '@/lib/helpers';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get('country') || ''; // Keep the search as a string
  const state = searchParams.get('state') || '';
  const city = searchParams.get('city') || '';
  const graduation = searchParams.get('graduation') || '';
  const birthyear = searchParams.get('birthyear') || '';
  const position = searchParams.get('position') || '';
  //const url = new URL(req.url);
  const search = searchParams.get('search')?.trim() || '';  
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);


  try {
    const conditions = [and(
      eq(users.status, 'Active'),
      not(eq(users.first_name, '')),
      eq(users.visibility, 'on')
    )];

   /// conditions.push(isNull(users.parent_id));


    if (country) {
      conditions.push(eq(users.country, country));
    }
    if (state) {
      conditions.push(eq(users.state, state));
    }
    if (city) {
      conditions.push(ilike(users.city, city));
    }
    if (graduation) {
      conditions.push(ilike(users.graduation, graduation));
    }
    if (position && Array.isArray(position) && position.length > 0) {
      const positionConditions = position.map(pos => ilike(users.position, pos));
      conditions.push(...positionConditions);
    } else if (position) {
      conditions.push(ilike(users.position, position));
    }

    if (birthyear) {
      conditions.push(
        sql`EXTRACT(YEAR FROM ${users.birthday}) = ${birthyear}`
      );
    }


 const whereClause = search
      ? or(
          ilike(users.first_name, `%${search}%`),
          ilike(users.last_name, `%${search}%`),
          ilike(users.email, `%${search}%`),
          // ilike(users.phoneNumber, `%${search}%`),
          ilike(users.sport, `%${search}%`),  // Allow searching by sport
          ilike(users.status, `%${search}%`)  // Allow searching by status
        )
      : undefined;

    const query = db
      .select({
        first_name: users.first_name,
        last_name: users.last_name,
        slug: users.slug,
        id: users.id,
        image: users.image,
        position: users.position,
        grade_level: users.grade_level,
        location: users.location,
        height: users.height,
        jersey: users.jersey,
        weight: users.weight,
        birthday: users.birthday,
        graduation: users.graduation,
        facebook: users.facebook,
        instagram: users.instagram,
        linkedin: users.linkedin,
        birth_year: users.birth_year,
        age_group: users.age_group,
        xlink: users.xlink,
        youtube: users.youtube,
        coachName: sql`coa."firstName"`.as("coachName"),
        coachLastName: sql`coa."lastName"`.as("coachLastName"),
        enterpriseName: sql`ent."organizationName"`.as("enterpriseName"),
      })
      .from(users)
      .leftJoin(
        sql`enterprises AS ent`, // Alias defined here
        sql`NULLIF(${users.enterprise_id}, '')::integer = ent.id`
      )
      .leftJoin(
        sql`coaches AS coa`, // Alias defined here
        sql`NULLIF(${users.coach_id}, '')::integer = coa.id`
      )
      .where(whereClause)
      // .where(and(...conditions)).orderBy(desc(users.id));

    const result = await query.execute();


    // const formattedCoachList = result.map(coach => ({
    //   coachName: `${coach.coachName} ${coach.coachLastName}`,
    //   enterpriseName: coach.enterpriseName,
    //   firstName: users.first_name,
    //   lastName: users.last_name,
    //   slug: users.slug,
    //   id: users.id,
    //   image: users.image,
    //   position: users.position,
    //   jersey: users.jersey,
    //   grade_level: users.grade_level,
    //   location: users.location,
    //   height: users.height,
    //   weight: users.weight,
    //   graduation: users.graduation,
    //   birthday: users.birthday,
    //   facebook: coach.facebook,
    //   instagram: coach.instagram,
    //   linkedin: coach.linkedin,
    //   xlink: coach.xlink,
    //   youtube: coach.youtube,
    //   birth_year: coach.birth_year,
    //   age_group: coach.age_group,
    // }));
    // Return the coach list as a JSON response
    // return NextResponse.json(formattedCoachList);
    const totalCount = await db
          .select({ count: count() })
          .from(users)
          .where(whereClause)
          .then((result) => result[0]?.count || 0);
    const totalPages = Math.ceil(totalCount / limit);
    return NextResponse.json({
      coaches: result,
      currentPage: page,
      totalPages: totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });

  } catch (error) {
    if (error instanceof Error) {
        console.error("Database Query Error:", error);

        return NextResponse.json(
            { message: "Failed to fetch coaches", error: error.message, stack: error.stack },
            { status: 500 }
        );
    }

    // Handle unknown errors (non-Error objects)
    console.error("Unknown Error:", error);
    return NextResponse.json(
        { message: "Failed to fetch coaches", error: "Unknown error occurred" },
        { status: 500 }
    );
}
}