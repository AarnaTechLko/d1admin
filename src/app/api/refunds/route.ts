// src/app/api/refunds/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { refunds, payments, playerEvaluation, coachearnings, users, coaches } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { PaymentStatus } from '@/app/types/types';
import { getStripe } from '@/lib/stripe.server';
import axios from "axios";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const stripe = getStripe();


    const { payment_id, refund_type, amount_refunded, refund_by, evaluation_id, remark} = body;

    if (!payment_id || !refund_type || !amount_refunded || !refund_by || !evaluation_id || !remark){
      return NextResponse.json(
        { success: false, error: "Missing refund data" },
        { status: 404 }
      );
    }

    
    const evaluationExist = await db
        .select({ id: playerEvaluation.id,  })
        .from(playerEvaluation)
        .where(
            eq(playerEvaluation.id, Number(evaluation_id))
        );

    if (!evaluationExist || evaluationExist.length === 0) {
        throw new Error("Evaluation doesn't exist");
    }


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

    if (!payment.intent_id){
      return NextResponse.json(
          { error: 'Intent ID not found' },
          { status: 400 },
      );
    }


    const paymentAmount = Number(payment.amount);
    const refundAmount = Number(amount_refunded);
    const remaining_amount = paymentAmount - refundAmount;

    const refundStripeAmount = Math.round(Number(amount_refunded) * 100);


    console.log("Remaining Amount: ", remaining_amount);

    if (refund_type === "full"){
      try {
        await stripe.refunds.create({
          charge: payment.intent_id,
        });
      } catch (err: unknown) {

        if (err instanceof Error && 'type' in err) {
      // TypeScript doesn't know the exact type yet

          const stripeError = err as Stripe.StripeRawError; 

          if (stripeError.code === 'resource_missing') {
            return NextResponse.json(
              { error: stripeError.message },
              { status: 404 },
            );
          }
          else if (stripeError.code === 'payment_intent_unexpected_state') {
            return NextResponse.json(
              { error: stripeError.message },
              { status: 400 },
            );
          }

          throw stripeError;
        }
      }
    }
    else if (refund_type === "partial") {

      try {
        await stripe.refunds.create({
          payment_intent: payment.intent_id,
          amount: refundStripeAmount,
        });
      } catch (err: unknown) {

        if (err instanceof Error && 'type' in err) {
      // TypeScript doesn't know the exact type yet

          const stripeError = err as Stripe.StripeRawError; 



          return NextResponse.json(
            { error: stripeError.message },
            { status: 400 },
          )
        }
        // throw stripeError;
      }
    }

    await db
      .update(coachearnings)
      .set({ status: PaymentStatus.REFUNDED })
      .where(eq(coachearnings.evaluation_id, payment.evaluation_id));

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

    // action_type: varchar("action_type"),
    // action_reason: text("action_reason"),
    // action_by_admin_id: integer("action_by_admin_id").references( () => admin.id),
    // date_of_action: timestamp("date_of_action", { withTimezone: true }).defaultNow().notNull(),

    // Update payment: amount AND status
    await db
      .update(payments)
      .set({
        amount:  refundAmount.toString(),
        status: PaymentStatus.REFUNDED, // <-- ensure this matches your schema type
      })
      .where(eq(payments.id, payment_id));

    const ids = await db
      .update(playerEvaluation)
      .set({
        payment_status: PaymentStatus.REFUNDED,
        updated_at: new Date(),
        rejectremarks: remark || undefined,
      })
      .where(eq(playerEvaluation.id, payment.evaluation_id))
      .returning();


    const playerEmail = await db
      .select({ id: users.id, firstName: users.first_name, email: users.email })
      .from(users)
      .where(eq(users.id, ids[0].player_id));

    const coachEmail = await db
      .select({
        id: coaches.id,
        firstName: coaches.firstName,
        email: coaches.email,
      })
      .from(coaches)
      .where(eq(coaches.id, ids[0].coach_id));



    const mailmessage = `<p> Our admins have refunded an amount of ${payment.currency}${refundAmount.toFixed(2)} from your evaluation with ${coachEmail[0].firstName}.
    
    <p>Reason: "${remark}"</p>

    <p>Please Note: It will take 5-10 buisness days before the amount will return to your bank account and that you will not be refunded any processing fees.</p>`;


    await axios.post(`https://d1notes.com/api/geolocation/player`, {
            type: "player",
            targetIds: [playerEmail[0].id],
            message: mailmessage,
            methods: {
            email: true,
            sms: false,
            internal: false,
            },
        });

    return NextResponse.json({
      success: true,
      refund: refundResult,
      refundAmount,
       status: PaymentStatus.REFUNDED,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to process refund" },
      { status: 500 }
    );
  }
}
