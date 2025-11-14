// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { roleBasedAccess } from "@/utils/roleAccess";
export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const role = req.cookies.get("role")?.value; // or use headers/session/etc.
console.log('roles data:',role);
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
    "/ticket",
    "/receivedticket",
    "/sentticket",
  ]
};
