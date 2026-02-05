// import { NextRequest, NextResponse } from 'next/server';
// import bcrypt from 'bcryptjs';
// import { db } from '@/lib/db';
// import { admin } from '@/lib/schema'; // 👈 Import admin table
// import { eq } from 'drizzle-orm';

// export async function POST(req: NextRequest) {
//   try {
//     const { userId, currentPassword, newPassword } = await req.json();

//     // Validate input
//     if (
//       typeof userId !== 'number' ||
//       typeof currentPassword !== 'string' ||
//       typeof newPassword !== 'string'
//     ) {
//       return NextResponse.json(
//         { message: 'Invalid input. Please provide all required fields.' },
//         { status: 400 }
//       );
//     }

//     if (newPassword.trim().length < 6) {
//       return NextResponse.json(
//         { message: 'New password must be at least 6 characters long.' },
//         { status: 400 }
//       );
//     }

//     // Fetch admin by ID
//     const [adminUser] = await db
// .select({ id: admin.id, password_hash: admin.password_hash })
//       .from(admin)
//       .where(eq(admin.id, userId))
//       .limit(1);

//     if (!adminUser) {
//       return NextResponse.json({ message: 'Admin not found.' }, { status: 404 });
//     }

//     // Compare current password
// const isMatch = await bcrypt.compare(currentPassword, adminUser.password_hash);
//     if (!isMatch) {
//       return NextResponse.json({ message: 'Current password is incorrect.' }, { status: 401 });
//     }

//     // Ensure new password is not the same
//     const isSame = await bcrypt.compare(newPassword, adminUser.password_hash);
//     if (isSame) {
//       return NextResponse.json(
//         { message: 'New password must be different from the current password.' },
//         { status: 400 }
//       );
//     }

//     // Hash and update new password
//     const hashed = await bcrypt.hash(newPassword, 10);
//     await db
//       .update(admin)
//       .set({ password_hash: hashed })
//       .where(eq(admin.id, userId));

//     return NextResponse.json({ message: 'Password updated successfully.' }, { status: 200 });

//   } catch (error) {
//     console.error('[CHANGE_PASSWORD_ERROR]', error);
//     return NextResponse.json(
//       { message: 'Internal server error. Please try again later.' },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, admin } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/Auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.user.role) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { userId, currentPassword, newPassword } = await req.json();
    const numericUserId = Number(userId);

    if (
      isNaN(numericUserId) ||
      !currentPassword ||
      !newPassword ||
      newPassword.length < 6
    ) {
      return NextResponse.json(
        { message: "Invalid input." },
        { status: 400 }
      );
    }

    const isAdmin = session.user.role === "Admin";

    const table = isAdmin ? admin : users;
    const passwordColumn = isAdmin ? admin.password_hash : users.password;

    const [dbUser] = await db
      .select({ id: table.id, password: passwordColumn })
      .from(table)
      .where(eq(table.id, numericUserId))
      .limit(1);

    if (!dbUser) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(
      currentPassword.trim(),
      dbUser.password
    );

    if (!isMatch) {
      return NextResponse.json(
        { message: "Current password is incorrect." },
        { status: 401 }
      );
    }

    const hashed = await bcrypt.hash(newPassword.trim(), 10);

    if (isAdmin) {
      await db.update(admin).set({ password_hash: hashed }).where(eq(admin.id, numericUserId));
    } else {
      await db.update(users).set({ password: hashed }).where(eq(users.id, numericUserId));
    }

    return NextResponse.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("[CHANGE_PASSWORD_ERROR]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
