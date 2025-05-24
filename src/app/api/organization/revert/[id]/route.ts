import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { enterprises } from '@/lib/schema';

export async function PATCH(req: NextRequest, 
    { params }: { params: Promise<{ id: string }> }
) {
  const numericId = Number((await params).id);
  if (isNaN(numericId)) {
    return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
  }

  const [current] = await db.select().from(enterprises).where(eq(enterprises.id, numericId));
  if (!current) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
  }

  const newIsDeleted = current.is_deleted === 1 ? 0 : 1;

  await db.update(enterprises).set({ is_deleted: newIsDeleted }).where(eq(enterprises.id, numericId));

  return NextResponse.json({
    message: `Organization ${newIsDeleted === 0 ? 'hidden' : 'reverted'} successfully`,
  });
}