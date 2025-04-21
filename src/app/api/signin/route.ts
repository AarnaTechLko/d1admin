import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { admin } from "@/lib/schema";
import { eq } from "drizzle-orm"; 
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

export async function POST(req: Request) {
    try {

        
        const { email, password } = await req.json();

        // Check if user exists
        const user = await db.select().from(admin).where(eq(admin.email, email));
        if (user.length === 0) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }

        // Validate password
        const validPassword = await bcrypt.compare(password, user[0].password_hash);
        if (!validPassword) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }

        // ✅ Generate JWT token including user_id
        const token = jwt.sign({ id: user[0].id, email: user[0].email }, SECRET_KEY, { expiresIn: "1h" });

        // ✅ Set multiple cookies
        const headers = new Headers();
        headers.append("Set-Cookie", `session_token=${token}; HttpOnly; Path=/; Max-Age=3600; Secure; SameSite=Strict`);
        headers.append("Set-Cookie", `user_id=${user[0].id}; HttpOnly; Path=/; Max-Age=3600; Secure; SameSite=Strict`);
        headers.append("Content-Type", "application/json");

        // ✅ Return both token & user_id
        return new Response(JSON.stringify({ 
            success: true, 
            message: "Signin successful", 
            token,
            user_id: user[0].id // ✅ Include user_id in response
        }), {
            status: 200,
            headers: headers,
        });

    } catch (error) {
        console.error("Signin error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
