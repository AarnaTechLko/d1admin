import { NextResponse } from "next/server";

export async function POST() {
    const response = NextResponse.json({ message: "Logged out successfully" });

    // ✅ Correctly clear the session cookie for all paths
    response.cookies.set("session_token", "", {
        expires: new Date(0), // Expire immediately
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/", // ✅ Ensure the cookie is cleared globally
    });

    response.cookies.set("user_id", "", {
        expires: new Date(0), // Expire immediately
        httpOnly: true,      // Set httpOnly if that was the original configuration
        secure: true,
        sameSite: "strict",
        path: "/",           // Clear the cookie globally
      });

    return response;
}
