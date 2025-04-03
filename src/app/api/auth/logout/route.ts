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

    return response;
}
