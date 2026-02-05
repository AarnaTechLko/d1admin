import { db } from "@/lib/db";
import { users, coaches } from "@/lib/schema";
import { and, eq, lt } from "drizzle-orm";

export async function autoUnsuspendUser(
  userId: number,
  role: "player" | "coach"
) {
  const table = role === "player" ? users : coaches;

  const today = new Date().toISOString().split("T")[0];

  await db
    .update(table)
    .set({
      suspend: 1,
      suspend_days: null,
      suspend_start_date: null,
      suspend_end_date: null,
    })
    .where(
      and(
        eq(table.id, userId),
        eq(table.suspend, 0),
        lt(table.suspend_end_date, today) // ✅ STRING vs STRING
      )
    );
}
