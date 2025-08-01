import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { admin, block_ips, ip_logs } from "@/lib/schema";
import { eq,and,or } from "drizzle-orm";
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
    const token = '750b64ff1566ad';
    const res = await fetch(`https://ipinfo.io/json?token=${token}`);
    if (!res.ok) throw new Error("Failed to fetch IP info");
    const data = await res.json();
    return data; // contains ip, city, region, country, etc.
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
      { message: 'Unable to determine your IP/location.', blocked: true },
      { status: 400 }
    );
  }

  const trimmedIp = datag.ip.trim();
  const trimmedCountry = datag.country?.trim() || '';
  const trimmedCity = datag.city?.trim() || '';
  const trimmedRegion = datag.region?.trim() || '';

  console.log("Geo Data:", { trimmedIp, trimmedCountry, trimmedCity, trimmedRegion });

  const [blockedEntry] = await db
    .select()
    .from(block_ips)
    .where(
      and(
        eq(block_ips.status, 'block'),
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
      [trimmedRegion]: `Access denied: Your region (${trimmedRegion}) is blocked.`
    };
    const message = blockReasons[blockedValue] || 'Access denied: Your location is blocked.';

    return NextResponse.json(
      { message, blocked: true },
      { status: 403 }
    );
  }

    const users = await db.select().from(admin).where(eq(admin.email, email));
    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const currentUser = users[0];

    const isPasswordValid = await bcrypt.compare(password, currentUser.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
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

    // ✅ Insert into ip_logs with logout_time = null
    await db.insert(ip_logs).values({
      userId: currentUser.id,
      ip_address: datag.ip?.toString() || '',
      type: 'admin',
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
   


    const cookieOptions = "HttpOnly; Path=/; Max-Age=3600; Secure; SameSite=Strict";
    const headers = new Headers();
    headers.append("Set-Cookie", `session_token=${token}; ${cookieOptions}`);
    headers.append("Set-Cookie", `user_id=${currentUser.id}; ${cookieOptions}`);
    headers.append("Set-Cookie", `role=${currentUser.role}; ${cookieOptions}`);
    headers.append("Content-Type", "application/json");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Signin successful",
        token,
        user_id: currentUser.id,
        role: currentUser.role,
      }),
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
