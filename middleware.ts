// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { roleBasedAccess } from "@/utils/roleAccess";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.NEXTAUTH_SECRET || "your_secret_key";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const path = url.pathname;

  // Public routes that don't require auth
  const publicRoutes = [
    "/signin",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/unauthorized",
  ];

  if (publicRoutes.some(route => path.startsWith(route))) {
    return NextResponse.next();
  }

  // Get the NextAuth session token from cookie
  const token = req.cookies.get("next-auth.session-token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  let payload: any;
  try {
    payload = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    console.error("JWT verification failed:", err);
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  const role = payload.role as string;
  const allowedRoutes = roleBasedAccess[role];

  // If role has full access, continue
  if (allowedRoutes === "*") {
    return NextResponse.next();
  }

  // Check if user is allowed for this route
  const isAllowed = allowedRoutes.some(route =>
    route.endsWith("*")
      ? path.startsWith(route.replace("*", ""))
      : route === path
  );

  if (!isAllowed) {
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
    "/ticket",
    "/receivedticket",
    "/sentticket",
  ],
};
