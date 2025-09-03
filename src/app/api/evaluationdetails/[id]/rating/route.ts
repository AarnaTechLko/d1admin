
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { playerEvaluation } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const evaluationId = Number((await params).id);
    const { rating, remarks } = await req.json();

    if (
      isNaN(evaluationId) ||
      (rating !== undefined && (typeof rating !== 'number' || rating < 1 || rating > 5)) ||
      (remarks !== undefined && typeof remarks !== 'string')
    ) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    await db
      .update(playerEvaluation)
      .set({
        ...(rating !== undefined ? { rating } : {}),
        ...(remarks !== undefined ? { remarks } : {}),
      })
      .where(eq(playerEvaluation.id, evaluationId));

    return NextResponse.json({ success: true, message: 'Feedback updated successfully' });
  } catch (error) {
    console.error('Error updating feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
