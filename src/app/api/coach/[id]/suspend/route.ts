
// import { db } from '@/lib/db';
// import { coaches, suspendlog } from '@/lib/schema';
// import { eq } from 'drizzle-orm';
// import { NextRequest, NextResponse } from 'next/server';

// export async function POST(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { suspend_days, suspend } = await req.json();
//     const coachId = Number((await params).id);

//     if (isNaN(coachId) || suspend_days == null || suspend_days < 0) {
//       return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
//     }

//     const today = new Date();
//     const startDateStr = today.toISOString().split('T')[0];

//     if (suspend === 0 || suspend_days > 0) {
//       // ✅ Suspend coach
//       const endDate = new Date(today);
//       endDate.setDate(today.getDate() + suspend_days);
//       const endDateStr = endDate.toISOString().split('T')[0];

//       await db
//         .update(coaches)
//         .set({
//           suspend: 0,
//           suspend_days,
//           suspend_start_date: startDateStr,
//           suspend_end_date: endDateStr,
//         })
//         .where(eq(coaches.id, coachId));

//     await db.insert(suspendlog).values({
//         user_id: coachId,
//         type: 'coach',
//         suspend_start_date: startDateStr,
//         suspend_end_date: endDateStr,
//         created_at: new Date(),
//       });
//       return NextResponse.json({ success: true, action: 'suspended' });
//     } else {
//       // ✅ Unsuspend coach
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
//   } catch (error) {
//     console.error('Suspend/Unsuspend POST update failed:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { coaches, suspendlog } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { sendEmail } from "@/lib/helpers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { suspend_days, suspend } = await req.json();
    const coachId = Number((await params).id);

    if (isNaN(coachId)) {
      return NextResponse.json({ error: 'Invalid coach ID' }, { status: 400 });
    }

    const coach = await db.query.coaches.findFirst({
      where: eq(coaches.id, coachId),
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    const today = new Date();
    const startDateStr = today.toISOString().split('T')[0];

 
      // Suspend coach
      if (suspend === 0 || suspend_days > 0) {
       

      const endDate = new Date(today);
      endDate.setDate(today.getDate() + suspend_days);
      const endDateStr = endDate.toISOString().split('T')[0];

      await db.update(coaches).set({
        suspend: 0,
        suspend_days,
        suspend_start_date: startDateStr,
        suspend_end_date: endDateStr,
      }).where(eq(coaches.id, coachId));

      await db.insert(suspendlog).values({
        user_id: coachId,
        type: 'coach',
        suspend_start_date: startDateStr,
        suspend_end_date: endDateStr,
        created_at: new Date(),
      });

      // Send suspension email
      if (coach.email) {
        try {
          await sendEmail({
            to: coach.email,
            subject: 'Your Coach Account Suspension',
            html: `
              <p>Hello <b>${coach.firstName ?? 'Coach'}</b>,</p>
              <p>Your <strong>Coach</strong> account has been <strong>suspended</strong>.</p>
              <p><b>Suspension Details:</b></p>
              <ul>
                <li><b>Start Date:</b> ${startDateStr}</li>
                <li><b>End Date:</b> ${endDateStr}</li>
                <li><b>Duration:</b> ${suspend_days} day(s)</li>
              </ul>
              <p>Please contact admin for more information.</p>
              <br/>
              <p>Regards,<br/>Admin Team</p>
            `,
            text: `Your coach account has been suspended from ${startDateStr} to ${endDateStr} (${suspend_days} day(s)).`,
          });
        } catch (emailError) {
          console.error('Failed to send suspension email:', emailError);
        }
      }

      return NextResponse.json({ success: true, action: 'suspended' });
    } else {
      // Unsuspend coach
      await db.update(coaches).set({
        suspend: 1,
        suspend_days: null,
        suspend_start_date: null,
        suspend_end_date: null,
      }).where(eq(coaches.id, coachId));

      return NextResponse.json({ success: true, action: 'unsuspended' });
    }

  } catch (error) {
    console.error('Suspend/Unsuspend failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

