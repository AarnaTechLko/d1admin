import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { users, admin } from "@/lib/schema";
import { eq } from "drizzle-orm";

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

interface JwtPayload {
  id: number;
  email?: string;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = Number((await params).id);

  if (!userId) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  try {
    // 1️⃣ Get JWT token from cookie
    const token = req.cookies.get("session_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
    } catch (err) {
      console.error("JWT verification failed:", err);
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const adminId = decoded.id;

    // 2️⃣ Fetch admin role
    const [adminData] = await db
      .select({ role: admin.role })
      .from(admin)
      .where(eq(admin.id, adminId));

    if (!adminData) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const adminRole = adminData.role.toLowerCase();
    if (!["executive level", "sub-admin", "admin"].includes(adminRole)) {
      return NextResponse.json(
        { error: "Only Executive level, Sub-admin, or Admin can remove diamonds" },
        { status: 403 }
      );
    }

    // 3️⃣ Fetch user
    const [user] = await db
      .select({ id: users.id, diamond: users.diamond })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4️⃣ Remove diamond (set to 0)
     const updatedDiamond=await db.update(users).set({ diamond: 0 }).where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      userId,
      diamond: updatedDiamond,
      updatedByRole: adminRole,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
