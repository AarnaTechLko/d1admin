import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ability } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { evaluationId, file1, file2, file3, file4, file5 } = body;

    // Validate evaluationId
    if (!evaluationId || isNaN(Number(evaluationId))) {
      return NextResponse.json({ error: 'Invalid or missing evaluationId' }, { status: 400 });
    }

    // Collect provided files (skip null/undefined)
    const files = [file1, file2, file3, file4, file5].filter(Boolean);

    if (files.length === 0) {
      return NextResponse.json({ error: 'At least one file is required' }, { status: 400 });
    }

    // Prepare rows for insertion
    const rows = files.map((item: { filename: string; comments: string }) => ({
      evaluationId: Number(evaluationId),
      filename: item.filename,
      comments: item.comments || '',
    }));

    // Insert into database
    await db.insert(ability).values(rows);

    return NextResponse.json({ message: 'Abilities saved successfully', ability: rows }, { status: 201 });
  } catch (error) {
    console.error('Error saving abilities:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const evaluationId = searchParams.get('evaluationId');

    // Validate evaluationId
    const id = Number(evaluationId);
    if (!evaluationId || isNaN(id)) {
      return NextResponse.json({ error: 'Invalid or missing evaluationId' }, { status: 400 });
    }

    // Query the database
    const result = await db
      .select()
      .from(ability)
      .where(eq(ability.evaluationId, id))
      .orderBy(ability.id); // Optional: ensures consistent file order

    if (result.length === 0) {
      return NextResponse.json({ error: 'No data found for the given evaluationId' }, { status: 404 });
    }

    // Format result as file1, file2, ...
    const files = result.reduce((acc, item, index) => {
      acc[`file${index + 1}`] = {
        filename: item.filename,
        comments: item.comments || '',
      }; 
      return acc;
    }, {} as Record<string, { filename: string; comments: string }>);

    return NextResponse.json({ ability: { evaluationId: id, files } }, { status: 200 });
  } catch (error) {
    console.error('Error fetching abilities:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
