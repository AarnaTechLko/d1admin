import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { enterprises } from '@/lib/schema';
import { count } from 'drizzle-orm';

export async function GET() {

    const organizationCount = await db
        .select({count: count()})
        .from(enterprises)


    try{

        return NextResponse.json({
        organizationCount
        });
    } catch (error) {
        return NextResponse.json(
        {
            message: 'Failed to fetch organizations',
            error: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
        );
    }
}



