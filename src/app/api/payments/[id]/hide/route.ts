// // app/api/payments/hide/[id]/route.ts
// import { db } from "@/lib/db";
// import { payments } from "@/lib/schema";
// import { eq } from "drizzle-orm";

// export async function PATCH(req: Request, { params }: { params: { id: string } }) {
//   const id = Number(params.id);

//   if (isNaN(id)) {
//     return new Response("Invalid ID", { status: 400 });
//   }

//   try {
//     await db
//       .update(payments)
//       .set({ is_deleted: 0 })
//       .where(eq(payments.evaluation_id, id));

//     return new Response("Payment hidden successfully", { status: 200 });
//   } catch (error) {
//     console.error("[PATCH /payments/hide/:id] Error:", error);
//     return new Response("Failed to hide payment", { status: 500 });
//   }
// }
// app/api/payments/hide/[id]/route.ts
import { db } from "@/lib/db";
import { payments } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    return new Response("Invalid ID", { status: 400 });
  }

  try {
    await db
      .update(payments)
      .set({ is_deleted: 0 })
      .where(eq(payments.evaluation_id, numericId));

    return new Response("Payment hidden successfully", { status: 200 });
  } catch (error) {
    console.error("[PATCH /payments/hide/:id] Error:", error);
    return new Response("Failed to hide payment", { status: 500 });
  }
}
