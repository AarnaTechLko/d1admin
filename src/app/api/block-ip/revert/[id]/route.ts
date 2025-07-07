import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { block_ips } from '@/lib/schema';

export async function PATCH(req: NextRequest,   { params }: { params: Promise<{ id: string }> }) {
  const numericId = Number(( await params).id);
  if (isNaN(numericId)) {
    return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
  }

  const [current] = await db.select().from(block_ips).where(eq(block_ips.id, numericId));
  if (!current) {
    return NextResponse.json({ error: 'block_ips not found' }, { status: 404 });
  }

  const newIsDeleted = current.is_deleted === 1 ? 0 : 1;

  await db.update(block_ips).set({ is_deleted: newIsDeleted }).where(eq(block_ips.id, numericId));

  return NextResponse.json({
    message: `block_ips ${newIsDeleted === 0 ? 'hidden' : 'reverted'} successfully`,
  });
}