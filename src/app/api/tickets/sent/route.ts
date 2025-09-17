import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ticket, admin } from "@/lib/schema";
import { eq, SQL, or, ilike, and, gte } from "drizzle-orm";


export async function GET(req: NextRequest) {

    try {
        const url = new URL(req.url);
        const user_id = url.searchParams.get("userId");
        const search = url.searchParams.get('search')?.trim() || '';
        const status = url.searchParams.get("status")?.trim() || "";
        const days = Number(url.searchParams.get("days")) || 0;

        console.log("SEE?");
        console.log("Days: ", days);

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
            const today = new Date();

            today.setDate(today.getDate() - days)

            console.log("Date: ", today)

            if(status){
                conditions.push(ilike(ticket.status, `%${status}`))
            }

            conditions.push(gte(ticket.createdAt, today))


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


        return NextResponse.json({
            sent: tickets_sent,
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