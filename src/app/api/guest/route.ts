import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guestUser } from "@/lib/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {

    const data = await db
      .select()
      .from(guestUser)
      .orderBy(desc(guestUser.id));
// console.log("data",data);
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
  console.error("GET ERROR:", error);

  let message = "Something went wrong";

  // Safely extract message
  if (error instanceof Error) {
    message = error.message;
  }

  return NextResponse.json(
    { success: false, error: message },
    { status: 500 }
  );
}

}
