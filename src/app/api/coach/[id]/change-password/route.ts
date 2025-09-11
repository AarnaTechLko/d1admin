import { db } from '@/lib/db';
import { coaches } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const coachId = Number((await params).id);
    const { newPassword } = await req.json();

    // 🔎 Fetch coach email
    const coach = (
      await db.select().from(coaches).where(eq(coaches.id, coachId))
    )[0];
    if (!coach) {
      return NextResponse.json({ error: "Coach not found" }, { status: 404 });
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // 🔒 Hash and update password
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.update(coaches).set({ password: hashed }).where(eq(coaches.id, coachId));

    // 📧 Send password via email
    if (!coach.email) {
      return NextResponse.json(
        { error: "Coach does not have a valid email" },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
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
        <p>Your new password is: <strong>${newPassword}</strong></p>
        <p>Please log in and change your password immediately.</p>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Password assigned and emailed to coach",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
