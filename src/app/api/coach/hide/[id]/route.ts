
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { coaches } from '@/lib/schema';
export async function DELETE(req: NextRequest, 
   { params }: { params: Promise<{ id: string }> }) {
  const numericId = Number(( await params).id);
  if (isNaN(numericId)) {
    return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
  }

  await db.update(coaches).set({ is_deleted: 0 }).where(eq(coaches.id, numericId));
  return NextResponse.json({ message: 'Coach deleted permanently' });
}