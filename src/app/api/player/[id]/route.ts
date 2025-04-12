// File: src/app/api/player/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, playerEvaluation, coachearnings, payments, evaluationResults } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = parseInt((await params).id, 10);

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
        coachName: sql`coa."firstName"`.as("coachName"),
        coachLastName: sql`coa."lastName"`.as("coachLastName"),
        enterpriseName: sql`ent."organizationName"`.as("enterpriseName")
      })
      .from(users)
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
      .select()
      .from(playerEvaluation)
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
      .select()
      .from(payments)
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
