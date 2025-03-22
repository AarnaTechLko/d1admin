import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value;

    // If no token and trying to access a protected page, redirect to login
    if (!token && req.nextUrl.pathname.startsWith("/profile")) {
        return NextResponse.redirect(new URL("/signin", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/profile/:path*"], // Protect dashboard routes
};
