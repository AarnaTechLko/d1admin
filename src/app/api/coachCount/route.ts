import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { coaches } from '@/lib/schema';
import { count } from 'drizzle-orm';


export async function GET() {

    const coachCount = await db
        .select({count: count()})
        .from(coaches)


    try{

        return NextResponse.json({
        coachCount
        });
    } catch (error) {
        return NextResponse.json(
        {
            message: 'Failed to fetch coaches',
            error: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
        );
    }
}