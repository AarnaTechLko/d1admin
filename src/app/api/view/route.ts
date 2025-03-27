import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { coaches, joinRequest, playerEvaluation, users, countries, licenses, evaluation_charges } from '../../../lib/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    const { slug, loggeInUser } = await req.json();

    try {
        const coachlist = await db
            .select({
                firstName: coaches.firstName,
                lastName: coaches.lastName,
                id: coaches.id,
                expectedCharge: coaches.expectedCharge,
                createdAt: coaches.createdAt,
                slug: coaches.slug,
                rating: coaches.rating,
                gender: coaches.gender,
                location: coaches.location,
                sport: coaches.sport,
                clubName: coaches.clubName,
                currency: coaches.currency,
                qualifications: coaches.qualifications,
                certificate: coaches.certificate,
                country: countries.name,
                state: coaches.state,
                city: coaches.city,
                enterprise_id: coaches.enterprise_id,
                image: coaches.image,
                facebook: coaches.facebook,
                linkedin: coaches.linkedin,
                instagram: coaches.instagram,
                xlink: coaches.xlink,
                youtube: coaches.youtube,
                license: coaches.license,
                cv: coaches.cv,
                licenseType: coaches.license_type,
            })
            .from(coaches)
            .leftJoin(
                countries,
                eq(countries.id, Number(coaches.country)) // Ensure type consistency
            )
            .where(eq(coaches.slug, slug))
            .limit(1)
            .execute();

        if (!coachlist || coachlist.length === 0) {
            return NextResponse.json({ message: "Coach not found" }, { status: 404 });
        }

        const coach = coachlist[0];

        const evaluationlist = await db
            .select({
                id: playerEvaluation.id,
                review_title: playerEvaluation.review_title,
                rating: playerEvaluation.rating,
                first_name: users.first_name,
                last_name: users.last_name,
                image: users.image,
                remarks: playerEvaluation.remarks,
            })
            .from(playerEvaluation)
            .innerJoin(users, eq(playerEvaluation.player_id, users.id))
            .where(and(eq(playerEvaluation.coach_id, coach.id), eq(playerEvaluation.status, 2)))
            .execute();

        const requested = await db
            .select()
            .from(joinRequest)
            .where(and(eq(joinRequest.player_id, Number(loggeInUser)), eq(joinRequest.requestToID, coach.id))) // Convert loggeInUser
            .execute();

        const isRequested = requested.length > 0; // Convert to boolean

        let totalLicenses = "notavailable";
        if (coach.enterprise_id !== null) {
            const availableLicenses = await db
                .select()
                .from(licenses)
                .where(eq(licenses.enterprise_id, Number(coach.enterprise_id))) // Convert enterprise_id
                .execute();

            totalLicenses = availableLicenses.length > 0 ? "available" : "notavailable";
        }

        const evaluationCharges = await db
            .select()
            .from(evaluation_charges)
            .where(eq(evaluation_charges.coach_id, Number(coach.id))) // Ensure correct type
            .execute();

        return NextResponse.json({
            coachdata: coach,
            evaluationlist,
            isRequested,
            totalLicenses,
            evaluationCharges,
        });
    }catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error fetching data:", error.message);
        } else {
          console.error("An unknown error occurred:", error);
        }
      }
      
}

export async function GET(req: NextRequest) {
    const { slug, loggeInUser } = await req.json();

    const url = new URL(req.url);
    // const slug = url.searchParams.get("slug");
    const loggedInUser = url.searchParams.get("loggedInUser");

    
    console.log("Incoming Request Slug:", slug); // Debugging log
    console.log("Incoming Request LoggedInUser:", loggedInUser);
    if (!slug) {
        return NextResponse.json({ message: "Slug is required" }, { status: 400 });
    }

    try {
        const coachlist = await db
            .select({
                firstName: coaches.firstName,
                lastName: coaches.lastName,
                id: coaches.id,
                expectedCharge: coaches.expectedCharge,
                createdAt: coaches.createdAt,
                slug: coaches.slug,
                rating: coaches.rating,
                gender: coaches.gender,
                location: coaches.location,
                sport: coaches.sport,
                clubName: coaches.clubName,
                currency: coaches.currency,
                qualifications: coaches.qualifications,
                certificate: coaches.certificate,
                country: countries.name,
                state: coaches.state,
                city: coaches.city,
                enterprise_id: coaches.enterprise_id,
                image: coaches.image,
                facebook: coaches.facebook,
                linkedin: coaches.linkedin,
                instagram: coaches.instagram,
                xlink: coaches.xlink,
                youtube: coaches.youtube,
                license: coaches.license,
                cv: coaches.cv,
                licenseType: coaches.license_type,
            })
            .from(coaches)
            .leftJoin(countries, eq(countries.id, Number(coaches.country)))
            .where(eq(coaches.slug, slug))
            .limit(1)
            .execute();

        if (!coachlist || coachlist.length === 0) {
            return NextResponse.json({ message: "Coach not found" }, { status: 404 });
        }

        const coach = coachlist[0];

        const evaluationlist = await db
            .select({
                id: playerEvaluation.id,
                review_title: playerEvaluation.review_title,
                rating: playerEvaluation.rating,
                first_name: users.first_name,
                last_name: users.last_name,
                image: users.image,
                remarks: playerEvaluation.remarks,
            })
            .from(playerEvaluation)
            .innerJoin(users, eq(playerEvaluation.player_id, users.id))
            .where(and(eq(playerEvaluation.coach_id, coach.id), eq(playerEvaluation.status, 2)))
            .execute();

        const requested = await db
            .select()
            .from(joinRequest)
            .where(and(eq(joinRequest.player_id, Number(loggedInUser)), eq(joinRequest.requestToID, coach.id)))
            .execute();

        const isRequested = requested.length > 0;

        let totalLicenses = "notavailable";
        if (coach.enterprise_id !== null) {
            const availableLicenses = await db
                .select()
                .from(licenses)
                .where(eq(licenses.enterprise_id, Number(coach.enterprise_id)))
                .execute();

            totalLicenses = availableLicenses.length > 0 ? "available" : "notavailable";
        }

        const evaluationCharges = await db
            .select()
            .from(evaluation_charges)
            .where(eq(evaluation_charges.coach_id, Number(coach.id)))
            .execute();

        return NextResponse.json({
            coachdata: coach,
            evaluationlist,
            isRequested,
            totalLicenses,
            evaluationCharges,
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error fetching data:", error.message);
            return NextResponse.json({ message: "Failed to fetch coach data", error: error.message }, { status: 500 });
        } else {
            console.error("An unknown error occurred:", error);
            return NextResponse.json({ message: "An unknown error occurred", error: String(error) }, { status: 500 });
        }
    }
}