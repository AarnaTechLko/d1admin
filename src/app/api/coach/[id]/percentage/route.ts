// /app/api/coach/[id]/percentage/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { coaches } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }>}) {
     const coachId =  parseInt((await params).id, 10); // ✅ no await

  const body = await req.json();
  const { percentage } = body;

  if (!coachId || percentage === undefined) {
    return NextResponse.json({ error: "Missing id or percentage" }, { status: 400 });
  }

  try {
    const updatedCoach = await db
      .update(coaches)
      .set({ percentage: percentage.toString() })
      .where(eq(coaches.id, Number(coachId)))
      .returning();

    return NextResponse.json({ coach: updatedCoach });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update percentage" }, { status: 500 });
  }
}
