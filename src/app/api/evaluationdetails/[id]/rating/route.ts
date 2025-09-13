import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { playerEvaluation, review } from "@/lib/schema";
import { eq } from "drizzle-orm";

interface FeedbackBody {
  rating?: number;
  reviewComment?: string;
  reviewTitleCustom?: string;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const evaluationId = Number((await params).id);
    const { rating, reviewComment, reviewTitleCustom } =
      (await req.json()) as FeedbackBody;

    if (
      isNaN(evaluationId) ||
      (rating !== undefined &&
        (typeof rating !== "number" || rating < 1 || rating > 5))
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Only update actual columns in playerEvaluation
    const updateData: Partial<typeof playerEvaluation.$inferInsert> = {};
   if (rating !== undefined) updateData.rating = rating;

    if (Object.keys(updateData).length > 0) {
      const [updatedEval] = await db
        .update(playerEvaluation)
        .set(updateData)
        .where(eq(playerEvaluation.id, evaluationId))
        .returning();

      if (!updatedEval) {
        return NextResponse.json(
          { error: "Player evaluation not found" },
          { status: 404 }
        );
      }

      const coachId = updatedEval.coach_id;
      const playerId = updatedEval.player_id;

      if (!coachId || !playerId) {
        return NextResponse.json(
          { error: "Missing coachId or playerId in evaluation" },
          { status: 400 }
        );
      }

      // Update or insert review table
      const existingReview = await db
        .select()
        .from(review)
        .where(eq(review.coach_id, coachId))
        .limit(1);

      if (existingReview.length > 0) {
        await db
          .update(review)
          .set({
            rating: rating?.toString(),
            title: reviewTitleCustom,
            comment: reviewComment,
          })
          .where(eq(review.coach_id, coachId));
      } else {
        await db.insert(review).values({
          player_id: playerId,
          coach_id: coachId,
          rating: rating?.toString(),
          title: reviewTitleCustom,
          comment: reviewComment,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Feedback updated successfully in both tables",
    });
  } catch (error) {
    console.error("Error updating feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
