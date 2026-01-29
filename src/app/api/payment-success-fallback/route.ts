import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  payments,
  playerEvaluation,
  coachearnings,
//   discount_coupon,
  coaches,
  chats,
  messages,
  users,
} from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { PaymentStatus } from '@/app/types/types';
import { COMMISSIONPERCENTAGE } from '@/lib/constants';
import { getStripe } from '@/lib/stripe.server';
import { sendEmail } from '@/lib/email-service';
// import axios from "axios";

interface update {
    status: string;
    coupon_code_id?: number;
    intent_id: string;
}


export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId, couponId } = await req.json();
    console.log('Fallback API called with:', { paymentIntentId, couponId });

    if (!paymentIntentId) {
      console.error('Missing paymentIntentId');
      return NextResponse.json(
        { error: 'PaymentIntent ID required' },
        { status: 400 },
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      console.error('Stripe not initialized');
      return NextResponse.json(
        { error: 'Stripe not initialized' },
        { status: 500 },
      );
    }

    // VERIFY WITH STRIPE FIRST - Check if payment is actually authorized
    console.log('Verifying PaymentIntent status with Stripe:', paymentIntentId);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    console.log('Stripe PaymentIntent status:', {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      capture_method: paymentIntent.capture_method,
    });

    // Only proceed if payment is actually authorized/succeeded
    if (
      paymentIntent.status !== 'requires_capture' &&
      paymentIntent.status !== 'succeeded'
    ) {
      console.error(
        'PaymentIntent not authorized. Status:',
        paymentIntent.status,
      );
      return NextResponse.json(
        {
          error: 'Payment not authorized',
          stripeStatus: paymentIntent.status,
        },
        { status: 400 },
      );
    }

    console.log('✅ PaymentIntent verified as authorized/succeeded');

    // Find payment by intent_id
    console.log('Searching for payment with intent_id:', paymentIntentId);
    let paymentData = await db
      .select()
      .from(payments)
      .where(eq(payments.intent_id, paymentIntentId))
      .limit(1);

    console.log(
      'Direct search result:',
      paymentData.length > 0 ? 'Found' : 'Not found',
    );

    // If not found by intent_id, try to find by most recent pending payment
    if (!paymentData.length) {
      console.log(
        'Payment not found by intent_id, searching for recent pending payments...',
      );

      const recentPending = await db
        .select()
        .from(payments)
        .where(eq(payments.status, PaymentStatus.PENDING))
        .orderBy(desc(payments.created_at))
        .limit(5);

      console.log('Recent pending payments found:', recentPending.length);

      if (recentPending.length > 0) {
        paymentData = [recentPending[0]];
        console.log('Using most recent pending payment:', paymentData[0].id);

        // Update this payment with the new intent_id
        const updateResult = await db
          .update(payments)
          .set({ intent_id: paymentIntentId })
          .where(eq(payments.id, paymentData[0].id))
          .returning();

        console.log('Updated payment with new intent_id:', updateResult);
      }
    }

    if (!paymentData.length) {
      console.error('No payment found to update');
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const payment = paymentData[0];
    console.log('Processing payment:', {
      id: payment.id,
      status: payment.status,
      intent_id: payment.intent_id,
      amount: payment.amount,
    });

    // Update payment status if not already updated
    if (payment.status === PaymentStatus.PENDING) {
      const updateData:update  = {
        status: PaymentStatus.AUTHORIZED,
        intent_id: paymentIntentId as string,
      };

      if (couponId) {
        updateData.coupon_code_id = Number(couponId);
        console.log('Adding coupon ID to update:', couponId);
      }

      console.log(
        'Updating payment status to AUTHORIZED with data:',
        updateData,
      );

      const paymentUpdateResult = await db
        .update(payments)
        .set(updateData)
        .where(eq(payments.id, payment.id))
        .returning();

      console.log('Payment status update result:', paymentUpdateResult);

      // Update evaluation status
      console.log(
        'Updating evaluation status for evaluation_id:',
        payment.evaluation_id,
      );
      const evalUpdateResult = await db
        .update(playerEvaluation)
        .set({
          payment_status: PaymentStatus.AUTHORIZED,
          last_updated_by_id: payment.player_id,
          updated_at: new Date(),
        })
        .where(eq(playerEvaluation.id, payment.evaluation_id))
        .returning();

      console.log('Evaluation status update result:', evalUpdateResult);

      // Create coachearnings if not exists
      const existingEarnings = await db
        .select()
        .from(coachearnings)
        .where(eq(coachearnings.evaluation_id, payment.evaluation_id))
        .limit(1);

      console.log('Existing earnings found:', existingEarnings.length);

      if (!existingEarnings.length) {
        // Check for commission rate in coaches table first
        const coachCommissionRate = await db
          .select({ percentage: coaches.percentage })
          .from(coaches)
          .where(eq(coaches.id, payment.coach_id))
          .limit(1);

        // Use coach's rate if exists and not null, otherwise use constant
        const commissionRate =
          coachCommissionRate[0]?.percentage &&
          Number(coachCommissionRate[0].percentage) > 0
            ? Number(coachCommissionRate[0].percentage)
            : COMMISSIONPERCENTAGE;

        // Use actual amount from Stripe (handles discounts properly)
        const actualAmountPaid = paymentIntent.amount / 100; // Convert from cents
        const companycommission = commissionRate * (actualAmountPaid / 100);
        const coachPart = actualAmountPaid - companycommission;

        console.log('Creating coach earnings:', {
          actualAmountPaid,
          commissionRate,
          companycommission,
          coachPart,
        });

        const earningsResult = await db
          .insert(coachearnings)
          .values({
            coach_id: payment.coach_id,
            evaluation_id: payment.evaluation_id,
            evaluation_title: `Evaluation for Player ${payment.player_id}`,
            player_id: payment.player_id,
            company_amount: companycommission.toString(),
            commision_rate: commissionRate.toString(),
            commision_amount: coachPart.toString(),
            status: PaymentStatus.EVAL_CREATED,
            transaction_id: paymentIntentId,
          })
          .returning();

        console.log('Coach earnings created:', earningsResult);
      }

      // Send emails after successful payment processing
      const coachData = await db
        .select()
        .from(coaches)
        .where(eq(coaches.id, payment.coach_id));
      const playerData = await db
        .select()
        .from(users)
        .where(eq(users.id, payment.player_id));

      if (coachData.length > 0 && playerData.length > 0) {
        const coach = coachData[0];
        const player = playerData[0];


        // const mailmessage =  `<p>Dear ${player.first_name}, </p> <p>You have sent an Evaluation Request to ${coach.firstName}.</p><p>${coach.firstName} can view your full profile details and has 24 hours to Accept or Decline the request, or the request will be voided.</p><p>During this time, within the Evaluation Tracker in your Dashboard, you may also cancel the request for a full refund.</p>`

        // await axios.post(`http://localhost:3000/api/geolocation/player`, {
        //         type: "player",
        //         targetIds: [player.id],
        //         message: mailmessage,
        //         subject: "D1 Notes: Evaluation Request Received from ${player.first_name}",
        //         methods: {
        //         email: true,
        //         sms: false,
        //         internal: false,
        //         },
        //     });

        // Create chat and message
        const chatFriend = {
          playerId: payment.player_id,
          coachId: payment.coach_id,
          club_id: 0,
        };

        const message = `You have received an Evaluation Request from me.`;
        const insertChatfriend = await db
          .insert(chats)
          .values(chatFriend)
          .returning();

        const userValues = {
          senderId: payment.player_id,
          receiver_id: payment.coach_id,
          chatId: insertChatfriend[0].id,
          message: message,
          club_id: 0,
        };

        await db.insert(messages).values(userValues);

        // Send emails
        if (coach.email && player.email) {
          setImmediate(async () => {
            try {
              await sendEmail({
                to: coach.email!,
                subject: `D1 Notes: Evaluation Request Received from ${player.first_name}`,
                html: `<p>Dear ${coach.firstName},</p> <p> You have received an Evaluation Request from ${player.first_name} and have temporary access to view profile details. Login to your Coach account and view the Evaluation Tracker in your Dashboard to Accept or Decline the request. You have 24 hours to decide before the request is voided.</p>`,
              });

              await sendEmail({
                to: player.email,
                subject: 'D1 Notes: Evaluation Request Sent',
                html: `<p>Dear ${player.first_name}, </p> <p>You have sent an Evaluation Request to ${coach.firstName}.</p><p>${coach.firstName} can view your full profile details and has 24 hours to Accept or Decline the request, or the request will be voided.</p><p>During this time, within the Evaluation Tracker in your Dashboard, you may also cancel the request for a full refund.</p>`,
              });
            } catch (emailError) {
              console.error('Fallback email error:', emailError);
            }
          });
        }
      }

      console.log('Payment processing completed successfully');

    } else {
      console.log('Payment already processed, status:', payment.status);
    }

    return NextResponse.json({
      success: true,
      stripeStatus: paymentIntent.status,
      amount: paymentIntent.amount / 100,
    });
  } catch (error) {
    console.error('Payment success fallback error:', String(error));
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
