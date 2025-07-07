import { db } from "@/lib/db";
import { ip_logs, block_ips } from "@/lib/schema";
import { count, eq ,and} from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { ipToBlock } = await req.json();

    // ✅ Check if IP is already blocked
    const existing = await db
      .select()
      .from(block_ips)
      .where(eq(block_ips.block_ip_address, ipToBlock));

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "IP already blocked" },
        { status: 400 }
      );
    }

    // ✅ Count users who used this IP (using LEFT JOIN + GROUP BY for consistency)
    const ipCountResult = await db
      .select({
        ip: ip_logs.ip_address,
        user_count: count(ip_logs.userId).as("user_count"),
      })
      .from(ip_logs)
      .where(eq(ip_logs.ip_address, ipToBlock))
      .groupBy(ip_logs.ip_address);

    const userCount = ipCountResult[0]?.user_count ?? 0;

    // ✅ Insert IP into block_ips table
    await db.insert(block_ips).values({
      block_ip_address: ipToBlock,
      user_count: userCount,
      status: "block",
    });

    return NextResponse.json({
      success: true,
      message: `IP blocked successfully for ${userCount} user(s).`,
    });
  } catch (error) {
    console.error("Block IP error:", error);
    return NextResponse.json(
      { error: "Failed to block IP" },
      { status: 500 }
    );
  }
}


export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("search");

    // Optional search filter
    const whereClause = search
      ? and(eq(block_ips.status, "block"), eq(block_ips.block_ip_address, search))
      : eq(block_ips.status, "block");

    const results = await db
      .select()
      .from(block_ips)
      .where(whereClause);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Fetch blocked IPs error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}