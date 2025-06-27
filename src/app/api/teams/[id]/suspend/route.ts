import { db } from '@/lib/db';
import { teams, suspendlog } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { suspend_days, suspend } = await req.json();
    const id = Number((await params).id);

    if (isNaN(id) || suspend_days == null || suspend_days < 0) {
      return new NextResponse('Invalid data', { status: 400 });
    }

    // ✅ Suspension condition: suspend === 0 OR suspend_days > 0
    if (suspend === 0 || suspend_days > 0) {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + suspend_days);

      const startDateStr = today.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      await db
        .update(teams)
        .set({
          suspend: 0,
          suspend_days,
          suspend_start_date: startDateStr,
          suspend_end_date: endDateStr,
        })
        .where(eq(teams.id, id));

      await db.insert(suspendlog).values({
        user_id: id,
        type: 'team',
        suspend_start_date: startDateStr,
        suspend_end_date: endDateStr,
        created_at: new Date(),
      });

      return NextResponse.json({ success: true, action: 'suspended' });
    } else {
      // ✅ Unsuspend otherwise
      await db
        .update(teams)
        .set({
          suspend: 1,
          suspend_days: null,
          suspend_start_date: null,
          suspend_end_date: null,
        })
        .where(eq(teams.id, id));

    


      return NextResponse.json({ success: true, action: 'unsuspended' });
    }
  } catch (error) {
    console.error('Suspend/Unsuspend POST update failed', error);
    return new NextResponse('Error updating suspension', { status: 500 });
  }
}