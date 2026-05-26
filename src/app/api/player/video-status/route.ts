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
        SELECT id, video_status
        FROM users
        WHERE id = ${Number(playerId)}
        LIMIT 1
      `
    );

    const user = existingUser.rows[0] as {
      id: number;
      video_status: number;
    };

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const newStatus = user.video_status === 1 ? 0 : 1;

    // Update status
    await db.execute(
      sql`
        UPDATE users
        SET video_status = ${newStatus}
        WHERE id = ${Number(playerId)}
      `
    );

    return NextResponse.json({
      success: true,
      message: "Video status updated successfully",
      video_status: newStatus,
    });

  } catch (error) {
    console.error("Video Status Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}