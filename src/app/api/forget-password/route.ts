import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { admin, forgetPassword } from "@/lib/schema";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // 1️⃣ Fetch admin
    const adminUser = await db.query.admin.findFirst({
      where: eq(admin.email, email),
    });

    // 🔐 Always same response (security)
    if (!adminUser) {
      return NextResponse.json(
        { message: "This email is not registered as admin" },
        { status: 404 }
      );
    }

    // 2️⃣ Generate token
    const token = crypto.randomBytes(32).toString("hex");

    // 3️⃣ Store token
    await db.insert(forgetPassword).values({
      email: adminUser.email,
      token,
      role: "admin",
    });

    // 4️⃣ Create reset link
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    // 5️⃣ Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 6️⃣ Send email
    await transporter.sendMail({
      from: `"Reset Admin Password" <${process.env.SMTP_USER}>`,
      to: adminUser.email,
      subject: "Reset Your Admin Password",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Password Reset Request</h2>
          <p>Hello ${adminUser.username ?? "Admin"},</p>
          <p>You requested to reset your admin password.</p>
          <p>
            <a 
              href="${resetLink}"
              style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:4px;"
            >
              Reset Password
            </a>
          </p>
          <p>This link is valid for a limited time.</p>
          <p>If you didn’t request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({
      message: "Reset link sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
