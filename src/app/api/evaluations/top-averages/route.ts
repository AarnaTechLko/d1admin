import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { evaluationResults } from "@/lib/schema";
import { desc, sql } from "drizzle-orm";

export async function GET() {
  try {
    // Get top-10 players by avg
    const rows = await db
      .select({
        playerId: evaluationResults.playerId,
        avg: sql`AVG(${evaluationResults.eval_average})`.as("avg"),
      })
      .from(evaluationResults)
      .groupBy(evaluationResults.playerId)
      .orderBy(desc(sql`AVG(${evaluationResults.eval_average})`))
      .limit(10);

    // console.log("🔹 Top 10 players by average:", rows);

    // For each player, also fetch their individual eval_average scores
    const results = await Promise.all(
      rows.map(async (r) => {
        const evals = await db
          .select({
            id: evaluationResults.id,
            eval_average: evaluationResults.eval_average,
          })
          .from(evaluationResults)
          .where(sql`${evaluationResults.playerId} = ${r.playerId}`);

        // console.log(`📊 Evaluations for player ${r.playerId}:`, evals);

        return {
          playerId: r.playerId,
          avg: r.avg === null ? null : Number(r.avg),
          evaluations: evals.map((e) => ({
            id: e.id,
            eval_average: Number(e.eval_average),
          })),
        };
      })
    );

    console.log("✅ Final results to return:", results);

    return NextResponse.json(results);
  } catch (error) {
    console.error("❌ Error fetching top averages:", error);
    return NextResponse.json(
      { error: "Failed to fetch top averages" },
      { status: 500 }
    );
  }
}
