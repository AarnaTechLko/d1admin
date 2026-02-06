import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sports } from '@/lib/schema';
import { asc } from 'drizzle-orm';

export async function GET() {
  try {
    const sport = await db
      .select({
        id: sports.id,
        name: sports.name,
      })
      .from(sports)
      .orderBy(asc(sports.display_order));

   /// console.log("SPORT: ", sport);
    

    return NextResponse.json({
        sport
    });
  } catch (error) {
    console.error('Error fetching sports:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
