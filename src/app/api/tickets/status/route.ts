// app/api/ticket/status/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ticket } from '@/lib/schema';

export async function GET() {
  try {
    const allTickets = await db.select().from(ticket);

    const statusCounts = {
      open: 0,
      closed: 0,
      fixed: 0,
      pending: 0,
    };

    allTickets.forEach((t) => {
      const status = t.status?.toLowerCase();
      if (status && statusCounts.hasOwnProperty(status)) {
        statusCounts[status as keyof typeof statusCounts]++;
      }
    });

    return NextResponse.json({ statusCounts });
  } catch (error) {
    console.error('Error fetching ticket status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
