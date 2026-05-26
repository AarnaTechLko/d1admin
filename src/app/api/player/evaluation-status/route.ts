import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { playerId } = body;

    if (!playerId) {
      return NextResponse.json(
        { error: "Player ID is required" },
        { status: 400 }
      );
    }

    // Get current status
    const existingUser = await db.execute(
      sql`
        SELECT id, evaluation_status
        FROM users
        WHERE id = ${Number(playerId)}
        LIMIT 1
      `
    );

    const user = existingUser.rows[0] as {
      id: number;
      evaluation_status: number;
    };

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const newStatus = user.evaluation_status === 1 ? 0 : 1;

    // Update status
    await db.execute(
      sql`
        UPDATE users
        SET evaluation_status = ${newStatus}
        WHERE id = ${Number(playerId)}
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