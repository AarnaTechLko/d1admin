import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { admin_payment_logs, admin } from "@/lib/schema";
import { eq } from "drizzle-orm";

// GET /api/admin/logs?payment_id=123
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const payment_id = searchParams.get("payment_id");

    if (!payment_id) {
      return NextResponse.json({ error: "Payment Id is required" }, { status: 400 });
    }
    const rawReplies = await db
      .select({
        id: admin_payment_logs.id,
        admin_name: admin.username,
        action_reason: admin_payment_logs.action_reason,
        action_type: admin_payment_logs.action_type,
        created_at: admin_payment_logs.created_at,
      })
      .from(admin_payment_logs)
      .innerJoin(admin, eq(admin.id, admin_payment_logs.admin_id))
      .where(eq(admin_payment_logs.payment_id, Number(payment_id)))
      .orderBy(admin_payment_logs.created_at);

    const replies = rawReplies.map((reply) => ({
        id: reply.id,
        admin_name: reply.admin_name,
        action_reason: reply.action_reason,
        action_type: reply.action_type,
        created_at: reply.created_at,
    }));

    console.log("Relies: ", replies);

    return NextResponse.json({ replies }, { status: 200 });

  } catch (error) {
    console.error("Failed to fetch admin logs:", error);
    return NextResponse.json({ error: "Failed to fetch admin logs" }, { status: 500 });
  }
}
