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

// import { db } from '@/lib/db';
// import { users } from '@/lib/schema';
// import { eq } from 'drizzle-orm';
// import { NextRequest, NextResponse } from 'next/server';
// import bcrypt from 'bcryptjs';

// export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
//   try { 
//     const playerId = Number((await params).id);
//     console.log("player id",playerId);
//     if (isNaN(playerId)) {
//       return NextResponse.json({ error: "Invalid player ID" }, { status: 400 });
//     }
//     const { newPassword } = await req.json();
//     //const userId = Number(user_id); // from localStorage (client)
// //console.log("userid",userId);
//     if (!playerId||!newPassword || newPassword.length < 6) {
//       return NextResponse.json(
//         { error: "Invalid player ID or password too short" },
//         { status: 400 }      
//       );
//     }

//     // Step 1: Get role record by user_id
//     /* const roleRes = await db
//       .select({ changePassword: role.change_password })
//       .from(role)
//       .where(eq(role.user_id, userId))
//       .limit(1);

//     if (roleRes.length === 0) {
//       return NextResponse.json({ error: "User role not found" }, { status: 404 });
//     }

//     const { changePassword } = roleRes[0];

//     // Step 2: Permission check
//     if (changePassword !== 1) {
//       return NextResponse.json(
//         { error: "You are not allowed to change the password" },
//         { status: 403 }
//       );
//     }
//  */
//     // Step 3: Hash and update password
//     const hashed = await bcrypt.hash(newPassword, 10);
//     await db
//       .update(users)
//       .set({ password: hashed })
//       .where(eq(users.id, playerId)); // using login id

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Change password error:", error);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }

import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/Auth";

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Get logged-in user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loggedInUserId = Number(session.user.id);

    // 2️⃣ Extract playerId from URL
    const url = new URL(req.url);
    const idParam = url.pathname.split("/").pop(); // get the last segment
    if (!idParam) {
      return NextResponse.json({ error: "Missing player ID" }, { status: 400 });
    }
    const playerId = Number(idParam);
    if (isNaN(playerId)) {
      return NextResponse.json({ error: "Invalid player ID" }, { status: 400 });
    }

    // 3️⃣ Get new password from request body
    const { newPassword }: { newPassword?: string } = await req.json();
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // 4️⃣ Only allow admin or self
    if (loggedInUserId !== playerId && session.user.role !== "Admin") {
      return NextResponse.json(
        { error: "You are not allowed to change this password" },
        { status: 403 }
      );
    }

    // 5️⃣ Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, playerId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

