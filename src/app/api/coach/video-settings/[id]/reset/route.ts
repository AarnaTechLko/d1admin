import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { coaches } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const coachId = Number((await params).id);

    // Validate coach id
    if (isNaN(coachId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid coach id",
        },
        { status: 400 }
      );
    }

    // Check coach exists
    const existingCoach = await db.query.coaches.findFirst({
      where: eq(coaches.id, coachId),
    });

    if (!existingCoach) {
      return NextResponse.json(
        {
          success: false,
          error: "Coach not found",
        },
        { status: 404 }
      );
    }

    // Disable video access
    await db
      .update(coaches)
      .set({
        visibility: "off",
        updated_at: new Date(),
      })
      .where(eq(coaches.id, coachId));

    return NextResponse.json({
      success: true,
      message: "Coach video access reset successfully",
    });
  } catch (err: unknown) {
    console.error(
      "[POST /api/coach/video-settings/:id/reset]",
      err
    );

    return NextResponse.json(
      {
        success: false,
        error: (err as Error).message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}