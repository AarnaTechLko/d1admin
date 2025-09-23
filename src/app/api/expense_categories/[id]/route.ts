import { db } from "@/lib/db";
import { master_categories } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// PUT update category
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const updated = await db
      .update(master_categories)
      .set({ name })
      .where(eq(master_categories.id,  Number(( await params).id)))
      .returning();

    return NextResponse.json({ data: updated[0] });
  } catch (error) {
  console.error("Update category error:", error); // now it's "used"
  return NextResponse.json(
    { error: "Failed to update category" },
    { status: 500 }
  );
}
}

// DELETE category
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await db.delete(master_categories).where(eq(master_categories.id,  Number(( await params).id)));
    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
  console.error("Update category error:", error); // now it's "used"
  return NextResponse.json(
    { error: "Failed to update category" },
    { status: 500 }
  );
}
}
