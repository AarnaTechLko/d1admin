// import {  NextResponse } from "next/server";
// import { db } from "@/lib/db";
// import { payments } from "@/lib/schema";
// import { and, gte, lt } from "drizzle-orm";

// // Helper function to get the current month range
// const getCurrentMonthRange = () => {
//   const now = new Date();
//   const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month
//   const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); // End of current month (last moment)
//   return { startOfMonth, endOfMonth };
// };

// export async function GET() {
//   try {
//     const { startOfMonth, endOfMonth } = getCurrentMonthRange();

//     // Fetch monthly payments from the database
//     const monthlySales = await db
//       .select({
//         id: payments.id,
//         amount: payments.amount,
//         currency: payments.currency,
//         created_at: payments.created_at,
//       })
//       .from(payments)
//       .where(and(gte(payments.created_at, startOfMonth), lt(payments.created_at, endOfMonth)));

//     // Calculate total revenue
//     const totalRevenue = monthlySales.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

//     // Return the monthly sales and total revenue in the response
//     return NextResponse.json({ monthlySales, totalRevenue });
//   } catch (error) {
//     console.error("Error fetching sales data:", error);
//     return NextResponse.json({ error: "Error fetching sales data" }, { status: 500 });
//   }
// }
// app/api/sale/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { payments } from '@/lib/schema';
import { asc } from 'drizzle-orm';

export async function GET() {
  try {
    const payment = await db
      .select()
      .from(payments)
      .orderBy(asc(payments.created_at));

    return NextResponse.json({
      monthlySales: payment.map((p) => ({
        created_at: p.created_at,
        amount: p.amount,
      })),
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
