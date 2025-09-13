
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

    const evaluations = await db
      .select()
      .from(playerEvaluation)
      .where(eq(playerEvaluation.id, evaluationId))
      .limit(1);

    const existingEvaluation = evaluations[0];

    if (!existingEvaluation) {
      return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 });
    }

    if (existingEvaluation.review_status === 0) {
      return NextResponse.json({ error: 'Rating is already hidden' }, { status: 400 });
    }

    await db
      .update(playerEvaluation)
      .set({
        review_status: 0,
       
      })
      .where(eq(playerEvaluation.id, evaluationId));

    return NextResponse.json({
      success: true,
      message: 'Rating hidden successfully',
    });
  } catch (error) {
    console.error('Error hiding rating:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
