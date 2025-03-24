import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Ensure db is correctly set up
import { admin } from "@/lib/schema"; // Import your schema
import { eq } from "drizzle-orm"; // Import eq for queries
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { username, email, password } = await req.json();

        // Check if email already exists
        const existingAdmin = await db.select().from(admin).where(eq(admin.email, email));
        if (existingAdmin.length > 0) {
            return NextResponse.json({ message: "Email already in use" }, { status: 400 });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert admin into database
        await db.insert(admin).values({
            username,
            email,
            password_hash: hashedPassword,
        });

        return NextResponse.json({ message: "Signup successful" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
