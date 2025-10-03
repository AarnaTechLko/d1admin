// // app/api/player/[id]/badges/route.ts
// import { db } from "@/lib/db";
// import { evaluationResults } from "@/lib/schema"; 
// import { desc, eq } from "drizzle-orm";
// import { NextResponse } from "next/server";

// export async function GET(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const playerId = Number(params.id);

//     // Fetch all evaluation results for this player
//     const badges = await db
//       .select({
//         id: evaluationResults.id,
//         playerId: evaluationResults.playerId,
//         evalAverage: evaluationResults.eval_average,
//       })
//       .from(evaluationResults)
//       .where(eq(evaluationResults.playerId, playerId))
//       .orderBy(desc(evaluationResults.eval_average)); // sort descending by evalAverage

//     // Calculate overallAverage across all evaluations
//     const evalValues = badges
//       .map(b => Number(b.evalAverage))
//       .filter(n => !isNaN(n));

//     const overallAverage = evalValues.length
//       ? Number((evalValues.reduce((a, b) => a + b, 0) / evalValues.length).toFixed(2))
//       : null;

//     return NextResponse.json({
//       badges,
//       overallAverage, // average across all eval_average
//     });
//   } catch (error) {
//     console.error("Error fetching badges:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch badges" },
//       { status: 500 }
//     );
//   }
// }
import { db } from "@/lib/db";
import { evaluationResults, coaches, users } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const playerId = Number((await params).id);

    if (isNaN(playerId)) {
      return NextResponse.json({ error: "Invalid player ID" }, { status: 400 });
    }

    // Fetch all evaluations for this player + join with coach info
    const badges = await db
      .select({
        id: evaluationResults.id,
        playerId: evaluationResults.playerId,
        evalAverage: evaluationResults.eval_average,
        coachId: evaluationResults.coachId,
        firstName: coaches.firstName,
        lastName: coaches.lastName,
        image: coaches.image,
        first_name:users.first_name,
        last_name:users.last_name,
      })
      .from(evaluationResults)
      .leftJoin(coaches, eq(coaches.id, evaluationResults.coachId)) // ✅ join with coach user
      .leftJoin(users, eq(users.id, evaluationResults.playerId)) // ✅ join with coach user
      .where(eq(evaluationResults.playerId, playerId))
      .orderBy(desc(evaluationResults.eval_average));
    console.log("all data:", badges);
    // Calculate overall average
    const evalValues = badges
      .map(b => Number(b.evalAverage))
      .filter(n => !isNaN(n));

    const overallAverage = evalValues.length
      ? Number((evalValues.reduce((a, b) => a + b, 0) / evalValues.length).toFixed(2))
      : null;

    return NextResponse.json({
      playerId,
      overallAverage,
      evaluations: badges.map(b => ({
        id: b.id,
        eval_average: Number(b.evalAverage),
        coachId: b.coachId,
        first_name:b.first_name,
        last_name:b.last_name,
        firstName: b.firstName ? b.firstName[0] : "", // first letter
        lastName: b.lastName ? b.lastName[0] : "",   // first letter
        image: b.image,
      })),
    });
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json(
      { error: "Failed to fetch badges" },
      { status: 500 }
    );
  }
}


