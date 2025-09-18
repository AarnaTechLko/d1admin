import { NextRequest, NextResponse } from 'next/server';
// import { hash } from 'bcryptjs';
import { db } from '../../../lib/db';
import {
  admin,
} from '../../../lib/schema';
import { eq } from 'drizzle-orm';


// import { SECRET_KEY } from '@/lib/constants';
// import jwt from 'jsonwebtoken';


export async function PATCH(req: NextRequest){

    try {

        const {key, userId} = await req.json();


        await db
            .update(admin)
            .set({
                image: key,
            })
            .where(eq(admin.id, userId));

        return NextResponse.json({ message: "Image was uploaded" }, { status: 200 });
    }
    catch (error){
        console.log('Error: ', error);
        return NextResponse.json(
            { message: 'Internal server error. Please try again later.' },
            { status: 500 }
        );
    }

}