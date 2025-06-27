
// import { db } from '@/lib/db';
// import { coaches } from '@/lib/schema';
// import { eq } from 'drizzle-orm';
// import { NextRequest, NextResponse } from 'next/server';

// export async function POST(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { suspend_days } = await req.json();
//     const coachId = Number(params.id);

//     if (isNaN(coachId) || suspend_days == null || suspend_days < 0) {
//       return new NextResponse('Invalid data', { status: 400 });
//     }

//     // UNSUSPEND
//     if (suspend_days === 0) {
//       await db
//         .update(coaches)
//         .set({
//           suspend: 1,
//           suspend_days: null,
//           suspend_start_date: null,
//           suspend_end_date: null,
//         })
//         .where(eq(coaches.id, coachId));

//       return NextResponse.json({ success: true, action: 'unsuspended' });
//     }

//     // SUSPEND
//     const today = new Date();
//     const endDate = new Date(today);
//     endDate.setDate(today.getDate() + suspend_days);

//     const startDateStr = today.toISOString().split('T')[0]; // 'YYYY-MM-DD'
//     const endDateStr = endDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'

//     await db
//       .update(coaches)
//       .set({
//         suspend: 0,
//         suspend_days,
//         suspend_start_date: startDateStr,
//         suspend_end_date: endDateStr,
//       })
//       .where(eq(coaches.id, coachId));

//     return NextResponse.json({ success: true, action: 'suspended' });
//   } catch (error) {
//     console.error('Suspend/Unsuspend POST update failed', error);
//     return new NextResponse('Error updating suspension', { status: 500 });
//   }
// }

import { db } from '@/lib/db';
import { coaches, suspendlog } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { suspend_days, suspend } = await req.json();
    const coachId = Number((await params).id);

    if (isNaN(coachId) || suspend_days == null || suspend_days < 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const today = new Date();
    const startDateStr = today.toISOString().split('T')[0];

    if (suspend === 0 || suspend_days > 0) {
      // ✅ Suspend coach
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + suspend_days);
      const endDateStr = endDate.toISOString().split('T')[0];

      await db
        .update(coaches)
        .set({
          suspend: 0,
          suspend_days,
          suspend_start_date: startDateStr,
          suspend_end_date: endDateStr,
        })
        .where(eq(coaches.id, coachId));

    await db.insert(suspendlog).values({
        user_id: coachId,
        type: 'coach',
        suspend_start_date: startDateStr,
        suspend_end_date: endDateStr,
        created_at: new Date(),
      });
      return NextResponse.json({ success: true, action: 'suspended' });
    } else {
      // ✅ Unsuspend coach
      await db
        .update(coaches)
        .set({
          suspend: 1,
          suspend_days: null,
          suspend_start_date: null,
          suspend_end_date: null,
        })
        .where(eq(coaches.id, coachId));
       

      return NextResponse.json({ success: true, action: 'unsuspended' });
    }
  } catch (error) {
    console.error('Suspend/Unsuspend POST update failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
