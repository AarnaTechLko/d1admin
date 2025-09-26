import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { evaluationResults } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const playerIdStr = (await params).playerId;

    if (!playerIdStr) {
      return NextResponse.json({ overallAverage: null }, { status: 200 });
    }

    const playerId = Number(playerIdStr);
    if (isNaN(playerId)) {
      return NextResponse.json({ overallAverage: null }, { status: 200 });
    }

    // Fetch eval_average values for this player
    const results = await db
      .select({ avg: evaluationResults.eval_average })
      .from(evaluationResults)
      .where(eq(evaluationResults.playerId, playerId));

    const numbers = results.map(r => Number(r.avg)).filter(n => !isNaN(n));

    const overallAverage = numbers.length
      ? Number((numbers.reduce((a, b) => a + b, 0) / numbers.length).toFixed(2))
      : null;

    return NextResponse.json({ overallAverage });
  } catch (error) {
    console.error("Error fetching evaluation averages:", error);
    return NextResponse.json({ overallAverage: null }, { status: 500 });
  }
}
