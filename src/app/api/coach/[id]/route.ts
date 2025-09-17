
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  coaches,
  licenses,
  coachaccount,
  playerEvaluation,
  coachearnings,
  payments,
  evaluationResults,
  users,
  countries,
  ip_logs,
  review,
} from '@/lib/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const coachId = parseInt((await params).id, 10);

  if (isNaN(coachId)) {
    return NextResponse.json({ message: 'Invalid coach ID' }, { status: 400 });
  }
  console.log("coach data:",coachId);
  try {
    // Fetch coach basic info with aggregates
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
        approved_or_denied: coaches.approved_or_denied,
        qualifications: coaches.qualifications,
        status: coaches.status,
        country: coaches.country,
        state: coaches.state,
        city: coaches.city,
        clubName: coaches.clubName,
        facebook: coaches.facebook,
        instagram: coaches.instagram,
        linkedin: coaches.linkedin,
        xlink: coaches.xlink,
        youtube: coaches.youtube,
        license: coaches.license,
        cv: coaches.cv,
        license_type: coaches.license_type,
        countryName: countries.name,
        countrycode: coaches.countrycode,
        consumeLicenseCount: sql<number>`COALESCE(COUNT(CASE WHEN ${licenses.status} = 'Consumed' THEN 1 END), 0)`,
        assignedLicenseCount: sql<number>`COALESCE(COUNT(CASE WHEN ${licenses.status} = 'Assigned' THEN 1 END), 0)`,
        earnings: sql<number>`COALESCE(SUM(${coachaccount.amount}), 0)`,
      })
      .from(coaches)
    .leftJoin(countries, eq(countries.id, sql<number>`CAST(${coaches.country} AS INTEGER)`))
      .leftJoin(licenses, eq(licenses.assigned_to, coaches.id))
      .leftJoin(coachaccount, eq(coachaccount.coach_id, coaches.id))
      .where(eq(coaches.id, coachId))
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
        coaches.country,
        coaches.countrycode,
        coaches.state,
        coaches.city,
        coaches.clubName,
        coaches.facebook,
        coaches.instagram,
        coaches.linkedin,
        coaches.xlink,
        coaches.youtube,
        coaches.license,
        coaches.cv,
        coaches.license_type,
        countries.name
      )
      .limit(1);
console.log("coach data:",coachData);
    if (!coachData.length) {
      return NextResponse.json({ message: 'Coach not found' }, { status: 404 });
    }

    // Fetch evaluations with player info
    const evaluations = await db
      .select({
        evaluationId: playerEvaluation.id,
        review_title: playerEvaluation.review_title,
        primary_video_link: playerEvaluation.primary_video_link,
        jerseyNumber: playerEvaluation.jerseyNumber,
        status: playerEvaluation.status,
        turnaroundTime: playerEvaluation.turnaroundTime,
        payment_status: playerEvaluation.payment_status,
        rating: playerEvaluation.rating,
        remarks: playerEvaluation.remarks,
        created_at: playerEvaluation.created_at,
        player_id: playerEvaluation.player_id,
        coach_id: playerEvaluation.coach_id,
        playerFirstName: users.first_name,
        playerLastName: users.last_name,
        playerSlug: users.slug,
        firstName: coaches.firstName,
        is_deleted: playerEvaluation.is_deleted,
      })
      .from(playerEvaluation)
      .leftJoin(users, eq(users.id, playerEvaluation.player_id))
      .leftJoin(coaches, eq(coaches.id, playerEvaluation.coach_id))
      .where(
        and(
          eq(playerEvaluation.coach_id, coachId),
          //eq(playerEvaluation.is_deleted, 1) // show only non-hidden evaluations
        )
      )
    // console.log('coaches data:', evaluations);

    const evaluationReviews = await db
      .select({
        id: review.id,
        player_id: review.player_id,
        player_name: users.first_name,
        coach_name: coaches.firstName,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        created_at: review.createdAt,
        review_status: review.review_status,
      })
      .from(review)
      .leftJoin(users, eq(users.id, review.player_id))
      .leftJoin(coaches, eq(coaches.id, coachId))
      .where(eq(review.coach_id, coachId))


    // Fetch related data in parallel
    const [evaluationResultsList, earningsList, paymentsList] = await Promise.all([
      db.select().from(evaluationResults).where(eq(evaluationResults.coachId, coachId)),
      db.select().from(coachearnings).where(eq(coachearnings.coach_id, coachId)),
      // db.select().from(payments).where(eq(payments.coach_id, coachId)),
      db
        .select({
          id: payments.id,
          amount: payments.amount,
          status: payments.status,
          created_at: payments.created_at,
          evaluation_id: payments.evaluation_id,
          player_id: payments.player_id,
          description: payments.description,
          playerFirstName: users.first_name,
          playerLastName: users.last_name,
          review_title: playerEvaluation.review_title,
          is_deleted: payments.is_deleted,
        })
        .from(payments)
        .leftJoin(users, eq(users.id, payments.player_id))
        .leftJoin(playerEvaluation, eq(playerEvaluation.id, payments.evaluation_id))
        .where(
          and(
            eq(payments.coach_id, coachId),
            //eq(playerEvaluation.is_deleted, 1) // filter out payments tied to hidden evaluations
          )
        )

    ]);

    // console.log("Results: ", evaluationResultsList);

    // console.log("Earnings: ", earningsList);

    const latestIpResult = await db
      .select({
        ip: ip_logs.ip_address,
        created_at: ip_logs.created_at
      })
      .from(ip_logs)
      .where(eq(ip_logs.userId, coachId))
      .orderBy(sql`${ip_logs.created_at} DESC`)
      .limit(1)
      .execute();

    const latestIp = latestIpResult[0]?.ip || null;

    console.log("IP: ", latestIpResult)

    return NextResponse.json({
      ...coachData[0],
      evaluations,
      evaluationResults: evaluationResultsList,
      earningsDetails: earningsList,
      payments: paymentsList,
      latestLoginIp: latestIp, // ✅ Added
      reviews: evaluationReviews,
    });
  } catch (error) {
    console.log("Error: ", String(error))

    return NextResponse.json(
      {
        message: 'Failed to fetch coach data',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}



export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const evaluationId = parseInt((await params).id, 10);
  if (isNaN(evaluationId)) {
    return NextResponse.json({ message: 'Invalid evaluation ID' }, { status: 400 });
  }

  try {
    // Get the current is_deleted value
    const existing = await db
      .select({ is_deleted: playerEvaluation.is_deleted })
      .from(playerEvaluation)
      .where(eq(playerEvaluation.id, evaluationId))
      .then((res) => res[0]);


    if (!existing) {
      return NextResponse.json({ message: 'Evaluation not found' }, { status: 404 });
    }

    const newStatus = existing.is_deleted === 1 ? 0 : 1;

    // Toggle is_deleted
    // await db
    //   .update(playerEvaluation)
    //   .set({ is_deleted: newStatus })
    //   .where(eq(playerEvaluation.id, evaluationId));
    await db
      .update(coachearnings)
      .set({ is_deleted: newStatus })
      .where(eq(coachearnings.evaluation_id, evaluationId)); // assuming foreign key

    await db
      .update(payments)
      .set({ is_deleted: newStatus })
      .where(eq(payments.evaluation_id, evaluationId)); // assuming foreign key


    return NextResponse.json({
      message: `Evaluation ${newStatus === 1 ? 'hidden' : 'restored'} successfully`,
      newStatus,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to toggle evaluation', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const evaluationId = parseInt((await params).id, 10);
  if (isNaN(evaluationId)) {
    return NextResponse.json({ message: 'Invalid evaluation ID' }, { status: 400 });
  }

  try {
    await db
      .update(playerEvaluation)
      .set({ is_deleted: 1 }) // hide the evaluation
      .where(eq(playerEvaluation.id, evaluationId));

    await db
      .update(payments)
      .set({ is_deleted: 1 })
      .where(eq(payments.evaluation_id, evaluationId)); // assuming foreign key


    return NextResponse.json({ message: 'Evaluation reverted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Failed to revert evaluation', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
