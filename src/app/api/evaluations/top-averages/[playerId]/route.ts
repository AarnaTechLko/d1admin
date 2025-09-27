import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { evaluationResults } from "@/lib/schema";
import { eq } from "drizzle-orm";

interface Props {
  params: { playerId: string };
}

export async function GET(_req: Request, { params }: Props) {
  const playerId = Number(params.playerId);

  // Guard: invalid playerId
  if (isNaN(playerId)) {
    return NextResponse.json({ error: "Invalid playerId" });
  }

  try {
    // Fetch evaluations for this player
    const evals = await db
      .select({
        id: evaluationResults.id,
        eval_average: evaluationResults.eval_average,
      })
      .from(evaluationResults)
      .where(eq(evaluationResults.playerId, playerId));

    // Compute average
    const avg =
      evals.length > 0
        ? Number(
            evals.reduce((sum, e) => sum + Number(e.eval_average), 0) / evals.length
          ).toFixed(2)
        : null;

    // Return data
    return NextResponse.json({
      playerId,
      avg: avg === null ? null : Number(avg),
      evaluations: evals.map((e) => ({
        id: e.id,
        eval_average: Number(e.eval_average),
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch player evaluations" });
  }
}
