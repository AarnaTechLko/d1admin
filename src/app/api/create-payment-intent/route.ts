import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe.server';
import { db } from '@/lib/db';
import { payments, coachearnings, discount_coupon, admin_payment_logs } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/Auth';
import { PaymentStatus } from '@/app/types/types';

async function getCouponDiscount(couponId: number): Promise<number> {
  const coupon = await db
    .select({ discount: discount_coupon.discount })
    .from(discount_coupon)
    .where(eq(discount_coupon.id, couponId))
    .limit(1);
  return coupon[0]?.discount ? Number(coupon[0].discount) : 0;
}

export async function POST(req: NextRequest) {
  try {
    const { amount, captureMethod, evaluationId, coachId, playerId, paymentId, couponId, internalRemark } = await req.json();

    const session = await getServerSession(authOptions);

    if (!session || !session.user.id) {
      throw new Error('Token To Session User is not authorized');
    }

    const stripe = getStripe();

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not initialized' }, { status: 500 });
    }

    if (!internalRemark) {
      return NextResponse.json({ error: 'Internal Remarks are required' }, { status: 400 });
    }

    // Check if PaymentIntent already exists for this payment
    const existingPayment = await db
      .select({ intent_id: payments.intent_id })
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);
    
    if (existingPayment[0]?.intent_id) {
      console.log('PaymentIntent already exists:', existingPayment[0].intent_id);
      try {
        // Return existing client secret
        const existingIntent = await stripe.paymentIntents.retrieve(existingPayment[0].intent_id);
        return NextResponse.json({ clientSecret: existingIntent.client_secret });
      } catch (error) {
        console.log('Existing PaymentIntent not found in Stripe, creating new one, Error: ', String(error));
        // If PaymentIntent doesn't exist in Stripe, continue to create new one
      }
    }

    console.log('Creating new PaymentIntent for payment:', paymentId);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      capture_method: captureMethod || 'automatic',
      payment_method_types: ['card'],
      metadata: {
        evaluationId: evaluationId.toString(),
        coachId: coachId.toString(),
        playerId: playerId.toString(),
        paymentId: paymentId.toString(),
        couponId: couponId?.toString() || '',
      },
    });
    console.log('Created PaymentIntent:', paymentIntent.id);

    // Update payment record with intent ID and coupon data
    const updateData = {
      intent_id: paymentIntent.id,
      discount: couponId ? (await getCouponDiscount(couponId)).toString() : '0',
      coupon_code_id: couponId || null,
      amount: amount.toString()
    };
    
    await db
      .update(payments)
      .set(updateData)
      .where(eq(payments.id, paymentId));

    // console.log("ID: ", couponId);

    await db
      .update(discount_coupon)
      .set({
        count: sql`discount_coupon.count + 1`,
      })
      .where(eq(discount_coupon.id, couponId))

    // Update coachearnings if exists
    if (evaluationId) {
      await db
        .update(coachearnings)
        .set({
          transaction_id: paymentIntent.id,
          status: 'EVAL_IN_PROGRESS'
        })
        .where(eq(coachearnings.evaluation_id, evaluationId));
    }

    await db.insert(admin_payment_logs).values({
      payment_id: paymentId,
      admin_id: Number(session.user.id),
      action_reason: internalRemark,
      action_type: PaymentStatus.AUTHORIZED
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Payment intent creation error:', String(error));
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}