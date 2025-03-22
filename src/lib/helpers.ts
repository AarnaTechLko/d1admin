// sendEmail.ts
import nodemailer from "nodemailer";
import crypto from "crypto";

interface SendEmailParams {
  to: string;
  cc?: string | null; // Optional CC field
  subject: string;
  text: string;
  html: string;
}

// Secret key for encryption (store in .env for security)
const SECRET_KEY = process.env.SECRET_KEY || "0123456789abcdef0123456789abcdef";
const IV_LENGTH = 16; // AES Initialization Vector length

/** 
 * Encrypts data using AES-256-CBC encryption 
 */
export const encryptData = (data: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(SECRET_KEY, "utf-8"),
    iv
  );
  let encrypted = cipher.update(data, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
};

/**
 * Decrypts data using AES-256-CBC encryption 
 */
export const decryptData = (encryptedData: string): string => {
  const [iv, encrypted] = encryptedData.split(":");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(SECRET_KEY, "utf-8"),
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(encrypted, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
};

/**
 * Sends an email using Nodemailer with Gmail SMTP.
 */
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
    secure: false, // false for TLS, true for SSL
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"D1 NOTES" <${process.env.SMTP_USER}>`,
      to,
      cc: cc || undefined,
      subject,
      text,
      html,
    });

    return { success: true, info };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

/**
 * Generates a secure random password with a mix of letters, numbers, and symbols.
 */
export const generateRandomPassword = (length = 12): string => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?";
  return Array.from({ length }, () =>
    charset.charAt(Math.floor(Math.random() * charset.length))
  ).join("");
};
