import { NextRequest, NextResponse } from 'next/server';
// import { hash } from 'bcryptjs';
import { db } from '@/lib/db';
import { coaches, licenses, coachaccount, playerEvaluation } from '@/lib/schema';
// import debug from 'debug';
// import jwt from 'jsonwebtoken';
// import { SECRET_KEY } from '@/lib/constants';
import {
  eq,
  ilike,
  or,
  and,
  isNotNull,
  ne,
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
  
  try {
    // Ensure firstName is not null and not an empty string
    const baseCondition = and(
      isNotNull(coaches.firstName),
      ne(coaches.firstName, '')
    );

    // Search clause combined with base condition
    const whereClause = search
      ? and(
          baseCondition,
          or(
            ilike(coaches.firstName, `%${search}%`),
            ilike(coaches.lastName, `%${search}%`),
            ilike(coaches.email, `%${search}%`),
            ilike(coaches.phoneNumber, `%${search}%`),
            ilike(coaches.sport, `%${search}%`),
            ilike(coaches.status, `%${search}%`)
          )
        )
      : baseCondition;

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
        sport: coaches.sport,
        qualifications: coaches.qualifications,
        status: coaches.status,
        is_deleted:coaches.is_deleted,
        consumeLicenseCount: sql<number>`COUNT(CASE WHEN licenses.status = 'Consumed' THEN 1 END)`,
        assignedLicenseCount: sql<number>`COUNT(CASE WHEN licenses.status = 'Assigned' THEN 1 END)`,
        earnings: sql<number>`SUM(CASE WHEN coachaccount.coach_id = coaches.id THEN coachaccount.amount ELSE 0 END)`,
        totalEvaluations: sql<number>`COUNT(CASE WHEN player_evaluation.status = 2 THEN player_evaluation.id END)`
      })
      .from(coaches)
      .leftJoin(licenses, sql`${licenses.assigned_to} = ${coaches.id}`)
      .leftJoin(coachaccount, sql`${coachaccount.coach_id} = ${coaches.id}`)
      .leftJoin(playerEvaluation, sql`${playerEvaluation.coach_id} = ${coaches.id}`)
      .where(whereClause)
      .groupBy(
        coaches.id, coaches.firstName, coaches.lastName, coaches.gender, coaches.image,
        coaches.email, coaches.phoneNumber, coaches.slug, coaches.sport,
        coaches.qualifications, coaches.status
      )
      .orderBy(desc(coaches.createdAt))
     

    const totalCount = await db
      .select({ count: count() })
      .from(coaches)
      .where(whereClause)
      .then((result) => result[0]?.count || 0);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      coaches: coachesData,
      currentPage: page,
      totalPages: totalPages,
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

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const coachId = url.searchParams.get("id");

    if (!coachId) {
      return NextResponse.json({ message: "Coach ID is required" }, { status: 400 });
    }

    const coachIdNumber = Number(coachId);
    if (isNaN(coachIdNumber)) {
      return NextResponse.json({ message: "Invalid Coach ID" }, { status: 400 });
    }

    // Delete the coach by ID
    await db.delete(coaches).where(eq(coaches.id, coachIdNumber));

    return NextResponse.json({ message: "Coach deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete coach", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { coachId, newStatus } = await req.json();

    if (!coachId || !newStatus) {
      return NextResponse.json({ message: "Coach ID and new status are required" }, { status: 400 });
    }

    if (newStatus !== "Active" && newStatus !== "Inactive") {
      return NextResponse.json({ message: "Invalid status. Only Active or Inactive are allowed." }, { status: 400 });
    }

    // Update coach's status
    await db
      .update(coaches)
      .set({ status: newStatus })
      .where(eq(coaches.id, coachId));

    return NextResponse.json({ message: "Status updated successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update status", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}


