import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { expense_categories } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    await db
      .update(expense_categories)
      .set({ is_deleted: 0 }) // ✅ hide category
      .where(eq(expense_categories.id, Number(id)));

    return NextResponse.json({ message: "Category hidden successfully" });
  } catch (error) {
    console.error("Hide category error:", error);
    return NextResponse.json(
      { error: "Failed to hide category" },
      { status: 500 }
    );
  }
}
