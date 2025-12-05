
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { review } from '@/lib/schema';
import { eq } from 'drizzle-orm';


export async function PATCH(req: NextRequest,) {
  try {
    const {id, status} = await req.json();
    if (isNaN(Number(id))) {
      return NextResponse.json({ error: 'Invalid review ID' }, { status: 400 });
    }

    // if (!existingEvaluation) {
    //   return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 });
    // }

    console.log("ID: ", id);
    console.log("Stats: ", status);

    if(status === 'Hidden'){
        await db
        .update(review)
        .set({
            review_status: 0,
        })
        .where(eq(review.id, Number(id)));
    }
    else {
       
        await db
        .update(review)
        .set({
            review_status: 1,
        })
        .where(eq(review.id, Number(id)));

    }

    return NextResponse.json({
      success: true,
      message: 'Rating hidden successfully',
    });
  } catch (error) {
    console.error('Error hiding rating:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
