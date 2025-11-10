import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ticket } from "@/lib/schema";
import { sql } from "drizzle-orm";

interface TicketRow {
  createdAt: string; // or Date if your DB returns Date
  updatedAt: string;
}

export async function GET() {
  try {
    const result = await db.execute(
      sql`SELECT createdAt, updatedAt FROM ${ticket}`
    );

    const today = new Date();
    const daysSet = new Set<number>();

    (result.rows as unknown as TicketRow[]).forEach((row) => {
      const created = new Date(row.createdAt);
      const updated = new Date(row.updatedAt);

      const diffCreated = Math.floor(
        (today.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
      );
      const diffUpdated = Math.floor(
        (today.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (!isNaN(diffCreated)) daysSet.add(diffCreated);
      if (!isNaN(diffUpdated)) daysSet.add(diffUpdated);
    });

    return NextResponse.json({
      days: Array.from(daysSet).sort((a, b) => a - b),
    });
  } catch (error) {
    console.error("Days fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch days options" },
      { status: 500 }
    );
  }
}

