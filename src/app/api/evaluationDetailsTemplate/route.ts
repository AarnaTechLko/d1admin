import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { sports, positions} from '../../../lib/schema';
import { eq, and, sql } from 'drizzle-orm';
// import serverSessionOrBust from '@lib/serverSession';

export async function GET(req: NextRequest) {

    try {

         const url = req.nextUrl;
    const evaluationId = Number(url.searchParams.get('evaluationId'));

    if (isNaN(evaluationId)) {
      return NextResponse.json({ error: 'Invalid evaluationId' }, { status: 400 });
    }
        const { searchParams } = new URL(req.url);
        const position = searchParams.get('position');
        const sport_id = searchParams.get('sport_id');

        // const evaluationTemplate = await db
        // .select({
        //     sport: sports.name,
        //     position: positions.name,
        //     categories: categories.name,
        //     categories_attributes: categories_attributes.name,
        // })
        // .from(sports)
        // .innerJoin(positions, and(eq(positions.sport_id, sports.id), eq(positions.id, Number(position))))
        // .innerJoin(categories, eq(categories.position_id, positions.id))
        // .innerJoin(categories_attributes, eq(categories_attributes.categories_id, categories.id))
        // .where(eq(sports.id, Number(sport)))


        //we use agg to store the categories in a array, and build_object to store the category attributes in a object
        const evaluationTemplate = await db
        .select({
            sport: sports.name,
            position: positions.name,
            categories: sql`(
                SELECT json_agg(
                    json_build_object('id',cT.id, 'name',cT.name, 'attributes',(
                            SELECT json_agg(
                                json_build_object('id', cA.id, 'name', cA.name)
                                ORDER BY cA.id ASC
                            )
                            FROM "categories_attributes" cA
                            WHERE cA.categories_id = cT.id
                        )
                    )
                    ORDER BY cT.display_order ASC
                )
                FROM "categories" cT
                WHERE cT.position_id = ${positions.id}            
            )`.as("categories"),
        })
        .from(sports)
        .innerJoin(positions, and(eq(positions.sport_id, sports.id), eq(positions.id, Number(position))))
        .where(eq(sports.id, Number(sport_id)))
        return NextResponse.json(evaluationTemplate);
    }
    catch (error){
        return NextResponse.json({ message: String(error) }, { status: 500 });
    }

}