// File: src/app/api/player/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, countries, playerEvaluation, coachearnings, payments, evaluationResults } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
  const id = parseInt(( await params).id, 10);

  if (isNaN(id)) {
    return NextResponse.json({ message: 'Invalid player ID' }, { status: 400 });
  }

  try {
    // Main player data with enterprise and coach names
    const playerResult = await db
      .select({
        id: users.id,
        first_name: users.first_name,
        last_name: users.last_name,
        image: users.image,
        position: users.position,
        sport: users.sport,
        state: users.state,
        city: users.city,
        gender: users.gender,
        gpa: users.gpa,
        league: users.league,
        team: users.team,
        country: users.country,
        grade_level: users.grade_level,
        location: users.location,
        height: users.height,
        weight: users.weight,
        jersey: users.jersey,
        birthday: users.birthday,
        graduation: users.graduation,
        birth_year: users.birth_year,
        age_group: users.age_group,
        status: users.status,
        facebook: users.facebook,
        instagram: users.instagram,
        linkedin: users.linkedin,
        xlink: users.xlink,
        youtube: users.youtube,
        countryName: countries.name,
        countrycode: users.countrycode,
        coachName: sql`coa."firstName"`.as("coachName"),
        coachLastName: sql`coa."lastName"`.as("coachLastName"),
        enterpriseName: sql`ent."organizationName"`.as("enterpriseName")
      })
      .from(users)
      .leftJoin(countries, eq(countries.id, sql<number>`CAST(${users.country} AS INTEGER)`))

      .leftJoin(sql`enterprises AS ent`, sql`NULLIF(${users.enterprise_id}, '')::integer = ent.id`)
      .leftJoin(sql`coaches AS coa`, sql`NULLIF(${users.coach_id}, '')::integer = coa.id`)
      .where(eq(users.id, id))
      .limit(1)
      .execute();

    const player = playerResult[0];

    if (!player) {
      return NextResponse.json({ message: 'Player not found' }, { status: 404 });
    }

    // Get player's evaluations from playerEvaluation table
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
        player_id: playerEvaluation.player_id, // added player_id here

        playerFirstName: users.first_name,
        playerLastName: users.last_name,
        playerSlug: users.slug,
        is_deleted: playerEvaluation.is_deleted,

      })
      .from(playerEvaluation)
      .leftJoin(users, eq(users.id, playerEvaluation.player_id))

      .where(eq(playerEvaluation.player_id, id))
      .execute();

    // Get player's earnings from coachearnings table
    const earnings = await db
      .select()
      .from(coachearnings)
      .where(eq(coachearnings.player_id, id))
      .execute();

    // Get player's payments from payments table
    const paymentsData = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        status: payments.status,
        evaluation_id:payments.evaluation_id,
        created_at: payments.created_at,
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
      .where(eq(payments.player_id, id))
      .execute();

    // Get player's evaluation results from evaluationResults table
    const evalResults = await db
      .select()
      .from(evaluationResults)
      .where(eq(evaluationResults.playerId, id))
      .execute();

    return NextResponse.json({
      player,
      evaluations,
      earnings,
      payments: paymentsData,
      evaluationResults: evalResults
    });
  } catch (error) {
    console.error('Error fetching player data:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch player data',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
  const evaluationId = parseInt(( await params).id, 10);
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
    await db
      .update(playerEvaluation)
      .set({ is_deleted: newStatus })
      .where(eq(playerEvaluation.id, evaluationId));

    await db
      .update(payments)
      .set({ is_deleted: newStatus })
      .where(eq(payments.evaluation_id, evaluationId)); // assuming foreign key


    return NextResponse.json({
      message: `Evaluation ${newStatus === 1 ? '0' : '1'} successfully`,
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
  const evaluationId = parseInt(( await params).id, 10);
  if (isNaN(evaluationId)) {
    return NextResponse.json({ message: 'Invalid evaluation ID' }, { status: 400 });
  }

  try {
    await db
      .update(playerEvaluation)
      .set({ is_deleted: 1 }) 
      .where(eq(playerEvaluation.id, evaluationId));

    await db
      .update(payments)
      .set({ is_deleted:1 })
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

