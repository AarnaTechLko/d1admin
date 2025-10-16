// src/app/api/refunds/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { refunds, payments } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { payment_id, refund_type, amount_refunded, refund_by } = body;

    // Fetch the current payment
    const paymentResult = await db
      .select()
      .from(payments)
      .where(eq(payments.id, payment_id))
      .limit(1);

    const payment = paymentResult[0];

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Payment not found" },
        { status: 404 }
      );
    }

    const paymentAmount = Number(payment.amount);
    const refundAmount = Number(amount_refunded);
    const remaining_amount = paymentAmount - refundAmount;

    // Insert refund record
    const refundResult = await db
      .insert(refunds)
      .values({
        payment_id,
        refund_type,
        amount_refunded: refundAmount.toString(), // decimal column as string
        remaining_amount: remaining_amount.toString(),
        refund_by,
      })
      .returning();

    // Update payment: amount AND status
    await db
      .update(payments)
      .set({
        amount:  refundAmount.toString(),
        status: "refunded", // <-- ensure this matches your schema type
    
      })
      .where(eq(payments.id, payment_id));

    return NextResponse.json({
      success: true,
      refund: refundResult,
      refundAmount,
       status: "refunded",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to process refund" },
      { status: 500 }
    );
  }
}
