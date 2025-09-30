
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
import { coaches, verified, admin } from "@/lib/schema"; // use your admin table here
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

  if (!coachId)
    return NextResponse.json({ error: "Invalid coach ID" }, { status: 400 });

  try {
    // 1️⃣ Get JWT token from cookie
    const token = req.cookies.get("session_token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
    } catch (err) {
      console.error("JWT verification failed:", err);
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const adminId = decoded.id;

    // 2️⃣ Fetch the current role from the admin table
    const [adminData] = await db
      .select({ role: admin.role })
      .from(admin)
      .where(eq(admin.id, adminId));

    if (!adminData)
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });

    const adminRole = adminData.role;
    console.log("Admin role from DB:", adminRole);

    // 3️⃣ Only allow Executive level sub-admins
if (
  adminRole.toLowerCase() !== "executive level" &&
  adminRole.toLowerCase() !== "admin"
) {
  return NextResponse.json(
    {
      error: "Only Executive level sub-admins or Admins can verify coaches",
      role: adminRole,
    },
    { status: 403 }
  );
}


    // 4️⃣ Fetch coach
    const [coach] = await db
      .select({ id: coaches.id, verified: coaches.verified })
      .from(coaches)
      .where(eq(coaches.id, coachId));

    if (!coach)
      return NextResponse.json({ error: "Coach not found" }, { status: 404 });

    // 5️⃣ Update coach as verified
    const [updatedCoach] = await db
      .update(coaches)
      .set({ verified: 1 })
      .where(eq(coaches.id, coachId))
      .returning();

    // 6️⃣ Insert verification log
    await db.insert(verified).values({
      userId: coach.id,
      verifiedBy: adminId,
      isVerified: true,
    });

    return NextResponse.json({
      message: "Coach verified successfully",
      coach: updatedCoach,
      role: adminRole, // return the current role
    });
  } catch (err) {
    console.error("PATCH /api/coach/verify/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
