// import { db } from '@/lib/db';
// import { users, suspendlog } from '@/lib/schema';
// import { eq } from 'drizzle-orm';
// import { NextRequest, NextResponse } from 'next/server';

// export async function POST(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { suspend_days, suspend } = await req.json();
//     const playerId = Number((await params).id);

//     if (isNaN(playerId) || suspend_days == null || suspend_days < 0) {
//       return new NextResponse('Invalid data', { status: 400 });
//     }
//      const player = await db.query.users.findFirst({
//       where: eq(users.id, playerId),
//     });

//     if (player?.suspend === 0 && player.suspend_end_date) {
//       const today = new Date();
//       const endDate = new Date(player.suspend_end_date);

//       if (today > endDate) {
//         // Auto-unsuspend
//         await db
//           .update(users)
//           .set({
//             suspend: 1,
//             suspend_days: null,
//             suspend_start_date: null,
//             suspend_end_date: null,
//           })
//           .where(eq(users.id, playerId));

//         return NextResponse.json({
//           success: true,
//           action: 'auto-unsuspended',
//         });
//       }
//     }

//     const today = new Date();
//     const endDate = new Date(today);
//     endDate.setDate(today.getDate() + suspend_days);

//     const startDateStr = today.toISOString().split('T')[0];
//     const endDateStr = endDate.toISOString().split('T')[0];

//     if (suspend === 0 || suspend_days > 0) {
//       // ✅ Suspend logic: update user and log it
//       await db
//         .update(users)
//         .set({
//           suspend: 0,
//           suspend_days,
//           suspend_start_date: startDateStr,
//           suspend_end_date: endDateStr,
//         })
//         .where(eq(users.id, playerId));

    
//       await db.insert(suspendlog).values({
//         user_id: playerId,
//         type: 'player',
//         suspend_start_date: startDateStr,
//         suspend_end_date: endDateStr,
//         created_at: new Date(),
//       });


//       return NextResponse.json({ success: true, action: 'suspended' });
//     } else {
//       // ✅ Unsuspend logic: update user only
//       await db
//         .update(users)
//         .set({
//           suspend: 1,
//           suspend_days: null,
//           suspend_start_date: null,
//           suspend_end_date: null,
//         })
//         .where(eq(users.id, playerId));
    

//       return NextResponse.json({ success: true, action: 'unsuspended' });
//     }
//   } catch (error) {
//     console.error('Suspend/Unsuspend POST update failed', error);
//     return new NextResponse('Error updating suspension', { status: 500 });
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, suspendlog } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { sendEmail } from "@/lib/helpers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { suspend_days, suspend } = await req.json();
    const playerId = Number((await params).id);

    if (isNaN(playerId)) {
      return NextResponse.json({ error: 'Invalid player ID' }, { status: 400 });
    }

    const player = await db.query.users.findFirst({
      where: eq(users.id, playerId),
    });

    if (!player) {
      return NextResponse.json({ error: 'player not found' }, { status: 404 });
    }

    const today = new Date();
    const startDateStr = today.toISOString().split('T')[0];

 
      // Suspend player
      if (suspend === 0 || suspend_days > 0) {
       

      const endDate = new Date(today);
      endDate.setDate(today.getDate() + suspend_days);
      const endDateStr = endDate.toISOString().split('T')[0];

      await db.update(users).set({
        suspend: 0,
        suspend_days,
        suspend_start_date: startDateStr,
        suspend_end_date: endDateStr,
      }).where(eq(users.id, playerId));

      await db.insert(suspendlog).values({
        user_id: playerId,
        type: 'player',
        suspend_start_date: startDateStr,
        suspend_end_date: endDateStr,
        created_at: new Date(),
      });

      // Send suspension email
      if (player.email) {
        try {
          await sendEmail({
            to: player.email,
            subject: 'Your player Account Suspension',
            html: `
              <p>Hello <b>${player.first_name ?? 'player'}</b>,</p>
              <p>Your <strong>player</strong> account has been <strong>suspended</strong>.</p>
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
            text: `Your player account has been suspended from ${startDateStr} to ${endDateStr} (${suspend_days} day(s)).`,
          });
        } catch (emailError) {
          console.error('Failed to send suspension email:', emailError);
        }
      }

      return NextResponse.json({ success: true, action: 'suspended' });
    } else {
      // Unsuspend player
      await db.update(users).set({
        suspend: 1,
        suspend_days: null,
        suspend_start_date: null,
        suspend_end_date: null,
      }).where(eq(users.id, playerId));

      return NextResponse.json({ success: true, action: 'unsuspended' });
    }

  } catch (error) {
    console.error('Suspend/Unsuspend failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
