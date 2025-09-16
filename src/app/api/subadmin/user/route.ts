
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {admin,} from "@/lib/schema";
import { eq } from "drizzle-orm";


export async function GET(req: NextRequest) {

    try {
        const url = new URL(req.url);
        const user_id = url.searchParams.get("userId");



        if(!user_id){
            throw new Error("user_id couldn't be found");
        }

        const user = await db
            .select({
                username: admin.username,
                email: admin.email,
                birthdate: admin.birthdate,
                image: admin.image,
            })
            .from(admin)
            .where(eq(admin.id, Number(user_id)))

        console.log("Data: ", user)

        return NextResponse.json(
            {user},
            { status: 200}
        )
    }
    catch(error){
      console.error('Error saving image:', error);
      
        return NextResponse.json(
        { error: "Failed to fetch coaches" },
        { status: 500 }
        );
    }
}