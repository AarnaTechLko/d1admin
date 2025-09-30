import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { coaches } from "@/lib/schema";
import { asc } from "drizzle-orm"; // <-- import asc

export async function GET() {
  try {
    // Fetch distinct verified values using groupBy
    const verifiedValues = await db
      .select({ verified: coaches.verified })
      .from(coaches)
      .groupBy(coaches.verified)
      .orderBy(asc(coaches.verified)); // <-- use asc() helper

    const options = verifiedValues.map((v) => ({
      value: v.verified?.toString() ?? "0",
      label: v.verified === 1 ? "Active" : "Inactive",
    }));

    return NextResponse.json(options);
  } catch (error) {
    console.error("Error fetching crowned options:", error);
    return NextResponse.json({ error: "Failed to fetch crowned options" }, { status: 500 });
  }
}
