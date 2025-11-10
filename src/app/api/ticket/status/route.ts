import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ticket } from "@/lib/schema";
import { sql } from "drizzle-orm";

interface StatusRow {
  status: string; // or number if your status is numeric
}

export async function GET() {
  try {
    const result = await db.execute(
      sql`SELECT DISTINCT status FROM ${ticket}`
    );

    // Cast through unknown first
    const statuses = (result.rows as unknown as StatusRow[]).map(row => row.status);

    return NextResponse.json({ statuses });
  } catch (error) {
    console.error("Status fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket status" },
      { status: 500 }
    );
  }
}
