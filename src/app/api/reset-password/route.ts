import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { admin, forgetPassword } from "@/lib/schema";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    console.log('Reset password token:', token);

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token and password are required" },
        { status: 400 }
      );
    }

    // 1️⃣ Find token record
    const tokenRecord = await db.query.forgetPassword.findFirst({
      where: eq(forgetPassword.token, token),
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // 2️⃣ Find admin by email
    const adminUser = await db.query.admin.findFirst({
      where: eq(admin.email, tokenRecord.email),
    });

    if (!adminUser) {
      return NextResponse.json(
        { message: "Admin not found" },
        { status: 404 }
      );
    }

    // 3️⃣ Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Update admin password ✅ FIXED
    await db
      .update(admin)
      .set({ password_hash: hashedPassword })
      .where(eq(admin.id, adminUser.id));

    // 5️⃣ Delete token (important)
    await db
      .delete(forgetPassword)
      .where(eq(forgetPassword.token, token));

    return NextResponse.json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
