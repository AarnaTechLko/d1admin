import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { count } from 'drizzle-orm';

 


export async function GET() {

    const playerCount = await db
        .select({count: count()})
        .from(users)


    try{

        return NextResponse.json({
        playerCount
        });
    } catch (error) {
        return NextResponse.json(
        {
            message: 'Failed to fetch players',
            error: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
        );
    }
}



