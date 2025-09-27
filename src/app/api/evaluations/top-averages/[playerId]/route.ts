// import { NextResponse } from "next/server";
// import { db } from "@/lib/db";
// import { evaluationResults } from "@/lib/schema";
// import { desc, sql } from "drizzle-orm";

// export async function GET() {
//   try {
//     // Get top-10 users by avg
//     const rows = await db
//       .select({
//         playerId: evaluationResults.playerId,
//         avg: sql`AVG(${evaluationResults.eval_average})`.as("avg"),
//       })
//       .from(evaluationResults)
//       .groupBy(evaluationResults.playerId)
//       .orderBy(desc(sql`AVG(${evaluationResults.eval_average})`))
//       .limit(10);

//     // console.log("🔹 Top 10 users by average:", rows);

//     // For each player, also fetch their individual eval_average scores
//     const results = await Promise.all(
//       rows.map(async (r) => {
//         const evals = await db
//           .select({
//             id: evaluationResults.id,
//             eval_average: evaluationResults.eval_average,
//           })
//           .from(evaluationResults)
//           .where(sql`${evaluationResults.playerId} = ${r.playerId}`);

//         // console.log(`📊 Evaluations for player ${r.playerId}:`, evals);

//         return {
//           playerId: r.playerId,
//           avg: r.avg === null ? null : Number(r.avg),
//           evaluations: evals.map((e) => ({
//             id: e.id,
//             eval_average: Number(e.eval_average),
//           })),
//         };
//       })
//     );

//     console.log("✅ Final results to return:", results);

//     return NextResponse.json(results);
//   } catch (error) {
//     console.error("❌ Error fetching top averages:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch top averages" },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { evaluationResults, users } from "@/lib/schema";
import { sql, eq } from "drizzle-orm";



export async function GET(
  req: Request,
  { params }: { params: Promise<{ playerId: string }> }
) {

  try {
    const playerId = Number((await params).playerId);
    if (isNaN(playerId)) {
      return NextResponse.json({ error: "Invalid playerId" }, { status: 400 });
    }

    // Fetch player info + overall average
    const [player] = await db
      .select({
        playerId: evaluationResults.playerId,
        firstName: users.first_name,
        lastName: users.last_name,
        avg: sql`AVG(${evaluationResults.eval_average})`.as("avg"),
      })
      .from(evaluationResults)
      .innerJoin(users, eq(users.id, evaluationResults.playerId))
      .where(eq(evaluationResults.playerId, playerId))
      .groupBy(evaluationResults.playerId, users.first_name, users.last_name);

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    // Fetch all evaluations for this player
    const evals = await db
      .select({
        id: evaluationResults.id,
        eval_average: evaluationResults.eval_average,
      })
      .from(evaluationResults)
      .where(eq(evaluationResults.playerId, playerId));

const responseData = {
  playerId: player.playerId,
  firstName: player.firstName ? player.firstName[0] : "",
  lastName: player.lastName ? player.lastName[0] : "",
  avg: player.avg === null ? null : Number(player.avg),
  evaluations: evals.map((e) => ({
    id: e.id,
    eval_average: Number(e.eval_average),
  })),
};


    // ✅ Log the final response data for debugging
    console.log("Player Evaluation Data:", JSON.stringify(responseData, null, 2));

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("❌ Error fetching player evaluations:", error);
    return NextResponse.json(
      { error: "Failed to fetch player evaluations" },
      { status: 500 }
    );
  }
}


