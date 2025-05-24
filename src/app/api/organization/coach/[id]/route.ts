

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { coaches } from '@/lib/schema';

export async function PATCH(req: NextRequest, 
    { params }: { params: Promise<{ id: string }> }
) {
  const numericId = Number((await params).id);
  if (isNaN(numericId)) {
    return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
  }

  const [current] = await db.select().from(coaches).where(eq(coaches.id, numericId));
  if (!current) {
    return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
  }

  const newIsDeleted = current.is_deleted === 1 ? 0 : 1;

  await db.update(coaches).set({ is_deleted: newIsDeleted }).where(eq(coaches.id, numericId));

  return NextResponse.json({
    message: `Coach ${newIsDeleted === 0 ? 'hidden' : 'reverted'} successfully`,
  });
}

export async function DELETE(req: NextRequest, 
    { params }: { params: Promise<{ id: string }> }
)
   {
  const numericId = Number((await params).id);
  if (isNaN(numericId)) {
    return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
  }

  await db.update(coaches).set({ is_deleted: 0 }).where(eq(coaches.id, numericId));
  return NextResponse.json({ message: 'Coach deleted permanently' });
}
