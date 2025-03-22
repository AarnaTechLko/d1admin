import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

// Ensure JWT_SECRET is defined
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is required but not defined in environment variables.");
}

export async function POST(req: Request) {
  try {
    const { fname, lname, email, password } = await req.json();

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into database
    const insertedUsers = await db.insert(users)
      .values({
        firstName: fname,
        lastName: lname,
        email,
        password: hashedPassword,
      })
      .returning();

    if (insertedUsers.length === 0) {
      return NextResponse.json({ error: "User creation failed" }, { status: 500 });
    }

    const newUser = insertedUsers[0];

    // Generate JWT (✅ Ensured JWT_SECRET is always defined)
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET as string, // Ensure TypeScript recognizes it as a valid string
      { expiresIn: "1h" }
    );

    // Set HTTP-only cookie
    const response = NextResponse.json(
      { message: "User registered successfully", user: { id: newUser.id, email: newUser.email } },
      { status: 201 }
    );

    response.headers.append("Set-Cookie", serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 3600, // 1 hour
    }));

    return response;

  } catch (error) {
    console.error("❌ Signup error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
