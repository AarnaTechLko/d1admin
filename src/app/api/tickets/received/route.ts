// import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/lib/db";
// import { ticket, admin } from "@/lib/schema";
// import { eq, SQL, or, ilike, and, gte } from "drizzle-orm";


// export async function GET(req: NextRequest) {

//     try {
//         const url = new URL(req.url);
//         const user_id = url.searchParams.get("userId");
//         const search = url.searchParams.get('search')?.trim() || '';
//         const status = url.searchParams.get("status")?.trim() || "";
//         const days = Number(url.searchParams.get("days")) || 0;

//         const conditions: (SQL | undefined)[] = [];
//         // Search filters
//         if (search) {
//             conditions.push(
//                 or(
//                     ilike(ticket.name, `%${search}%`),
//                     ilike(ticket.email, `%${search}%`),
//                     ilike(ticket.subject, `%${search}%`),
//                     ilike(ticket.message, `%${search}%`),
//                 )
//             );
//         }

//         const today = new Date();

//         today.setDate(today.getDate() - days)

//         conditions.push(eq(ticket.assign_to, Number(user_id)))

//         if (status) {
//             conditions.push(ilike(ticket.status, `%${status}`))
//         }

//         conditions.push(gte(ticket.createdAt, today))

//         const whereClause = and(...conditions);

//         const tickets_received = await db
//             .select({

//                 id: ticket.id,
//                 name: ticket.name,
//                 email: ticket.email,
//                 subject: ticket.subject,
//                 escalate: ticket.escalate,
//                 message: ticket.message,
//                 assign_to: ticket.assign_to,
//                 status: ticket.status,
//                 createdAt: ticket.createdAt,
//                 assign_to_username: admin.username,

//             })
//             .from(ticket)
//             .leftJoin(admin, eq(ticket.assign_to, admin.id))
//             .where(whereClause)
// console.log("ticket_recived",tickets_received);
//         return NextResponse.json({
//             received: tickets_received,
//         });
//     }
//     catch (error) {

//         console.log("Error: ", String(error));

//         return NextResponse.json(
//             {
//                 message: 'Failed to fetch users tickets',
//                 error: error instanceof Error ? error.message : String(error),
//             },
//             { status: 500 }
//         );
//     }
// }
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ticket, admin, coaches, users } from "@/lib/schema";
import { eq, SQL, or, ilike, and, gte } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const user_id = url.searchParams.get("userId");
    const search = url.searchParams.get("search")?.trim() || '';
    const status = url.searchParams.get("status")?.trim() || "";
    const days = Number(url.searchParams.get("days")) || 0;
    const staff = Number(url.searchParams.get("staff")) || 0;

    const conditions: (SQL | undefined)[] = [];

    // Search filters
    if (search) {
      conditions.push(
        or(
          ilike(ticket.name, `%${search}%`),
          ilike(ticket.email, `%${search}%`),
          ilike(ticket.subject, `%${search}%`),
          ilike(ticket.message, `%${search}%`)
        )
      );
    }

    if (user_id) {
      conditions.push(eq(ticket.assign_to, Number(user_id)));
    }
    // Staff filter
    if (staff > 0) {
      conditions.push(eq(ticket.assign_to, staff));
    }

    if (status) {
      conditions.push(ilike(ticket.status, `%${status}%`));
    }

    if (days > 0) {
      const today = new Date();
      today.setDate(today.getDate() - days);
      conditions.push(gte(ticket.createdAt, today));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const tickets_received = await db
      .select({
        id: ticket.id,
        name: ticket.name,
        email: ticket.email,
        subject: ticket.subject,
        escalate: ticket.escalate,
        message: ticket.message,
        priority: ticket.priority,
        assign_to: ticket.assign_to,
        status: ticket.status,
        createdAt: ticket.createdAt,
        assign_to_username: admin.username,
        coachImage: coaches.image,
        userImage: users.image,
      })
      .from(ticket)
      .leftJoin(admin, eq(ticket.assign_to, admin.id))
      .leftJoin(coaches, eq(ticket.ticket_from, coaches.id)) // 👈 Join coach image
      .leftJoin(users, eq(ticket.ticket_from, users.id))
      .where(whereClause);

    // console.log("tickets_received", tickets_received);

    // Return array directly for frontend
    return NextResponse.json(tickets_received);
  } catch (error) {
    console.log("Error: ", String(error));
    return NextResponse.json(
      {
        message: 'Failed to fetch users tickets',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
