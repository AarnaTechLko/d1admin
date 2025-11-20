import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guestMessages } from "@/lib/schema";
import { eq } from "drizzle-orm";

// ---------------------
// GET MESSAGES
// ---------------------
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const chatId = url.searchParams.get("chatId");

    if (!chatId) {
      return NextResponse.json(
        { success: false, error: "chatId missing" },
        { status: 400 }
      );
    }

    const messages = await db
      .select()
      .from(guestMessages)
      .where(eq(guestMessages.chatId, Number(chatId)))
      .orderBy(guestMessages.createdAt);

    return NextResponse.json({ success: true, data: messages });
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

// ---------------------
// POST MESSAGE
// ---------------------
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { chatId, message, sender } = body;

    if (!chatId || !message || !sender) {
      return NextResponse.json(
        { success: false, error: "Missing fields" },
        { status: 400 }
      );
    }

    await db.insert(guestMessages).values({
      chatId: Number(chatId),
      message,
      sender,
      createdAt: new Date().toISOString(),  // FIXED
    });

    return NextResponse.json({ success: true });
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
