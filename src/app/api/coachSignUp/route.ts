import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { coaches } from '@/lib/schema';
import { asc } from 'drizzle-orm';

export async function GET() {
  try {
    const coach = await db
      .select({
        createdAt: coaches.createdAt,
      })
      .from(coaches)
      .orderBy(asc(coaches.createdAt));

    

    return NextResponse.json({
      monthlyCoaches: coach.map((c) => ({
        created_at: c.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
