
// import { NextRequest, NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import { db } from "@/lib/db";
// import { coaches, verified } from "@/lib/schema";
// import { eq } from "drizzle-orm";

// const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
//   const { id } = await params;
//   const coachId = Number(id);
//   if (!coachId) return NextResponse.json({ error: "Invalid coach ID" }, { status: 400 });

//   try {
//     // 1️⃣ Get token from cookie
//     const token = req.cookies.get("session_token")?.value;
//     if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     // 2️⃣ Verify JWT
//     let decoded: any;
//     try {
//       decoded = jwt.verify(token, SECRET_KEY);
//     } catch (err) {
//           console.error("PATCH /api/coach/verify/[id] error:", err);
//       return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
//     }

//     const adminId = Number(decoded.id);
//     console.log("Logged in admin ID:", adminId, "Role:", decoded.role);

//     // Optional: Only allow admins
//     if (decoded.role !== "Admin") {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     // 3️⃣ Fetch coach with linked userId
//     const [coach] = await db
//       .select({
//         id: coaches.id,
//         verified: coaches.verified,
//       })
//       .from(coaches)
//       .where(eq(coaches.id, coachId));

//     if (!coach) return NextResponse.json({ error: "Coach not found" }, { status: 404 });

//     // 4️⃣ Update coach as verified
//     const [updatedCoach] = await db
//       .update(coaches)
//       .set({ verified: 1 })
//       .where(eq(coaches.id, coachId))
//       .returning();

//     // 5️⃣ Insert verification log
//     await db.insert(verified).values({
//       userId: coach.id,
//       verifiedBy: adminId,
//       isVerified: true,
//     });

//     return NextResponse.json({
//       message: "Coach verified successfully",
//       coach: updatedCoach,
//     });
//   } catch (err) {
//     console.error("PATCH /api/coach/verify/[id] error:", err);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { coaches, verified } from "@/lib/schema";
import { eq } from "drizzle-orm";

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// Define a type-safe JWT payload
interface JwtPayload {
  id: number;
  role: string;
  email?: string;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const coachId = Number(id);
  if (!coachId) return NextResponse.json({ error: "Invalid coach ID" }, { status: 400 });

  try {
    // 1️⃣ Get token from cookie
    const token = req.cookies.get("session_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2️⃣ Verify JWT
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
    } catch (err) {
      console.error("PATCH /api/coach/verify/[id] error:", err);
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const adminId = Number(decoded.id);
    console.log("Logged in admin ID:", adminId, "Role:", decoded.role);

    // Optional: Only allow admins
    if (decoded.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3️⃣ Fetch coach with linked userId
    const [coach] = await db
      .select({
        id: coaches.id,
        verified: coaches.verified,
      })
      .from(coaches)
      .where(eq(coaches.id, coachId));

    if (!coach) return NextResponse.json({ error: "Coach not found" }, { status: 404 });

    // 4️⃣ Update coach as verified
    const [updatedCoach] = await db
      .update(coaches)
      .set({ verified: 1 })
      .where(eq(coaches.id, coachId))
      .returning();

    // 5️⃣ Insert verification log
    await db.insert(verified).values({
      userId: coach.id,
      verifiedBy: adminId,
      isVerified: true,
    });

    return NextResponse.json({
      message: "Coach verified successfully",
      coach: updatedCoach,
    });
  } catch (err) {
    console.error("PATCH /api/coach/verify/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
