// // app/api/getCoachIpLogs/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/lib/db";
// import { ip_logs, coaches } from "@/lib/schema";
// import { eq } from "drizzle-orm";

// // GET IP logs with coach details based on coach ID (userId)
// export async function GET(req: NextRequest) {
//   try {
//     const userIdParam = req.nextUrl.searchParams.get("userId");

//     if (!userIdParam) {
//       return NextResponse.json({ success: false, message: "userId is required" }, { status: 400 });
//     }

//     const userId = parseInt(userIdParam);
//     if (isNaN(userId)) {
//       return NextResponse.json({ success: false, message: "Invalid userId" }, { status: 400 });
//     }

//     const result = await db
//       .select({
//         ip: ip_logs.ip_address,
//         loginTime: ip_logs.login_time,
//         logoutTime: ip_logs.logout_time,
//         type: ip_logs.type,
//         coachId: coaches.id,
//         coachName: coaches.firstName,
//         email: coaches.email,
//       })
//       .from(ip_logs)
//       .leftJoin(coaches, eq(ip_logs.userId, coaches.id))
//       .where(eq(ip_logs.userId, userId));

//     return NextResponse.json({ success: true, data: result }, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching IP logs:", error);
//     return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
//   }
// }

// app/api/getCoachIpLogs/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ip_logs, users, coaches, enterprises } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const userIdParam = req.nextUrl.searchParams.get("userId");
    const type = req.nextUrl.searchParams.get("type"); // "player", "coach", or "enterprise"

    if (!userIdParam || !type) {
      return NextResponse.json({ success: false, message: "userId and type are required" }, { status: 400 });
    }

    const userId = parseInt(userIdParam);
    if (isNaN(userId)) {
      return NextResponse.json({ success: false, message: "Invalid userId" }, { status: 400 });
    }

    let result;

    if (type === "player") {
      result = await db
        .select({
          ip: ip_logs.ip_address,
          loginTime: ip_logs.login_time,
          logoutTime: ip_logs.logout_time,
          type: ip_logs.type,
          name: users.first_name,
          email: users.email,
        })
        .from(ip_logs)
        .leftJoin(users, eq(ip_logs.userId, users.id))
        .where(eq(ip_logs.userId, userId));
    } else if (type === "coach") {
      result = await db
        .select({
          ip: ip_logs.ip_address,
          loginTime: ip_logs.login_time,
          logoutTime: ip_logs.logout_time,
          type: ip_logs.type,
          name: coaches.firstName,
          email: coaches.email,
        })
        .from(ip_logs)
        .leftJoin(coaches, eq(ip_logs.userId, coaches.id))
        .where(eq(ip_logs.userId, userId));
    } else if (type === "enterprises") {
      result = await db
        .select({
          ip: ip_logs.ip_address,
          loginTime: ip_logs.login_time,
          logoutTime: ip_logs.logout_time,
          type: ip_logs.type,
          name: enterprises.organizationName,
          email: enterprises.email,
        })
        .from(ip_logs)
        .leftJoin(enterprises, eq(ip_logs.userId, enterprises.id))
        .where(eq(ip_logs.userId, userId));
    } else {
      return NextResponse.json({ success: false, message: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    console.error("IP logs fetch error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}



