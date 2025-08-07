// import { db } from '@/lib/db';
// import { users } from '@/lib/schema';
// import { eq } from 'drizzle-orm';
// import { NextRequest, NextResponse } from 'next/server';
// import bcrypt from 'bcryptjs';

// export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
//   try {
//     const playerId = Number((await params).id);
//     const { newPassword } = await req.json();

//     if (!newPassword || newPassword.length < 6) {
//       return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
//     }

//     const hashed = await bcrypt.hash(newPassword, 10);

//     await db
//       .update(users)
//       .set({ password: hashed })
//       .where(eq(users.id, playerId));

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Change password error:", error);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }

import { db } from '@/lib/db';
import { users, role } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { user_id, newPassword } = await req.json();
    const userId = Number(user_id); // from localStorage (client)
console.log("userid",userId);
    if (!userId || !newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Invalid user or password too short" },
        { status: 400 }      
      );
    }

    // Step 1: Get role record by user_id
    const roleRes = await db
      .select({ changePassword: role.change_password })
      .from(role)
      .where(eq(role.user_id, userId))
      .limit(1);

    if (roleRes.length === 0) {
      return NextResponse.json({ error: "User role not found" }, { status: 404 });
    }

    const { changePassword } = roleRes[0];

    // Step 2: Permission check
    if (changePassword !== 1) {
      return NextResponse.json(
        { error: "You are not allowed to change the password" },
        { status: 403 }
      );
    }

    // Step 3: Hash and update password
    const hashed = await bcrypt.hash(newPassword, 10);

    await db
      .update(users)
      .set({ password: hashed })
      .where(eq(users.id, userId)); // using login id

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
