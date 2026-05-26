import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { coaches } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const coachId = parseInt((await params).id, 10);

    if (isNaN(coachId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid coach id",
        },
        { status: 400 }
      );
    }

    const body = await req.json();

    const updates: Record<string, unknown> = {};

    // Update video visibility
    if (typeof body.videoEnabled === "boolean") {
      updates.visibility = body.videoEnabled ? "on" : "off";
    }

    // Update fee
    if (
      typeof body.feePerSession === "number" &&
      body.feePerSession >= 0
    ) {
      updates.expectedCharge = String(body.feePerSession);
    }

    // Nothing to update
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Nothing to update",
        },
        { status: 400 }
      );
    }

    await db
      .update(coaches)
      .set({
        ...updates,
        updated_at: new Date(),
      })
      .where(eq(coaches.id, coachId));

    return NextResponse.json({
      success: true,
      message: "Coach updated successfully",
    });
  } catch (err: unknown) {
    console.error("[PATCH COACH VIDEO SETTINGS ERROR]", err);

    return NextResponse.json(
      {
        success: false,
        error: (err as Error).message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}