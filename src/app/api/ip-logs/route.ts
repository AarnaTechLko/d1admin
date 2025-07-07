// src/app/api/ip-logs/route.ts
import { db } from "@/lib/db";
import { ip_logs } from "@/lib/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await db.select().from(ip_logs);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching IP logs:", error);
    return NextResponse.json({ error: "Failed to fetch IP logs" }, { status: 500 });
  }
}
