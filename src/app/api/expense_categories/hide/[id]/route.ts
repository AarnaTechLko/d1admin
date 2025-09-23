import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { master_categories } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // ✅ params as promise
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Master Category ID is required" },
        { status: 400 }
      );
    }

    await db
      .update(master_categories)
      .set({ is_deleted: 0 }) // ✅ hide master category
      .where(eq(master_categories.id, Number(id)));

    return NextResponse.json({ message: "Master category hidden successfully" });
  } catch (error) {
    console.error("Hide master category error:", error);
    return NextResponse.json(
      { error: "Failed to hide master category" },
      { status: 500 }
    );
  }
}
