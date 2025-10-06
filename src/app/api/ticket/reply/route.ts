import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ticket, ticket_messages } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const ticketId = formData.get("ticketId")?.toString();
    const repliedBy = formData.get("repliedBy")?.toString();
    const message = formData.get("message")?.toString();
    const status = formData.get("status")?.toString();
    const priority = formData.get("priority")?.toString(); // ✅ New
    const file = formData.get("attachment") as File | null;
    const escalate = formData.get("escalate") === "true"; // ✅ define escalate

    if (!ticketId || !repliedBy || !message || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let filename = "";

    // ✅ Upload to S3
    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const key = `tickets/${Date.now()}-${file.name}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: key,
          Body: buffer,
          ContentType: file.type,
        })
      );

      // Use CloudFront URL if available, otherwise fallback to S3 URL
      filename = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_LINK
        ? `${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_LINK}/${key}`
        : `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    }

    // ✅ Insert reply with priority
    const [insertedReply] = await db
      .insert(ticket_messages)
      .values({
        ticket_id: Number(ticketId),
        replied_by: repliedBy,
        message,
        status,
        priority: priority || "medium", // default if not provided
        createdAt: new Date(),
        filename,
      })
      .returning();

    // ✅ Update ticket status + last message
    await db
      .update(ticket)
      .set({
        status,
        message,
         escalate,
        priority: priority || "medium", // update ticket priority as well
      })
      .where(eq(ticket.id, Number(ticketId)));

    return NextResponse.json(
      { success: true, reply: insertedReply },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading file or saving ticket reply:", error);
    return NextResponse.json(
      { error: "Internal server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}


export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    await db.delete(ticket_messages).where(eq(ticket_messages.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete reply error:", error);
    return NextResponse.json(
      { error: "Failed to delete", details: (error as Error).message },
      { status: 500 }
    );
  }
}
