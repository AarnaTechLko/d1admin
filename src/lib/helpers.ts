// src/lib/helpers.ts
import "server-only"; // ✅ THIS LINE FIXES THE fs ERROR

import nodemailer from "nodemailer";
import crypto from "crypto";

/* ---------------------------------- TYPES --------------------------------- */
interface SendEmailParams {
  to: string;
  cc?: string | null;
  subject: string;
  text: string;
  html: string;
}

/* ----------------------------- ENCRYPTION SETUP ---------------------------- */
const SECRET_KEY =
  process.env.SECRET_KEY || "0123456789abcdef0123456789abcdef"; // 32 bytes
const IV_LENGTH = 16;

/* ------------------------------ ENCRYPT DATA ------------------------------- */
export const encryptData = (data: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(SECRET_KEY),
    iv
  );

  const encrypted =
    cipher.update(data, "utf8", "hex") + cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
};

/* ------------------------------ DECRYPT DATA ------------------------------- */
export const decryptData = (encryptedData: string): string => {
  const [iv, encrypted] = encryptedData.split(":");

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(SECRET_KEY),
    Buffer.from(iv, "hex")
  );

  return (
    decipher.update(encrypted, "hex", "utf8") +
    decipher.final("utf8")
  );
};

/* -------------------------------- SEND EMAIL ------------------------------- */
export async function sendEmail({
  to,
  cc,
  subject,
  text,
  html,
}: SendEmailParams) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });

  const info = await transporter.sendMail({
    from: `"D1 NOTES" <${process.env.SMTP_USER}>`,
    to,
    cc: cc || undefined,
    subject,
    text,
    html,
  });

  return { success: true, info };
}

/* -------------------------- PASSWORD GENERATOR ----------------------------- */
export const generateRandomPassword = (length = 12): string => {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@$!%*?";
  return Array.from({ length }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};
