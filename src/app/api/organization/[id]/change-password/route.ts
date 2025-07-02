import { db } from '@/lib/db';
import { enterprises } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const orgId = Number((await params).id);
    if (isNaN(orgId)) {
      return NextResponse.json({ error: "Invalid organization ID" }, { status: 400 });
    }

    const { newPassword } = await req.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

     await db
      .update(enterprises)
      .set({ password: hashed }) // Make sure enterprises table has this field
      .where(eq(enterprises.id, orgId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Change organization password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
