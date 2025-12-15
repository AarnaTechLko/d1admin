import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { playerEvaluation, users, coaches, evaluationResults,review } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;
    const evaluationId = Number(url.searchParams.get('evaluationId'));
    console.log('eval ID:',evaluationId);

    if (isNaN(evaluationId)) {
      return NextResponse.json({ error: 'Invalid evaluationId' }, { status: 400 });
    }

    const result = await db
      .select({
        finalRemarks: evaluationResults.finalRemarks,
        sport: evaluationResults.sport,
        position: evaluationResults.position,
        document: evaluationResults.document,
        thingsToWork: evaluationResults.thingsToWork,
        coachInput: evaluationResults.coach_input,
        eval_average: evaluationResults.eval_average,

        evaluationId: playerEvaluation.id,
        playerId: playerEvaluation.player_id,
        reviewTitle: playerEvaluation.review_title,
        primaryVideoLink: playerEvaluation.primary_video_link,
        videoLinkTwo: playerEvaluation.video_link_two,
        videoLinkThree: playerEvaluation.video_link_three,
        videoDescription: playerEvaluation.video_description,
        videoDescriptionTwo: playerEvaluation.video_descriptionTwo,
        videoDescriptionThree: playerEvaluation.video_descriptionThree,
        videoOneTiming: playerEvaluation.videoOneTiming,
        videoTwoTiming: playerEvaluation.videoTwoTiming,
        videoThreeTiming: playerEvaluation.videoThreeTiming,
        coachId: playerEvaluation.coach_id,
        status: playerEvaluation.status,
        paymentStatus: playerEvaluation.payment_status,
        rating: playerEvaluation.rating,
        remarks: playerEvaluation.remarks,
        evaluationposition: playerEvaluation.position,
        positionOne: playerEvaluation.positionOne,
        positionTwo: playerEvaluation.positionTwo,
        positionThree: playerEvaluation.positionThree,
        jerseyNumber: playerEvaluation.jerseyNumber,
        jerseyNumberTwo: playerEvaluation.jerseyNumberTwo,
        jerseyNumberThree: playerEvaluation.jerseyNumberThree,
        jerseyColorOne: playerEvaluation.jerseyColorOne,
        jerseyColorTwo: playerEvaluation.jerseyColorTwo,
        jerseyColorThree: playerEvaluation.jerseyColorThree,
        createdAt: playerEvaluation.created_at,
        updatedAt: playerEvaluation.updated_at,
        review_status: playerEvaluation.review_status,

        first_name: users.first_name,
        last_name: users.last_name,
        image: users.image,
        playerSlug: users.slug,
        team: users.team,
        number: users.number,

        coachimage: coaches.image,
        coachFirstName: coaches.firstName,
        coachLastName: coaches.lastName,
        coachSlug: coaches.slug,

        reviewTitleCustom: review.title,
        reviewComment: review.comment, 
      })
      .from(evaluationResults)
      .leftJoin(playerEvaluation, eq(playerEvaluation.id, evaluationResults.evaluationId))
      .leftJoin(users, eq(users.id, evaluationResults.playerId))
      .leftJoin(coaches, eq(coaches.id, evaluationResults.coachId))
      .leftJoin(review, eq(review.coach_id, evaluationResults.coachId)) // ✅ FIX
      .where(eq(evaluationResults.evaluationId, evaluationId))
      .limit(1)
      .execute();

    if (!result.length) {
      return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 });
    }

    return NextResponse.json({ result: result[0] });
  } catch (error) {
    console.error('Error in GET /api/register:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
