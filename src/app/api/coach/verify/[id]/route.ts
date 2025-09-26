// D:\d1admin\src\app\api\coach\verify\[id]\route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { coaches } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest,
   { params }: { params: Promise<{ id: string }> }) {
  const coachId = Number(( await params).id);

  if (!coachId) {
    return NextResponse.json({ error: "Invalid coach ID" }, { status: 400 });
  }

  try {
    const result = await db
      .update(coaches)
      .set({ verified: 1 })
      .where(eq(coaches.id, Number(coachId)))
      .returning();

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Coach not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Coach verified successfully", coach: result[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
