import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { expense_categories, master_categories } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const allExpenses = await db
      .select({
        id: expense_categories.id,
        amount: expense_categories.amount,
        description: expense_categories.description,
        createdAt: expense_categories.createdAt,
        categoryName: master_categories.name,
      })
      .from(expense_categories)
       .leftJoin(master_categories, eq(expense_categories.categoryid, master_categories.id))
      .execute();

    console.log("all data category:", allExpenses);

    return NextResponse.json({ data: allExpenses });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch expense_categories" },
      { status: 500 }
    );
  }
}


export async function POST(req: Request) {
  try {
    const { categoryid, amount = "0", description = "", user_id } = await req.json();

    if (!categoryid) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    if (!user_id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

   const data= await db.insert(expense_categories).values({
      categoryid: categoryid.toString(), // store category ID as string in name column
      amount: amount.toString(),
      description,
      user_id, // logged-in user's ID
    });
        console.log("data",data);

    return NextResponse.json({ message: "Expense category added successfully" });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to add category" },
      { status: 500 }
    );
  }
}
