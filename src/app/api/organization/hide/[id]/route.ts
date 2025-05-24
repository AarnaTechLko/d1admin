
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { enterprises } from '@/lib/schema';
export async function DELETE(req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
  const numericId = Number((await params).id);
  if (isNaN(numericId)) {
    return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
  }

  await db.update(enterprises).set({ is_deleted: 0 }).where(eq(enterprises.id, numericId));
  return NextResponse.json({ message: 'Organization deleted permanently' });
}