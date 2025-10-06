
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { evaluationResults, ranking, users } from "@/lib/schema";
import { eq, inArray } from "drizzle-orm";

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

interface JwtPayload {
    id: number;
    email?: string;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { playerId, rank } = body;

        if (!playerId || rank === undefined) {
            return NextResponse.json(
                { error: "Missing required fields: playerId or rank" },
                { status: 400 }
            );
        }

        const cookieHeader = req.headers.get("cookie") || "";
        const cookies = Object.fromEntries(
            cookieHeader.split("; ").map((c) => {
                const [key, ...v] = c.split("=");
                return [key, decodeURIComponent(v.join("="))];
            })
        );

        const token = cookies["session_token"];
        // if (!token) {
        //     return NextResponse.json({ error: "Unauthorized, no token found" }, { status: 401 });
        // }
        if (!token) {
            return NextResponse.redirect(new URL("/auth/signout", req.url));
        }
        let decoded: JwtPayload;
        try {
            decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
        } catch (err) {
            console.error("JWT verification failed:", err);
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
        }

        const currentUserId = decoded.id;

        // Insert ranking
        const inserted = await db
            .insert(ranking)
            .values({
                playerId: Number(playerId),
                rank: Number(rank),
                addedBy: currentUserId,
                createdAt: new Date(),
            })
            .returning();

        // Convert playerId to string in the response
        const responseData = inserted.map((r) => ({
            ...r,
            playerId: String(r.playerId),
        }));

        return NextResponse.json({
            message: "Ranking added successfully",
            data: responseData,
        });

    } catch (err) {
        console.error("POST /api/ranking error:", err);
        return NextResponse.json({ error: "Failed to add ranking" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const rankingPlayers = await db.select({
            playerId: ranking.playerId,
            rankId: ranking.id,
            addedBy: ranking.addedBy,
            rank: ranking.rank
        }).from(ranking);

        if (rankingPlayers.length === 0) {
            return NextResponse.json({ data: [] }, { status: 200 });
        }

        const playerIds = rankingPlayers.map(r => Number(r.playerId));

        const usersData = await db.select({
            id: users.id,
            firstName: users.first_name,
            image: users.image,
            lastName: users.last_name,
            email: users.email,
            position: users.position,
            state: users.state,
            city: users.city,
            gender: users.gender,
            gpa: users.gpa,
            league: users.league,
            team: users.team,
            country: users.country,
            grade_level: users.grade_level,
            location: users.location,
            height: users.height,
            weight: users.weight,
            jersey: users.jersey,
            birthday: users.birthday,
            graduation: users.graduation,
            birth_year: users.birth_year,
            age_group: users.age_group,
            status: users.status,
        }).from(users)
            .where(inArray(users.id, playerIds));

        const results = await db.select({
            playerId: evaluationResults.playerId,
            evalAverage: evaluationResults.eval_average,
        }).from(evaluationResults)
            .where(inArray(evaluationResults.playerId, playerIds));

        const combined = usersData.map(p => {
            const rankInfo = rankingPlayers.find(rp => Number(rp.playerId) === p.id);
            const playerResults = results
                .filter(r => Number(r.playerId) === p.id)
                .map(r => Number(r.evalAverage))
                .filter(n => !isNaN(n));

            const overallAverage = playerResults.length
                ? Number((playerResults.reduce((a, b) => a + b, 0) / playerResults.length).toFixed(2))
                : null;

            return {
                ...p,
                playerId: String(p.id), // convert to string
                rankId: rankInfo?.rankId ?? null,
                rank: rankInfo?.rank ?? null,
                addedBy: rankInfo?.addedBy ?? null,
                overallAverage,
            };
        });

        combined.sort((a, b) => (b.overallAverage ?? 0) - (a.overallAverage ?? 0));

        return NextResponse.json({ data: combined });
    } catch (error) {
        console.error("Error fetching ranked player data:", error);
        return NextResponse.json({ error: "Failed to fetch ranked users" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const url = new URL(req.url);
        const rankId = url.searchParams.get("id");

        if (!rankId) {
            return NextResponse.json({ error: "Rank ID is required" }, { status: 400 });
        }

        await db.delete(ranking).where(eq(ranking.id, Number(rankId)));

        return NextResponse.json({ message: "Player unranked successfully" });
    } catch (error) {
        console.error("Error deleting ranking:", error);
        return NextResponse.json({ error: "Failed to unrank player" }, { status: 500 });
    }
}



// export async function DELETE(req: Request) {
//     try {
//         const url = new URL(req.url);
//         const rankId = url.searchParams.get("id");

//         if (!rankId) {
//             return NextResponse.json({ error: "Rank ID is required" }, { status: 400 });
//         }

//         // Delete the ranking record
//         await db.delete(ranking).where(eq(ranking.id, Number(rankId)));

//         return NextResponse.json({ message: "Player unranked successfully" });
//     } catch (error) {
//         console.error("Error deleting ranking:", error);
//         return NextResponse.json({ error: "Failed to unrank player" }, { status: 500 });
//     }
// }
