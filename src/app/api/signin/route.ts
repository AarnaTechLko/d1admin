import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { admin, block_ips, ip_logs, role } from "@/lib/schema";
import { eq, and, or, sql, SQL } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

type GeoLocation = {
  ip?: string;
  city?: string;
  region?: string;
  country?: string;
  postal?: string;
  org?: string;
  loc?: string;
  timezone?: string;
};

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

async function getGeoLocation(): Promise<GeoLocation | null> {
  try {
    const token = "750b64ff1566ad";
    const res = await fetch(`https://ipinfo.io/json?token=${token}`);
    if (!res.ok) throw new Error("Failed to fetch IP info");
    return await res.json();
  } catch (error) {
    console.error("IPINFO fetch error:", error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const datag = await getGeoLocation();

    if (!datag || !datag.ip) {
      return NextResponse.json(
        { message: "Unable to determine your IP/location.", blocked: true },
        { status: 400 }
      );
    }

    const trimmedIp = datag.ip.trim();
    const trimmedCountry = datag.country?.trim() || "";
    const trimmedCity = datag.city?.trim() || "";
    const trimmedRegion = datag.region?.trim() || "";

    // Blocked IP/location check
    const [blockedEntry] = await db
      .select()
      .from(block_ips)
      .where(
        and(
          eq(block_ips.status, "block"),
          or(
            eq(block_ips.block_ip_address, trimmedIp),
            eq(block_ips.block_ip_address, trimmedCountry),
            eq(block_ips.block_ip_address, trimmedCity),
            eq(block_ips.block_ip_address, trimmedRegion)
          )
        )
      )
      .execute();

    if (blockedEntry) {
      const blockedValue = blockedEntry.block_ip_address;
      const blockReasons: Record<string, string> = {
        [trimmedIp]: `Access denied: Your IP (${trimmedIp}) is blocked.`,
        [trimmedCountry]: `Access denied: Your country (${trimmedCountry}) is blocked.`,
        [trimmedCity]: `Access denied: Your city (${trimmedCity}) is blocked.`,
        [trimmedRegion]: `Access denied: Your region (${trimmedRegion}) is blocked.`,
      };
      const message =
        blockReasons[blockedValue] ||
        "Access denied: Your location is blocked.";
      return NextResponse.json({ message, blocked: true }, { status: 403 });
    }

const isAdminCase = (trueValue: number | SQL<number>, falseValue: number | SQL<number>) =>
  sql<number>`CASE 
    WHEN ${admin.role} = 'admin' THEN ${trueValue} 
    ELSE ${falseValue} 
  END`;

const result = await db
  .select({
    id: admin.id,
    email: admin.email,
    username: admin.username,
    password_hash: admin.password_hash,
    role: admin.role,
    is_deleted: admin.is_deleted,

     changePassword: isAdminCase(1, sql`${role.change_password}`).as("changePassword"),

    monitor_activity: isAdminCase(1, sql`${role.monitor_activity}`).as("monitor_activity"),
    view_finance: isAdminCase(1, sql`${role.view_finance}`).as("view_finance"),
    access_ticket: isAdminCase(1, sql`${role.access_ticket}`).as("access_ticket"),
  })
  .from(admin)
  .leftJoin(role, eq(admin.id, role.user_id))
  .where(
    and(
      eq(admin.email, email),
      eq(admin.is_deleted, 1) // Only active accounts
    )
  )
  .limit(1)
  .execute();

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const currentUser = result[0];

    if (currentUser.is_deleted === 0) {
      return NextResponse.json(
        { error: "Account has been deleted. Please contact admin." },
        { status: 403 }
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      currentUser.password_hash
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        id: currentUser.id,
        email: currentUser.email,
        role: currentUser.role,
      },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    // Log IP
    await db.insert(ip_logs).values({
      userId: currentUser.id,
      ip_address: datag.ip?.toString() || "",
      type: "admin",
      login_time: new Date(),
      logout_time: null,
      created_at: new Date(),
      city: datag.city || null,
      region: datag.region || null,
      country: datag.country || null,
      postal: datag.postal || null,
      org: datag.org || null,
      loc: datag.loc || null,
      timezone: datag.timezone || null,
    });

    // Set cookies with permissions
    const cookieOptions =
      "HttpOnly; Path=/; Max-Age=3600; Secure; SameSite=Strict";
    const headers = new Headers();
    headers.append("Set-Cookie", `session_token=${token}; ${cookieOptions}`);
    headers.append("Set-Cookie", `user_id=${currentUser.id}; ${cookieOptions}`);
    headers.append(
      "Set-Cookie",
      `user_name=${currentUser.username}; ${cookieOptions}`
    );
    headers.append("Set-Cookie", `role=${currentUser.role}; ${cookieOptions}`);
    headers.append(
      "Set-Cookie",
      `change_password=${currentUser.changePassword || 0}; ${cookieOptions}`
    );
    headers.append(
      "Set-Cookie",
      `monitor_activity=${currentUser.monitor_activity || 0}; ${cookieOptions}`
    );
    headers.append(
      "Set-Cookie",
      `view_finance=${currentUser.view_finance || 0}; ${cookieOptions}`
    );
    headers.append(
      "Set-Cookie",
      `access_ticket=${currentUser.access_ticket || 0}; ${cookieOptions}`
    );
    headers.append("Content-Type", "application/json");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Signin successful",
        token,
        user_id: currentUser.id,
        role: currentUser.role,
        username: currentUser.username,
        email: currentUser.email,
        change_password: currentUser.changePassword || 0,
        monitor_activity: currentUser.monitor_activity || 0,
        view_finance: currentUser.view_finance || 0,
        access_ticket: currentUser.access_ticket || 0,
      }),
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
