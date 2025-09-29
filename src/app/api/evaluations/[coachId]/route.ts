import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { evaluationResults } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ coachId: string }> } // note Promise here
) {
  try {
    const { coachId: coachIdStr } = await params;
    console.log("API called with coachId:", coachIdStr);

    if (!coachIdStr) {
      return NextResponse.json({ overallAverage: null }, { status: 200 });
    }

    const coachId = Number(coachIdStr);
    if (isNaN(coachId)) {
      return NextResponse.json({ overallAverage: null }, { status: 200 });
    }

    // SQL-computed average rounded to 2 decimals
    const [row] = await db
      .select({
        overallAverage: sql<number>`ROUND(AVG(${evaluationResults.eval_average})::numeric, 2)`,
      })
      .from(evaluationResults)
      .where(eq(evaluationResults.coachId, coachId));

    console.log("DB row:", row);

    return NextResponse.json({ overallAverage: row?.overallAverage ?? null });
  } catch (error) {
    console.error("Error fetching evaluation average:", error);
    return NextResponse.json({ overallAverage: null }, { status: 500 });
  }
}
