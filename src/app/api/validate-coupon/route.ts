import { db } from '@/lib/db';
import { discount_coupon } from '@/lib/schema';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { couponCode, coachId } = await req.json();

    if (!couponCode || !coachId) {
      return NextResponse.json(
        { error: 'Coupon code and coach ID are required' },
        { status: 400 }
      );
    }

    const coupon = await db
      .select()
      .from(discount_coupon)
      .where(
        and(
          eq(discount_coupon.name, couponCode),
          eq(discount_coupon.coach_id, coachId),
          eq(discount_coupon.isActive, true),
          eq(discount_coupon.marked_delete, false)
        )
      )
      .limit(1);

    if (!coupon.length) {
      return NextResponse.json(
        { error: 'Invalid coupon code or coupon does not belong to this coach' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon[0].id,
        name: coupon[0].name,
        discount: coupon[0].discount,
        count: coupon[0].count
      }
    });
  } catch (error) {
    console.error('Coupon validation error:', String(error));
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}