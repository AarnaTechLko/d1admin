import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ticket, admin } from "@/lib/schema";
import { eq, SQL, or, ilike, and } from "drizzle-orm";


export async function GET(req: NextRequest) {

    try {
        const url = new URL(req.url);
        const user_id = url.searchParams.get("userId");
        const search = url.searchParams.get('search')?.trim() || '';


        const conditions: (SQL | undefined)[] = [];
            // Search filters
            if (search) {
            conditions.push(
                or(
                    ilike(ticket.name, `%${search}%`),
                    ilike(ticket.email, `%${search}%`),
                    ilike(ticket.subject, `%${search}%`),
                    ilike(ticket.message, `%${search}%`),
                )
            );
            }

         conditions.push(eq(ticket.ticket_from, Number(user_id)))

        const whereClause = and(...conditions);


        const tickets_sent = await db
            .select({

                id: ticket.id,
                name: ticket.name,
                email: ticket.email,
                subject: ticket.subject,
                escalate: ticket.escalate,
                message: ticket.message,
                assign_to: ticket.assign_to,
                status: ticket.status,
                createdAt: ticket.createdAt,
                assign_to_username: admin.username, 

            })
            .from(ticket)
            .leftJoin(admin, eq(ticket.assign_to, admin.id))
            .where(whereClause)


        const tickets_received = await db
            .select( {

                id: ticket.id,
                name: ticket.name,
                email: ticket.email,
                subject: ticket.subject,
                escalate: ticket.escalate,
                message: ticket.message,
                assign_to: ticket.assign_to,
                status: ticket.status,
                createdAt: ticket.createdAt,
                assign_to_username: admin.username, 

            })
            .from(ticket)
            .leftJoin(admin, eq(ticket.assign_to, admin.id))
            .where(eq(ticket.assign_to, Number(user_id)))

        return NextResponse.json({
            sent: tickets_sent,
            received: tickets_received
        });
    }
    catch (error){

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