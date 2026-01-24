import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { payments, discount_coupon } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { getStripe } from '@/lib/stripe.server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID required' }, { status: 400 });
    }

    const paymentData = await db
      .select({
        evaluationId: payments.evaluation_id,
        coachId: payments.coach_id,
        playerId: payments.player_id,
        originalAmount: payments.original_amount,
        currentAmount: payments.amount,
        paymentId: payments.id,
        intentId: payments.intent_id,
        couponId: payments.coupon_code_id
      })
      .from(payments)
      .where(eq(payments.id, Number(paymentId)))
      .limit(1);

    if (!paymentData.length) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    let clientSecret = null;
    
    // If PaymentIntent already exists, get its client_secret
    if (paymentData[0].intentId) {
      try {
        const stripe = getStripe();
        if (stripe) {
          const existingIntent = await stripe.paymentIntents.retrieve(paymentData[0].intentId);
          clientSecret = existingIntent.client_secret;
        }
      } catch (error) {
        console.log('Existing PaymentIntent not found in Stripe, Error: ', String(error));
      }
    }

    // Get coupon data if coupon is applied
    let appliedCoupon = null;
    if (paymentData[0].couponId) {
      const couponData = await db
        .select({
          id: discount_coupon.id,
          name: discount_coupon.name,
          discount: discount_coupon.discount,
          count: discount_coupon.count
        })
        .from(discount_coupon)
        .where(eq(discount_coupon.id, paymentData[0].couponId))
        .limit(1);
      
      if (couponData.length) {
        appliedCoupon = couponData[0];
      }
    }

    return NextResponse.json({
      evaluationId: paymentData[0].evaluationId,
      coachId: paymentData[0].coachId,
      playerId: paymentData[0].playerId,
      originalAmount: Number(paymentData[0].originalAmount),
      currentAmount: Number(paymentData[0].currentAmount || paymentData[0].originalAmount),
      paymentId: paymentData[0].paymentId,
      appliedCoupon,
      clientSecret
    });
  } catch (error) {
    console.error('Payment data fetch error: ', String(error));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}