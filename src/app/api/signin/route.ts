import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { admin } from "@/lib/schema";
import { eq } from "drizzle-orm"; // Import eq
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        // Find admin by email
        const user = await db.select().from(admin).where(eq(admin.email, email));
        if (user.length === 0) {
            return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user[0].password_hash);
        if (!validPassword) {
            return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user[0].id, email: user[0].email }, SECRET_KEY, { expiresIn: "1h" });

        return NextResponse.json({ message: "Signin successful", token }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Internal server error",error }, { status: 500 });
    }
}
