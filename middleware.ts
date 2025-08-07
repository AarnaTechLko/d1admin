

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(req: NextRequest) {
//     const token = req.cookies.get("session_token")?.value; // Read token from cookies

//     if (!token && req.nextUrl.pathname.startsWith("/dashboard")) {
//         // Redirect to signin if user tries to access dashboard without login
//         return NextResponse.redirect(new URL("/signin", req.url));
//     }

//     return NextResponse.next();
// }

// // Apply middleware to dashboard routes only
// export const config = {
//     matcher: ["/dashboard/:path*"],
// };

// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { roleBasedAccess } from "@/utils/roleAccess";
export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const role = req.cookies.get("role")?.value; // or use headers/session/etc.

  if (!role) return NextResponse.redirect(new URL("/unauthorized", req.url));

  const allowedRoutes = roleBasedAccess[role] || [];
  const path = url.pathname;

  if (!allowedRoutes.includes(path)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/coach",
    "/suspend",
    "/disablecoach",
    "/player",
    "/suspendplayer",
    "/disableplayer",
    "/organization",
    "/suspendorg",
    "/disableorg",
    "/team",
    "/suspendteam",
    "/disableteam",
    "/notification",
    "/subadmin",
    "/view",
    "/createticket",
    "/ticket"
  ]
};
