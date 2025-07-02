// /api/evaluationdetails/[id]/revert/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { playerEvaluation } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const evaluationId = Number((await params).id);
    if (isNaN(evaluationId)) {
      return NextResponse.json({ error: 'Invalid evaluation ID' }, { status: 400 });
    }

    // Check if evaluation exists
    const evaluation = await db.query.playerEvaluation.findFirst({
      where: eq(playerEvaluation.id, evaluationId),
    });
    

    if (!evaluation) {
      return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 });
    }

    if (evaluation.review_status === 1) {
      return NextResponse.json({ error: 'Rating is already visible' }, { status: 400 });
    }

    // Revert visibility
    await db
      .update(playerEvaluation)
      .set({ review_status: 1 })
      .where(eq(playerEvaluation.id, evaluationId));

    return NextResponse.json({
      success: true,
      message: 'Rating visibility restored',
    });
  } catch (error) {
    console.error('Error reverting visibility:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
