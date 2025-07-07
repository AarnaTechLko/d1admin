import { db } from "@/lib/db";
import { block_ips } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json();

  if (!["block", "unblock"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await db.update(block_ips).set({ status }).where(eq(block_ips.id, id));

  return NextResponse.json({ success: true });
}
