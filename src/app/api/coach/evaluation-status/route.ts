import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { coachId } = body;

    if (!coachId) {
      return NextResponse.json(
        { error: "Coach ID is required" },
        { status: 400 }
      );
    }

    // Get current status
    const existingCoach = await db.execute(
      sql`
        SELECT id, evaluation_status
        FROM coaches
        WHERE id = ${Number(coachId)}
        LIMIT 1
      `
    );

    const coach = existingCoach.rows[0] as {
      id: number;
      evaluation_status: number;
    };

    if (!coach) {
      return NextResponse.json(
        { error: "Coach not found" },
        { status: 404 }
      );
    }

    const newStatus = coach.evaluation_status === 1 ? 0 : 1;

    // Update status
    await db.execute(
      sql`
        UPDATE coaches
        SET evaluation_status = ${newStatus}
        WHERE id = ${Number(coachId)}
      `
    );

    return NextResponse.json({
      success: true,
      message: "Evaluation status updated successfully",
      evaluation_status: newStatus,
    });

  } catch (error) {
    console.error("Evaluation Status Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}