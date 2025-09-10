import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { coaches } from "@/lib/schema";
import { eq } from "drizzle-orm";
import nodemailer from "nodemailer";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const coachId = Number((await params).id);
    const { action } = await req.json(); // "approve" | "decline"

    if (isNaN(coachId)) {
      return NextResponse.json(
        { message: "Invalid coach ID" },
        { status: 400 }
      );
    }

    // Determine status
    let statusValue = 0;
    if (action === "approve") statusValue = 1;
    if (action === "decline") statusValue = 2;

    // Update coach status
    await db
      .update(coaches)
      .set({ approved_or_denied: statusValue })
      .where(eq(coaches.id, coachId));

    // Fetch coach details
    const [coach] = await db
      .select({
        email: coaches.email,
        firstName: coaches.firstName,
      })
      .from(coaches)
      .where(eq(coaches.id, coachId));

    if (coach?.email) {
      // Transporter (Gmail or custom SMTP)
      const transporter = nodemailer.createTransport({
        service: process.env.SMTP_HOST === "gmail" ? "gmail" : undefined,
        host:
          process.env.SMTP_HOST !== "gmail"
            ? process.env.SMTP_HOST
            : undefined,
        port:
          process.env.SMTP_HOST !== "gmail"
            ? Number(process.env.SMTP_PORT || 587)
            : undefined,
        secure:
          process.env.SMTP_HOST !== "gmail"
            ? process.env.SMTP_SECURE === "true"
            : undefined,
        auth: {
          user: process.env.SMTP_USER, // Gmail or SMTP user
          pass: process.env.SMTP_PASS, // Gmail App password or SMTP password
        },
      });

      // Email content
      const mailOptions = {
        from: `"Admin" <${process.env.SMTP_USER}>`,
        to: coach.email,
        subject: `Your Coach Application has been ${
          action === "approve" ? "Approved" : "Declined"
        }`,
        html:
          action === "approve"
            ? `<p>Hi ${coach.firstName},</p><p>Congratulations! Your application has been approved.</p>
               <p>Best regards,<br/>Admin Team</p>`
            : `<p>Hi ${coach.firstName},</p><p>We regret to inform you that your application has been declined.</p>
               <p>Best regards,<br/>Admin Team</p>`,
      };

      // Send email
      await transporter.sendMail(mailOptions);
    }

    return NextResponse.json({
      message: `Coach ${action === "approve" ? "approved" : "declined"} successfully`,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to update coach approval" },
      { status: 500 }
    );
  }
}
