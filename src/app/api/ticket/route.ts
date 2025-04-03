import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { ticket,admin } from '@/lib/schema';
import { ilike, desc, sql, count, or,eq } from 'drizzle-orm';

// POST: Create a new ticket
export async function POST(req: Request) {
  try {
    const { name, email, subject, message,assign_to,status } = await req.json();

    // Insert the ticket into the database
    const result = await db.insert(ticket).values({
      name,
      email,
      subject,
      message,
      assign_to,
      status,
    }).returning(); // Ensure it returns the inserted data

    return NextResponse.json({ message: 'Ticket created successfully', result }, { status: 200 });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json({ error: "Error creating ticket" }, { status: 500 });
  }
}

// GET: Fetch tickets with optional filters, pagination & search
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get('search')?.trim() || '';  
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    
    const offset = (page - 1) * limit;

    // Dynamic search conditions across multiple fields
    const whereClause = search
      ? or(
          ilike(ticket.name, `%${search}%`),
          ilike(ticket.email, `%${search}%`),
          ilike(ticket.subject, `%${search}%`),
          ilike(ticket.message, `%${search}%`)
        )
      : undefined;

    // Query to fetch tickets with additional aggregations (optional)
    const ticketsData = await db
      .select({
        id: ticket.id,
        name: ticket.name,
        email: ticket.email,
        subject: ticket.subject,
        message: ticket.message,
        assign_to:ticket.assign_to,
        status:ticket.status,
        assignToUsername: admin.username,
        createdAt: ticket.createdAt,
        ticketCount: sql<number>`COUNT(*) OVER()`, // Get total count without separate query
      })
      .from(ticket)
      .leftJoin(admin, eq(ticket.assign_to, admin.id)) // Join with the admin table
      .where(whereClause)
      .orderBy(desc(ticket.createdAt))
      .offset(offset)
      .limit(limit);

    // Get total ticket count for pagination
    const totalCount = await db
      .select({ count: count() })
      .from(ticket)
      .where(whereClause)
      .then((result) => result[0]?.count || 0);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      tickets: ticketsData,
      currentPage: page,
      totalPages: totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      totalCount: totalCount
    });

  } catch (error) {
    return NextResponse.json(
      {
        message: 'Failed to fetch tickets',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req:Request) {
  try {
    const url = new URL(req.url);
    const ticketId = url.searchParams.get("id");

    if (!ticketId) {
      return NextResponse.json({ message: "ticket ID is required" }, { status: 400 });
    }

    const ticketIdNumber = Number(ticketId);
    if (isNaN(ticketIdNumber)) {
      return NextResponse.json({ message: "Invalid ticket ID" }, { status: 400 });
    }

    // Delete the ticket by ID
    await db.delete(ticket).where(eq(ticket.id, ticketIdNumber));

    return NextResponse.json({ message: "ticket deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete ticket", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

