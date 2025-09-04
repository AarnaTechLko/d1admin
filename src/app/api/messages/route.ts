import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { admin_message } from "@/lib/schema";
import { eq, or } from "drizzle-orm";

export type AdminMessage = {
  id: number;
  sender_id: number | null;
  receiver_id: number;
  message: string;
  status: number | null;
  read: number | null;
  created_at: Date | null;
  updated_at: Date | null;
  methods: string[];
  position: "left" | "right"; // for UI positioning
  bgColor: "green" | "blue";  // for background color
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // player | coach | organization
    const id = Number(searchParams.get("id"));

    if (!type || !id) {
      return NextResponse.json(
        { error: "Missing required query params: type and id" },
        { status: 400 }
      );
    }

    if (!["player", "coach", "organization"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be player, coach, or organization" },
        { status: 400 }
      );
    }

    const rows = await db
      .select({
        id: admin_message.id,
        sender_id: admin_message.sender_id,
        receiver_id: admin_message.receiver_id,
        message: admin_message.message,
        status: admin_message.status,
        read: admin_message.read,
        created_at: admin_message.created_at,
        updated_at: admin_message.updated_at,
        methods: admin_message.methods,
      })
      .from(admin_message)
      .where(
        or(
          eq(admin_message.receiver_id, id),
          eq(admin_message.sender_id, id)
        )
      );

    const messages: AdminMessage[] = rows.map((row) => {
      const methodsArray = row.methods ? JSON.parse(row.methods) : [];

      // Determine position and bgColor based on sender/receiver
      const position = row.receiver_id === id ? "left" : "right";
      const bgColor = row.receiver_id === id ? "green" : "blue";

      return {
        ...row,
        methods: methodsArray,
        position,
        bgColor,
      };
    });

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error("❌ GET Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
