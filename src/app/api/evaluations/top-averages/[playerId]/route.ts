
// import { NextResponse } from "next/server";
// import { db } from "@/lib/db";
// import { evaluationResults, coaches } from "@/lib/schema";
// import { sql, eq } from "drizzle-orm";

// export async function GET(
//   req: Request,
//   { params }: { params: Promise<{ playerId: string }> }
// ) {
//   try {
//     const coachId = Number((await params).playerId);
//     if (isNaN(coachId)) {
//       return NextResponse.json({ error: "Invalid coachId" }, { status: 400 });
//     }

//     // Fetch coach info + overall average
//     const [coach] = await db
//       .select({
//         coachId: evaluationResults.coachId,
//         firstName: coaches.firstName,
//         lastName: coaches.lastName,
//         image: coaches.image, // fetch image
//         avg: sql`AVG(${evaluationResults.eval_average})`.as("avg"),
//       })
//       .from(evaluationResults)
//       .innerJoin(coaches, eq(coaches.id, evaluationResults.coachId))
//       .where(eq(evaluationResults.playerId, coachId))
//       .groupBy(evaluationResults.playerId, coaches.firstName, coaches.lastName, coaches.image);

//     if (!coach) {
//       return NextResponse.json({ error: "Player not found" }, { status: 404 });
//     }
// console.log("all top data:",coach);
//     // Fetch all evaluations for this coach
//     const evals = await db
//       .select({
//         id: evaluationResults.id,
//         eval_average: evaluationResults.eval_average,
//       })
//       .from(evaluationResults)
//       .where(eq(evaluationResults.coachId, coachId));

//     const responseData = {
//       coachId: coach.coachId,
//       firstName: coach.firstName ? coach.firstName[0] : "",
//    lastName: coach.lastName ? coach.lastName[0] : "",
//       image: coach.image ?? "", // include image in response
//       avg: coach.avg === null ? null : Number(coach.avg),
//       evaluations: evals.map((e) => ({
//         id: e.id,
//         eval_average: Number(e.eval_average),
//       })),
//     };
// console.log("responseData",responseData);
//     return NextResponse.json(responseData);
//   } catch (error) {
//     console.error("❌ Error fetching coach evaluations:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch coach evaluations" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { evaluationResults, coaches } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const playerId = Number((await params).playerId);
    if (isNaN(playerId)) {
      return NextResponse.json({ error: "Invalid playerId" }, { status: 400 });
    }

    // Fetch top 10 evaluations for this player, including coach info
    const topEvals = await db
      .select({
        evalId: evaluationResults.id,
        eval_average: evaluationResults.eval_average,
        coachId: evaluationResults.coachId,
        firstName: coaches.firstName,
        lastName: coaches.lastName,
        image: coaches.image,
      })
      .from(evaluationResults)
      .innerJoin(coaches, eq(coaches.id, evaluationResults.coachId))
      .where(eq(evaluationResults.playerId, playerId))
      .orderBy(sql`${evaluationResults.eval_average}::numeric DESC`)
      .limit(10);

    if (topEvals.length === 0) {
      return NextResponse.json({ error: "No evaluations found" }, { status: 404 });
    }

    console.log("all getting data:", topEvals);
    // Calculate average of top 10 evaluations
    const avg =
      topEvals.reduce((sum, e) => sum + Number(e.eval_average), 0) /
      topEvals.length;

    const responseData = {
      playerId,
      avg: Number(avg.toFixed(2)),
      evaluations: topEvals.map((e) => ({
        id: e.evalId,
        eval_average: Number(e.eval_average),
        coachId: e.coachId,
        firstName: e.firstName ? e.firstName[0] : "", // first letter
        lastName: e.lastName ? e.lastName[0] : "",   // first letter
        image: e.image ?? "",
      })),
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("❌ Error fetching top evaluations:", error);
    return NextResponse.json(
      { error: "Failed to fetch top evaluations" },
      { status: 500 }
    );
  }
}

