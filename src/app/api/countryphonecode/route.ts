import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { countries } from "@/lib/schema";

export async function GET() {
  try {
    
const countryList = await db
  .select({
    id: countries.id,
    shortname: countries.shortname,
    phonecode: countries.phonecode,
  })
  .from(countries);
    return NextResponse.json({
       countries: countryList, 
    });
  } catch (error) {
    console.error("GET /api/admin error:", error);
    return NextResponse.json(
      { message: "Failed to fetch admin", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}