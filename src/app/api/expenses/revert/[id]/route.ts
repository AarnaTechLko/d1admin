import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { expense_categories } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PUT(
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
      .set({ is_deleted: 1 }) // ✅ revert category
      .where(eq(expense_categories.id, Number(id)));

    return NextResponse.json({ message: "Category reverted successfully" });
  } catch (error) {
    console.error("Revert category error:", error);
    return NextResponse.json(
      { error: "Failed to revert category" },
      { status: 500 }
    );
  }
}
