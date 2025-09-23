import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { expense_categories, master_categories } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";

// Add new category
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({ error: "Category name is required" }, { status: 400 });
        }

        const inserted = await db.insert(master_categories).values({ name }).returning();

        return NextResponse.json({ success: true, data: inserted[0] }, { status: 201 });
    } catch (error) {
        console.error("Error adding category:", error);
        return NextResponse.json({ error: "Failed to add category" }, { status: 500 });
    }
}

export async function GET() {
  try {
    const allCategories = await db
      .select({
        id: master_categories.id,
        categoryName: master_categories.name,
        createdAt: master_categories.createdAt,
        totalAmount: sql`COALESCE(SUM(${expense_categories.amount}), 0)`,
      })
      .from(master_categories)
       .leftJoin(expense_categories, eq(expense_categories.categoryid, master_categories.id))
      
      .groupBy(master_categories.id)
      .orderBy(master_categories.id);
// console.log('all categoryu sum:',allCategories);
    return NextResponse.json({ success: true, data: allCategories }, { status: 200 });
  } catch (error) {
    console.error("Error fetching master_categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch master_categories" },
      { status: 500 }
    );
  }
}

