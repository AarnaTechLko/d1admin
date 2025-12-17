import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ticket, ticket_messages } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * ✅ S3 Client
 * Works with env credentials OR IAM role
 */
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

/**
 * ✅ File validation rules
 */
const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/pdf",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const ticketId = formData.get("ticketId")?.toString();
    const repliedBy = formData.get("repliedBy")?.toString();
    const message = formData.get("message")?.toString();
    const status = formData.get("status")?.toString();
    const priority = formData.get("priority")?.toString() || "medium";
    const escalate = formData.get("escalate") === "true";
    const file = formData.get("attachment") as File | null;

    if (!ticketId || !repliedBy || !message || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let filename = "";

    /**
     * ✅ Upload attachment to S3 (if exists)
     */
    if (file && file.size > 0) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: "Invalid file type" },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "File size must be less than 5MB" },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      const safeName = file.name.replace(/\s+/g, "_");
      const key = `tickets/${Date.now()}-${safeName}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: key,
          Body: buffer,
          ContentType: file.type,
        })
      );

      filename = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_LINK
        ? `${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_LINK}/${key}`
        : `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    }
// console.log('upload  s3 buckte files:',filename);
    /**
     * ✅ Insert reply
     */
    const [insertedReply] = await db
      .insert(ticket_messages)
      .values({
        ticket_id: Number(ticketId),
        replied_by: repliedBy,
        message,
        status,
        priority,
        filename,
        read: 1,
        createdAt: new Date(),
      })
      .returning();

    /**
     * ✅ Update ticket
     */
    await db
      .update(ticket)
      .set({
        status,
        message,
        priority,
        escalate,
      })
      .where(eq(ticket.id, Number(ticketId)));

    return NextResponse.json(
      {
        success: true,
        reply: insertedReply,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Ticket reply upload error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: (error as Error).message,
      },
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
