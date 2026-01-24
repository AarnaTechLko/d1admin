import { db } from '@/lib/db';
// import Stripe from "stripe";
import { payments, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe.server';
import { PaymentStatus } from '@/app/types/types';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2025-02-24.acacia",
// });

export async function POST(req: NextRequest) {
  try {
    const { request } = await req.json();
    const stripe = getStripe();

    if (!stripe) {
      return NextResponse.json(
        { message: 'Stripe client is not initialized.' },
        { status: 400 },
      );
    }

    if (!request.playerId){

      return NextResponse.json(
        { message: 'Player Id was not passed in.' },
        { status: 404 },
      );

    }

    if (!request.coachId){
      return NextResponse.json(
        { message: 'Coach Id was not passed in.' },
        { status: 404 },
      );
    }


    // Calculate final amount with coupon discount
    let finalAmount = Number(request.amount);
    if (request.couponId && request.discount) {
      const discountAmount = (finalAmount * Number(request.discount)) / 100;
      finalAmount = finalAmount - discountAmount;
    }

    console.log("Payment Id: ", request);

    // Get existing payment record
    const existingPayment = await db
      .select()
      .from(payments)
      .where(eq(payments.id, request.paymentId))
      .limit(1);

    if (!existingPayment.length) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 },
      );
    }

    const payment = existingPayment[0];

    // If payment intent exists, try to authorize it
    if (payment.intent_id) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(payment.intent_id);
        
        // Check if already authorized or succeeded
        if (paymentIntent.status === 'requires_capture' || paymentIntent.status === 'succeeded') {
          await db
            .update(payments)
            .set({ status: PaymentStatus.AUTHORIZED })
            .where(eq(payments.id, request.paymentId));

          return NextResponse.json({
            message: 'Payment authorized',
            status: 'success',
          });
        }
      } catch (error) {
        console.log('PaymentIntent not found or invalid, will show payment screen, Error: ', String(error));
      }
    }

    // Validate player exists
    const findPlayerDetails = await db
      .select()
      .from(users)
      .where(eq(users.id, request.playerId))
      .execute();

    if (!findPlayerDetails.length) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 },
      );
    }

    // Update payment record with discount info
    await db
      .update(payments)
      .set({ 
        status: PaymentStatus.PENDING,
        discount: request.discount || '0',
        coupon_code_id: request.couponId || null,
        amount: finalAmount.toString()
      })
      .where(eq(payments.id, request.paymentId));

    // Return redirect URL to payment page for new card entry
    const paymentUrl = `/payment?paymentId=${request.paymentId}`;
    
    return NextResponse.json({
      message: 'Payment pending',
      status: 'pending',
      redirectUrl: paymentUrl,
    });
  } catch (error) {
    console.error('Stripe error:', error);
    return NextResponse.json(
      { error: error || 'Internal server error' },
      { status: 500 },
    );
  }
}
