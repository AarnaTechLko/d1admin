// File: src/app/api/coach/unverify/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { coaches, verified, admin } from "@/lib/schema";
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
  const { id } = await params;
  const coachId = Number(id);

  if (!coachId) {
    return NextResponse.json({ error: "Invalid coach ID" }, { status: 400 });
  }

  try {
    // 1️⃣ Get JWT token from cookie
    const token = req.cookies.get("session_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Verify JWT
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
    } catch (err) {
      console.error("JWT verification failed:", err);
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const adminId = decoded.id;

    // 3️⃣ Fetch role from admin table
    const [adminData] = await db
      .select({ role: admin.role })
      .from(admin)
      .where(eq(admin.id, adminId));

    if (!adminData) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const adminRole = adminData.role;
    console.log("Admin role from DB:", adminRole);

    // 4️⃣ Only allow Executive Level sub-admins
    if (adminRole.toLowerCase() !== "executive level") {
      return NextResponse.json(
        {
          error: "Only Executive Level sub-admins can unverify coaches",
          role: adminRole,
        },
        { status: 403 }
      );
    }

    // 5️⃣ Fetch coach
    const [coach] = await db
      .select({ id: coaches.id, verified: coaches.verified })
      .from(coaches)
      .where(eq(coaches.id, coachId));

    if (!coach) {
      return NextResponse.json({ error: "Coach not found" }, { status: 404 });
    }

    // 6️⃣ Update coach as unverified
    const [updatedCoach] = await db
      .update(coaches)
      .set({ verified: 0 }) // unverify
      .where(eq(coaches.id, coachId))
      .returning();

    // 7️⃣ Insert unverify log
    await db.insert(verified).values({
      userId: coach.id,
      verifiedBy: adminId,
      isVerified: false, // mark as unverified
    });

    return NextResponse.json({
      message: "Coach successfully unverified",
      coach: updatedCoach,
      role: adminRole,
    });
  } catch (err) {
    console.error("PATCH /api/coach/unverify/[id] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
