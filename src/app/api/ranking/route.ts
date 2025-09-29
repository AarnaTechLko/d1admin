import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
// app/api/ranking/route.ts
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
        const { playerId } = body;

        if (!playerId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // ✅ Get cookies properly
        const cookieHeader = req.headers.get("cookie") || "";
        const cookies = Object.fromEntries(
            cookieHeader.split("; ").map((c) => {
                const [key, ...v] = c.split("=");
                return [key, decodeURIComponent(v.join("="))];
            })
        );
        const token = cookies["session_token"];
        if (!token) {
            return NextResponse.json({ error: "Unauthorized, no token found" }, { status: 401 });
        }
        // Decode JWT
        let decoded: JwtPayload;
        try {
            decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
        } catch (err) {
            console.error("JWT verification failed:", err);
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
        }
        const currentUserId = decoded.id;
        console.log("current user id:", currentUserId);
        // Insert ranking
        const inserted = await db.insert(ranking).values({
            playerId: Number(playerId),
            addedBy: currentUserId,
            createdAt: new Date(),
        }).returning();
        return NextResponse.json({
            message: "Ranking added successfully",
            data: inserted,
        });

    } catch (err) {
        console.error("POST /api/ranking error:", err);
        return NextResponse.json({ error: "Failed to add ranking" }, { status: 500 });
    }
}



// export async function GET() {
//   try {
//     // Step 1: Fetch all users from ranking table with id and added_by
//     const rankingPlayers = await db.select({
//       playerId: ranking.playerId,
//       rankId: ranking.id,       // primary key
//       addedBy: ranking.addedBy  // matches schema key
//     }).from(ranking);

//     if (rankingPlayers.length === 0) {
//       return NextResponse.json({ data: [] }, { status: 200 });
//     }

//     const playerIds = rankingPlayers.map(r => r.playerId);

//     // Step 2: Fetch evaluation results only for users in ranking
//     const results = await db
//       .select({
//         playerId: evaluationResults.playerId,
//         evalAverage: evaluationResults.eval_average,
//       })
//       .from(evaluationResults)
//       .where(inArray(evaluationResults.playerId, playerIds));

//     // Step 3: Calculate overallAverage per player
//     const averages = rankingPlayers.map(rp => {
//       const playerResults = results
//         .filter(r => r.playerId === rp.playerId)
//         .map(r => Number(r.evalAverage))
//         .filter(n => !isNaN(n));

//       const overallAverage = playerResults.length
//         ? Number((playerResults.reduce((a, b) => a + b, 0) / playerResults.length).toFixed(2))
//         : null;

//       return {
//         playerId: rp.playerId,
//         rankId: rp.rankId,
//         addedBy: rp.addedBy,
//         overallAverage
//       };
//     });

//     // Step 4: Sort by overallAverage descending
//     averages.sort((a, b) => (b.overallAverage ?? 0) - (a.overallAverage ?? 0));

//     return NextResponse.json({ data: averages });
//   } catch (error) {
//     console.error("Error fetching overall averages:", error);
//     return NextResponse.json({ error: "Failed to fetch rankings" }, { status: 500 });
//   }
// }



export async function GET() {
    try {
        // Step 1: Fetch all player IDs from ranking table
        const rankingPlayers = await db.select({ playerId: ranking.playerId, rankId: ranking.id, addedBy: ranking.addedBy })
            .from(ranking);

        if (rankingPlayers.length === 0) {
            return NextResponse.json({ data: [] }, { status: 200 });
        }

        const playerIds = rankingPlayers.map(r => r.playerId);

        // Step 2: Fetch full player info for those IDs
        const usersData = await db.select({
            id: users.id,
            firstName: users.first_name,
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
            // add all columns you need
        })
            .from(users)
            .where(inArray(users.id, playerIds));

        // Step 3: Fetch evaluation results for these users
        const results = await db.select({
            playerId: evaluationResults.playerId,
            evalAverage: evaluationResults.eval_average,
        })
            .from(evaluationResults)
            .where(inArray(evaluationResults.playerId, playerIds));

        // Step 4: Combine player info with ranking info and overallAverage
        const combined = usersData.map(p => {
            const rankInfo = rankingPlayers.find(rp => rp.playerId === p.id);
            const playerResults = results
                .filter(r => r.playerId === p.id)
                .map(r => Number(r.evalAverage))
                .filter(n => !isNaN(n));

            const overallAverage = playerResults.length
                ? Number((playerResults.reduce((a, b) => a + b, 0) / playerResults.length).toFixed(2))
                : null;

            return {
                ...p,
                rankId: rankInfo?.rankId ?? null,
                addedBy: rankInfo?.addedBy ?? null,
                overallAverage,
            };
        });

        // Step 5: Sort by overallAverage descending
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

    // Delete the ranking record
    await db.delete(ranking).where(eq(ranking.id, Number(rankId)));

    return NextResponse.json({ message: "Player unranked successfully" });
  } catch (error) {
    console.error("Error deleting ranking:", error);
    return NextResponse.json({ error: "Failed to unrank player" }, { status: 500 });
  }
}
