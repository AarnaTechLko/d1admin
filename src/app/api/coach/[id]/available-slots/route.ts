// import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/lib/db";
// import { availability, bookings } from "@/lib/schema";
// import { eq, and, gte, notInArray, ne, SQL } from "drizzle-orm";

// export async function GET(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;
//     const coachId = Number(id);

//     if (isNaN(coachId)) {
//       return NextResponse.json({ success: false, message: "Invalid Coach ID" }, { status: 400 });
//     }

//     const { searchParams } = new URL(req.url);
//     const bookingIdParam = searchParams.get("bookingId");
//     const currentBookingId = bookingIdParam ? Number(bookingIdParam) : null;

//     // Exact Current Time (Abhi ka samay)
//     const now = new Date();

//     // 1. Database se Coach ki future availability slots fetch karein
//     let allSlots = await db
//       .select()
//       .from(availability)
//       .where(
//         and(
//           eq(availability.coachId, coachId),
//           gte(availability.startTime, now)
//         )
//       )
//       .orderBy(availability.startTime);

//     console.log(`Initial DB Future Slots Count for Coach ${coachId}:`, allSlots.length);

//     // 🌟 DYNAMIC FALLBACK LOGIC: Agar DB mein koi slot nahi mila
//     if (allSlots.length === 0) {
//       console.log("⚠️ No future slots found in DB. Generating slots based on current time...");

//       // Hum 24 ghante ke slots generate karenge jo abhi ke time se shuru honge
//       const currentHour = now.getHours();
      
//       // Agar din khatam hone wala hai (e.g. 6 PM ke baad), toh direct full next day generate hoga
//       const startHour = currentHour < 18 ? currentHour + 1 : 9; 
      
//       // Target target date decide karein (Agar raat ho gayi hai toh agla din, warna aaj ka bacha hua din)
//       const targetDate = new Date();
//       if (currentHour >= 18) {
//         targetDate.setDate(now.getDate() + 1); // Move to next day
//       }

//       const dateString = targetDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'
//       const endHour = 18; // Shaam ke 6:00 PM tak ke slots

//       for (let hour = startHour; hour < endHour; hour++) {
//         // Slot 1: Hour:00 to Hour:30
//         const slot1Start = new Date(targetDate);
//         slot1Start.setHours(hour, 0, 0, 0);
//         const slot1End = new Date(targetDate);
//         slot1End.setHours(hour, 30, 0, 0);

//         // Slot 2: Hour:30 to Next Hour:00
//         const slot2Start = new Date(targetDate);
//         slot2Start.setHours(hour, 30, 0, 0);
//         const slot2End = new Date(targetDate);
//         slot2End.setHours(hour + 1, 0, 0, 0);

//         // Push formatted slots safely into array
//         allSlots.push({
//           id: Math.floor(Math.random() * -10000),
//           coachId: coachId,
//           date: dateString,
//           startTime: slot1Start.toISOString() as any, 
//           endTime: slot1End.toISOString() as any,
//           timezone: "UTC",
//           createdAt: now.toISOString() as any,
//           updatedAt: now.toISOString() as any,
//         });

//         allSlots.push({
//           id: Math.floor(Math.random() * -10000) - 1,
//           coachId: coachId,
//           date: dateString,
//           startTime: slot2Start.toISOString() as any,
//           endTime: slot2End.toISOString() as any,
//           timezone: "UTC",
//           createdAt: now.toISOString() as any,
//           updatedAt: now.toISOString() as any,
//         });
//       }

//       // Special Case: Agar aaj ka bacha hua din generate kiya tha aur slots kam bane, 
//       // toh safety ke liye FULL NEXT DAY bhi isi array mein niche append kar dete hain
//       if (currentHour < 18) {
//         const nextDay = new Date();
//         nextDay.setDate(now.getDate() + 1);
//         const nextDayString = nextDay.toISOString().split('T')[0];

//         for (let hour = 9; hour < 18; hour++) {
//           const s1 = new Date(nextDay); s1.setHours(hour, 0, 0, 0);
//           const e1 = new Date(nextDay); e1.setHours(hour, 30, 0, 0);
//           const s2 = new Date(nextDay); s2.setHours(hour, 30, 0, 0);
//           const e2 = new Date(nextDay); e2.setHours(hour + 1, 0, 0, 0);

//           allSlots.push({
//             id: Math.floor(Math.random() * -20000),
//             coachId: coachId,
//             date: nextDayString,
//             startTime: s1.toISOString() as any,
//             endTime: e1.toISOString() as any,
//             timezone: "UTC",
//             createdAt: now.toISOString() as any,
//             updatedAt: now.toISOString() as any,
//           });

//           allSlots.push({
//             id: Math.floor(Math.random() * -20000) - 1,
//             coachId: coachId,
//             date: nextDayString,
//             startTime: s2.toISOString() as any,
//             endTime: e2.toISOString() as any,
//             timezone: "UTC",
//             createdAt: now.toISOString() as any,
//             updatedAt: now.toISOString() as any,
//           });
//         }
//       }
//     }

//     // 2. Active bookings conditions (Kahi generated dynamic slots booked waale se crash na karein)
//     const bookingConditions: (SQL | undefined)[] = [
//       eq(bookings.coach_id, coachId),
//       notInArray(bookings.status, ["cancelled", "declined", "completed"])
//     ];

//     if (currentBookingId !== null && !isNaN(currentBookingId)) {
//       bookingConditions.push(ne(bookings.id, currentBookingId));
//     }

//     const takenBookings = await db
//       .select({ startTime: bookings.start_time, endTime: bookings.end_time })
//       .from(bookings)
//       .where(and(...bookingConditions));

//     // 3. Busy slots ka Set banayein
//     const takenSet = new Set(
//       takenBookings
//         .filter((b) => b.startTime != null && b.endTime != null)
//         .map((b) => {
//           const start = new Date(b.startTime!).toISOString();
//           const end = new Date(b.endTime!).toISOString();
//           return `${start}_${end}`;
//         })
//     );

//     // 4. Free slots filter out karein
//     const freeSlots = allSlots.filter((slot) => {
//       if (slot.startTime == null || slot.endTime == null) return false;
//       const start = new Date(slot.startTime).toISOString();
//       const end = new Date(slot.endTime).toISOString();
//       const key = `${start}_${end}`;
//       return !takenSet.has(key);
//     });

//     return NextResponse.json({ slots: freeSlots });
//   } catch (err: any) {
//     console.error("🔴 available-slots error:", err);
//     return NextResponse.json({ success: false, message: err?.message ?? "Failed to fetch slots." }, { status: 500 });
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { availability, bookings } from "@/lib/schema";
import { eq, and, gte, notInArray, ne, SQL } from "drizzle-orm";
type RawSlot = {
  id: number | string;
  coachId?: number | string | null;
  coach_id?: number | string | null;
  date?: string | Date | null;
  startTime?: string | Date | null;
  endTime?: string | Date | null;
  timezone?: string | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
};
type Slot = {
  id: number;
  coachId: number;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const coachId = Number(id);

    if (isNaN(coachId)) {
      return NextResponse.json(
        { success: false, message: "Invalid Coach ID" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const bookingIdParam = searchParams.get("bookingId");
    const currentBookingId = bookingIdParam ? Number(bookingIdParam) : null;

    const now = new Date();

    // 1. Fetch DB slots (map DB Date fields to ISO strings to match Slot type)
    const rawSlots = await db
      .select()
      .from(availability)
      .where(
        and(
          eq(availability.coachId, coachId),
          gte(availability.startTime, now)
        )
      )
      .orderBy(availability.startTime);

    const allSlots: Slot[] = rawSlots.map((s: RawSlot) => ({
      id: Number(s.id),
      coachId: Number(s.coachId ?? s.coach_id),
      date: typeof s.date === "string" ? s.date : (s.date ? new Date(s.date).toISOString().split("T")[0] : ""),
      startTime: s.startTime ? new Date(s.startTime).toISOString() : "",
      endTime: s.endTime ? new Date(s.endTime).toISOString() : "",
      timezone: s.timezone ?? "UTC",
      createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: s.updatedAt ? new Date(s.updatedAt).toISOString() : new Date().toISOString(),
    }));

    console.log(
      `Initial DB Future Slots Count for Coach ${coachId}:`,
      allSlots.length
    );

    // 2. Fallback generation if no DB slots
    if (allSlots.length === 0) {
      console.log(
        "⚠️ No future slots found in DB. Generating fallback slots..."
      );

      const currentHour = now.getHours();
      const startHour = currentHour < 18 ? currentHour + 1 : 9;

      const targetDate = new Date();
      if (currentHour >= 18) {
        targetDate.setDate(now.getDate() + 1);
      }

      const dateString = targetDate.toISOString().split("T")[0];
      const endHour = 18;

      for (let hour = startHour; hour < endHour; hour++) {
        const slot1Start = new Date(targetDate);
        slot1Start.setHours(hour, 0, 0, 0);
        const slot1End = new Date(targetDate);
        slot1End.setHours(hour, 30, 0, 0);

        const slot2Start = new Date(targetDate);
        slot2Start.setHours(hour, 30, 0, 0);
        const slot2End = new Date(targetDate);
        slot2End.setHours(hour + 1, 0, 0, 0);

        allSlots.push({
          id: Date.now() + hour,
          coachId,
          date: dateString,
          startTime: slot1Start.toISOString(),
          endTime: slot1End.toISOString(),
          timezone: "UTC",
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        });

        allSlots.push({
          id: Date.now() + hour + 1000,
          coachId,
          date: dateString,
          startTime: slot2Start.toISOString(),
          endTime: slot2End.toISOString(),
          timezone: "UTC",
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        });
      }

      if (currentHour < 18) {
        const nextDay = new Date();
        nextDay.setDate(now.getDate() + 1);

        const nextDayString = nextDay.toISOString().split("T")[0];

        for (let hour = 9; hour < 18; hour++) {
          const s1 = new Date(nextDay);
          s1.setHours(hour, 0, 0, 0);
          const e1 = new Date(nextDay);
          e1.setHours(hour, 30, 0, 0);

          const s2 = new Date(nextDay);
          s2.setHours(hour, 30, 0, 0);
          const e2 = new Date(nextDay);
          e2.setHours(hour + 1, 0, 0, 0);

          allSlots.push({
            id: Date.now() + hour + 2000,
            coachId,
            date: nextDayString,
            startTime: s1.toISOString(),
            endTime: e1.toISOString(),
            timezone: "UTC",
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
          });

          allSlots.push({
            id: Date.now() + hour + 3000,
            coachId,
            date: nextDayString,
            startTime: s2.toISOString(),
            endTime: e2.toISOString(),
            timezone: "UTC",
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
          });
        }
      }
    }

    // 3. Fetch active bookings
    const bookingConditions: (SQL | undefined)[] = [
      eq(bookings.coach_id, coachId),
      notInArray(bookings.status, ["cancelled", "declined", "completed"]),
    ];

    if (currentBookingId !== null && !isNaN(currentBookingId)) {
      bookingConditions.push(ne(bookings.id, currentBookingId));
    }

    const takenBookings = await db
      .select({
        startTime: bookings.start_time,
        endTime: bookings.end_time,
      })
      .from(bookings)
      .where(and(...bookingConditions));

    // 4. Build taken set
    const takenSet = new Set(
      takenBookings
        .filter((b) => b.startTime && b.endTime)
        .map((b) => {
          const start = new Date(b.startTime!).toISOString();
          const end = new Date(b.endTime!).toISOString();
          return `${start}_${end}`;
        })
    );

    // 5. Filter free slots
    const freeSlots = allSlots.filter((slot) => {
      const start = new Date(slot.startTime).toISOString();
      const end = new Date(slot.endTime).toISOString();
      return !takenSet.has(`${start}_${end}`);
    });

    return NextResponse.json({ slots: freeSlots });
  } catch (err: unknown) {
    console.error("🔴 available-slots error:", err);

    const message =
      err instanceof Error
        ? err.message
        : "Failed to fetch slots.";

    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}