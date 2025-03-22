import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Fetch user from database
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    // If no user found
    if (!user || user.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const userData = user[0]; // Extract first user

    // Check if password is correct
    const isValidPassword = await bcrypt.compare(password, userData.password);
    if (!isValidPassword) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Ensure JWT Secret exists
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in environment variables.");
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: userData.id, email: userData.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Return response with token
    return NextResponse.json({
      token,
      user: { 
        name: `${userData.firstName} ${userData.lastName}`, // Full name
        email: userData.email,
      },
    });
  } catch (error) {
    console.error("Signin Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
