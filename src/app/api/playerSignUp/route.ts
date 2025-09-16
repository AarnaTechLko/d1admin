import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { asc } from 'drizzle-orm';

export async function GET() {
  try {
    const player = await db
      .select({
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(asc(users.createdAt));

    return NextResponse.json({
      monthlyPlayers: player.map((c) => ({
        created_at: c.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
