// src/app/api/paymentcancel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { payments, playerEvaluation, coachearnings, users, coaches, admin_payment_logs } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getStripe } from '@/lib/stripe.server';
import { PaymentStatus } from '@/app/types/types';
import axios from "axios";
import { authOptions } from '@/lib/Auth';
import { getServerSession } from 'next-auth/next';
// import { StripeError } from "@stripe/stripe-js";
import Stripe from "stripe";
// import { API_URL } from '@/lib/constants';

export async function PATCH(req: NextRequest) {
    try{


        const session = await getServerSession(authOptions);

        if (!session || !session.user.id) {
          throw new Error('Session User is not authorized');
        }


        const stripe = getStripe();

        const { evaluation_id, remark, internalRemark } = await req.json();

        if (!evaluation_id) {
            return NextResponse.json(
                { error: 'Evaluation ID required' },
                { status: 400 },
            );
        }

        if (!remark) {
            return NextResponse.json(
                { error: 'Remark required' },
                { status: 400 },
            );
        }

        if (!internalRemark){
            return NextResponse.json(
                { error: 'Internal Remark required' },
                { status: 400 },
            );
        }

        if (!stripe) {
        return NextResponse.json(
            { message: 'Stripe client is not initialized.' },
            { status: 400 },
        );
        }


        const evaluationExist = await db
            .select({ id: playerEvaluation.id })
            .from(playerEvaluation)
            .where(
                eq(playerEvaluation.id, Number(evaluation_id))
            );

        if (!evaluationExist || evaluationExist.length === 0) {
            throw new Error("Evaluation doesn't exist");
        }

        console.log("Evaluation: ", evaluation_id);

        const id = parseInt(evaluation_id) || 0;

        const paymentData = await db
        .select({
            id: payments.id,
            intent_id: payments.intent_id,
        })
        .from(payments)
        .where(eq(payments.evaluation_id, id));

        console.log("Payments: ", paymentData[0].intent_id);

        if (!paymentData.length || !paymentData[0]) {
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
        }

        if (!paymentData[0].intent_id) {
            return NextResponse.json(
                { error: 'Intent ID not found' },
                { status: 400 },
            );
        }

    // let canceledIntent;
    try {
      await stripe.paymentIntents.cancel(
        paymentData[0].intent_id,
      );
    } catch (err: unknown) {


        if (err instanceof Error && 'type' in err) {
      // TypeScript doesn't know the exact type yet

        const stripeError = err as Stripe.StripeRawError; // type assertion


        // if (stripeError.code === 'resource_missing') {
        //   return NextResponse.json(
        //     { error: stripeError.message },
        //     { status: 404 },
        //   );
        // }
        // else if (stripeError.code === 'payment_intent_unexpected_state') {
        //   return NextResponse.json(
        //     { error: 'Payment intent cannot be cancelled since the status changed to captured' },
        //     { status: 400 },
        //   );
        // }

        // throw stripeError;

        return NextResponse.json(
          { error: stripeError.message },
          { status: 400 },
        )

      }


    }

    await db
      .update(coachearnings)
      .set({ status: PaymentStatus.CANCELLED })
      .where(eq(coachearnings.evaluation_id, id));


    await db
      .update(payments)
      .set({ 
        status: PaymentStatus.CANCELLED,
      })
      .where(eq(payments.evaluation_id, id));

    const ids = await db
      .update(playerEvaluation)
      .set({
        payment_status: PaymentStatus.CANCELLED,
        status: 3,
        rejectremarks: remark || undefined,
        updated_at: new Date(),
      })
      .where(eq(playerEvaluation.id, id))
      .returning();


    await db.insert(admin_payment_logs).values({
      payment_id: paymentData[0].id,
      admin_id: Number(session.user.id),
      action_reason: internalRemark,
      action_type: PaymentStatus.CANCELLED
    })
    //For testing purposes
    // const ids = await db
    //   .select({player_id: playerEvaluation.player_id, coach_id: playerEvaluation.coach_id})
    // .from(playerEvaluation)
    //   .where(eq(playerEvaluation.id, id))

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


    const coachmailmessage = `<p> We apologize that the evaluation requested by ${playerEmail[0].firstName} has been cancelled by the player. No further action is required on your end.</p>

    <p>Reason: "${remark}"</p>`;

    const mailmessage = `<p> We have decided to cancel the evaluation with ${coachEmail[0].firstName} and there are no charges. No further action is required on your end.</p>
    
    <p>Reason: "${remark}"</p> `;


    await axios.post(`http://localhost:3000/api/geolocation/player`, {
            type: "player",
            targetIds: [playerEmail[0].id],
            message: mailmessage,
            subject: "D1 NOTES: Notice of Evaluation Request Cancellation",
            methods: {
            email: true,
            sms: false,
            internal: false,
            },
        });

    await axios.post(`http://localhost:3000/api/geolocation/coach`, {
            type: "coach",
            targetIds: [coachEmail[0].id],
            message: coachmailmessage,
            subject: "D1 NOTES: Notice of Evaluation Request Cancellation",
            methods: {
            email: true,
            sms: false,
            internal: false,
            },
        });


    // Send emails asynchronously to avoid blocking the response
    // const emailPromises = [
    //   sendEmail({
    //     to: playerEmail[0].email,
    //     subject: subject,
    //     text: subject,
    //     html: mailmessage || '',
    //   }),

    //   sendEmail({
    //     to: coachEmail[0].email || '',
    //     subject: subject,
    //     text: subject,
    //     html: coachmailmessage || '',
    //   }),
    // ];

    // Process emails in background
    // Promise.all(emailPromises).catch(error => {
    //   console.error('Email sending error:', error);
    // });

    return NextResponse.json({status: 200});

    } catch (error){
        console.error('Error refunding player:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }

}