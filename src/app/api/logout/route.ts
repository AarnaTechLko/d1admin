import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ip_logs } from "@/lib/schema";
import { and, eq, isNull } from "drizzle-orm";

// ✅ Extract the real IP address
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

// ✅ Parse cookies from the request
function getCookies(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const cookies: Record<string, string> = {};
  cookieHeader.split(";").forEach((cookie) => {
    const [key, value] = cookie.split("=");
    if (key && value) cookies[key.trim()] = value.trim();
  });
  return cookies;
}

// ✅ Common logout logic
async function performLogout(req: Request) {
  const cookies = getCookies(req);
  const userId = cookies["user_id"];
  const ip = getClientIp(req);

  if (userId) {
    console.log("🟢 Logging out user:", userId, "from IP:", ip);

    // Update ip_logs: set login_time = null, logout_time = now
    await db
      .update(ip_logs)
      .set({
        logout_time: new Date(),
      })
      .where(
        and(
          eq(ip_logs.userId, Number(userId)),
          isNull(ip_logs.logout_time)
        )
      );
  } else {
    console.warn("⚠️ No user_id cookie found.");
  }

  return userId;
}

// ✅ POST: Called from frontend logout
export async function POST(req: Request) {
  try {
    await performLogout(req);

    const response = NextResponse.json({ success: true, message: "Logged out" });
    const expired = { expires: new Date(0), path: "/" };

    response.cookies.set("session_token", "", expired);
    response.cookies.set("user_id", "", expired);
    response.cookies.set("role", "", expired);

    return response;
  } catch (error) {
    console.error("❌ POST logout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ✅ GET: For browser-triggered logout via URL
export async function GET(req: Request) {
  try {
    await performLogout(req);

    const response = NextResponse.redirect(new URL("/signin", process.env.NEXT_PUBLIC_BASE_URL));
    const expired = { expires: new Date(0), path: "/" };

    response.cookies.set("session_token", "", expired);
    response.cookies.set("user_id", "", expired);
    response.cookies.set("role", "", expired);

    return response;
  } catch (error) {
    console.error("❌ GET logout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

