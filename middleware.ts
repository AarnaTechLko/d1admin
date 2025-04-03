

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const token = req.cookies.get("session_token")?.value; // Read token from cookies

    if (!token && req.nextUrl.pathname.startsWith("/dashboard")) {
        // Redirect to signin if user tries to access dashboard without login
        return NextResponse.redirect(new URL("/signin", req.url));
    }

    return NextResponse.next();
}

// Apply middleware to dashboard routes only
export const config = {
    matcher: ["/dashboard/:path*"],
};

