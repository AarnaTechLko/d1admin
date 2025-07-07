
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { admin, ip_logs } from "@/lib/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const ip = forwarded.split(",")[0].trim();
    if (ip && ip !== "::1") return ip;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp && realIp !== "::1") return realIp;
  return "127.0.0.1";
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const ip = getClientIp(req);

    const users = await db.select().from(admin).where(eq(admin.email, email));
    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const currentUser = users[0];

    const isPasswordValid = await bcrypt.compare(password, currentUser.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = jwt.sign(
      {
        id: currentUser.id,
        email: currentUser.email,
        role: currentUser.role,
      },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    // ✅ Insert into ip_logs with logout_time = null
    await db.insert(ip_logs).values({
      userId: currentUser.id,
      ip_address: ip,
      type: "admin", // ✅ Add login type
      login_time: new Date(),
      logout_time: null,
      created_at: new Date(),
    });


    const cookieOptions = "HttpOnly; Path=/; Max-Age=3600; Secure; SameSite=Strict";
    const headers = new Headers();
    headers.append("Set-Cookie", `session_token=${token}; ${cookieOptions}`);
    headers.append("Set-Cookie", `user_id=${currentUser.id}; ${cookieOptions}`);
    headers.append("Set-Cookie", `role=${currentUser.role}; ${cookieOptions}`);
    headers.append("Content-Type", "application/json");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Signin successful",
        token,
        user_id: currentUser.id,
        role: currentUser.role,
      }),
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
