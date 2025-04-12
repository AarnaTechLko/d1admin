import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  coaches, licenses, coachaccount, playerEvaluation,
  coachearnings, payments, evaluationResults
} from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const coachId = parseInt((await params).id, 10);

  if (isNaN(coachId)) {
    return NextResponse.json({ message: 'Invalid coach ID' }, { status: 400 });
  }

  try {
    // Get coach basic info with aggregate data
    const coachData = await db
      .select({
        id: coaches.id,
        firstName: coaches.firstName,
        lastName: coaches.lastName,
        gender: coaches.gender,
        image: coaches.image,
        email: coaches.email,
        phoneNumber: coaches.phoneNumber,
        slug: coaches.slug,
        sport: coaches.sport,
        qualifications: coaches.qualifications,
        status: coaches.status,
        consumeLicenseCount: sql<number>`COALESCE(COUNT(CASE WHEN licenses.status = 'Consumed' THEN 1 END), 0)`,
        assignedLicenseCount: sql<number>`COALESCE(COUNT(CASE WHEN licenses.status = 'Assigned' THEN 1 END), 0)`,
        earnings: sql<number>`COALESCE(SUM(coachaccount.amount), 0)`,
      })
      .from(coaches)
      .leftJoin(licenses, sql`${licenses.assigned_to} = ${coaches.id}`)
      .leftJoin(coachaccount, sql`${coachaccount.coach_id} = ${coaches.id}`)
      .where(eq(coaches.id, coachId))
      .groupBy(
        coaches.id, coaches.firstName, coaches.lastName, coaches.gender,
        coaches.image, coaches.email, coaches.phoneNumber, coaches.slug,
        coaches.sport, coaches.qualifications, coaches.status
      )
      .limit(1);

    if (!coachData.length) {
      return NextResponse.json({ message: 'Coach not found' }, { status: 404 });
    }

    const [evaluations, results, earnings, coachPayments] = await Promise.all([
      db.select().from(playerEvaluation).where(eq(playerEvaluation.coach_id, coachId)),
      db.select().from(evaluationResults).where(eq(evaluationResults.coachId, coachId)),
      db.select().from(coachearnings).where(eq(coachearnings.coach_id, coachId)),
      db.select().from(payments).where(eq(payments.coach_id, coachId)),
    ]);

    return NextResponse.json({
      ...coachData[0],
      evaluations,
      evaluationResults: results,
      earningsDetails: earnings,
      payments: coachPayments,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Failed to fetch coach data',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
