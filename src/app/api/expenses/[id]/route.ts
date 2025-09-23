import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { expense_categories } from "@/lib/schema";
import { eq } from "drizzle-orm";

// PUT /api/expense_categories/:id
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; 
    const { categoryid, amount, description } = await req.json();
    await db
      .update(expense_categories)
      .set({
        categoryid:categoryid,
        amount: amount?.toString() ?? "0",
        description,
        // user_id: user_id ?? 0,
      })
  .where(eq(expense_categories.id, Number(id))); // ✅ use eq() imported from drizzle-orm


    return NextResponse.json({ message: "Expences updated successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update expences" }, { status: 500 });
  }
}

// DELETE /api/expense_categories/:id
export async function DELETE(req: Request, { params }: { params:Promise<{ id: string }> }) {
  try {
const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }
    await db .delete(expense_categories)
  .where(eq(expense_categories.id, Number(id))); // ✅ same here


    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
