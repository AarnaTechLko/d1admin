import { db } from "@/lib/db";
import { coaches } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/Auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Await params (IMPORTANT)
    const { id } = await params;
    const coachId = Number(id);

    if (isNaN(coachId)) {
      return NextResponse.json({ error: "Invalid coach ID" }, { status: 400 });
    }

    // ✅ Parse body
    const { newPassword } = await req.json();
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // 🔎 Fetch coach
    const coach = await db.query.coaches.findFirst({
      where: eq(coaches.id, coachId),
    });

    if (!coach) {
      return NextResponse.json({ error: "Coach not found" }, { status: 404 });
    }

    if (!coach.email) {
      return NextResponse.json(
        { error: "Coach does not have a valid email" },
        { status: 400 }
      );
    }

    // 🔒 Hash & update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db
      .update(coaches)
      .set({ password: hashedPassword })
      .where(eq(coaches.id, coachId));

    // 📧 Send email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"D1Admin" <${process.env.SMTP_USER}>`,
      to: coach.email,
      subject: "Your New Coach Password",
      html: `
        <p>Dear ${coach.firstName || "Coach"},</p>
        <p>Your new password is:</p>
        <p><strong>${newPassword}</strong></p>
        <p>Please log in and change your password immediately.</p>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Password updated and emailed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
