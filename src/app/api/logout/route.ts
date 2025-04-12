// import { NextResponse } from "next/server";

// export async function GET() {
//     const response = NextResponse.json(
//         { message: "Logged out successfully" },
//         { status: 200 }
//     );

//     // Remove the authentication cookie
//     response.cookies.set("token", "", {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         expires: new Date(0), // Expire immediately
//         path: "/",
//     });

//     return response;
// }

import { NextResponse } from "next/server";

export async function GET() {
    const response = NextResponse.redirect(new URL("/signin", process.env.NEXT_PUBLIC_BASE_URL));
    response.cookies.set("session_token", "", { expires: new Date(0) }); // Clear cookie
    return response;
}
