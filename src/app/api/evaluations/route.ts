// import { db } from "@/lib/db";
// import { playerEvaluation } from "@/lib/schema";
// import { eq, and, desc } from "drizzle-orm";

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);

//   const page = parseInt(searchParams.get("page") || "1");
//   const limit = parseInt(searchParams.get("limit") || "10");
//   const offset = (page - 1) * limit;

//   // Optional filters
//   const playerId = searchParams.get("player_id");
//   const coachId = searchParams.get("coach_id");
//   const status = searchParams.get("status");

//   try {
//     const filters = [];

//     if (playerId) filters.push(eq(playerEvaluation.player_id, parseInt(playerId)));
//     if (coachId) filters.push(eq(playerEvaluation.coach_id, parseInt(coachId)));
//     if (status) filters.push(eq(playerEvaluation.status, parseInt(status)));

//     // Query only selected columns
//     const allResults = await db
//       .select({
//         id: playerEvaluation.id,
//         player_id: playerEvaluation.player_id,
//         coach_id: playerEvaluation.coach_id,
//         review_title: playerEvaluation.review_title,
//         primary_video_link: playerEvaluation.primary_video_link,
//         jerseyNumber: playerEvaluation.jerseyNumber,
//         status: playerEvaluation.status,
//         turnaroundTime: playerEvaluation.turnaroundTime,
//         payment_status: playerEvaluation.payment_status,
//         created_at: playerEvaluation.created_at,
//         is_deleted: playerEvaluation.is_deleted,
//       })
//       .from(playerEvaluation)
//       .where(filters.length ? and(...filters) : undefined)
//       .orderBy(desc(playerEvaluation.created_at));

//     const paginated = allResults.slice(offset, offset + limit);

//     return Response.json({
//       data: paginated,
//       currentPage: page,
//       totalPages: Math.ceil(allResults.length / limit),
//       hasNextPage: offset + limit < allResults.length,
//       hasPrevPage: page > 1,
//     });
//   } catch (error) {
//     console.error("[GET /api/evaluations] Error:", error);
//     return new Response("Failed to fetch evaluations", { status: 500 });
//   }
// }


import { db } from "@/lib/db";
import { playerEvaluation } from "@/lib/schema";
import { eq, and, gte, desc } from "drizzle-orm";

// Define type for time range
type TimeRange = '24h' | '1w' | '1m' | '1y';

/**
 * Generate time-based filter condition for `created_at` column.
 */
function getTimeFilterCondition(column: typeof playerEvaluation.created_at, timeRange: TimeRange | string | null) {
  if (!timeRange) return undefined;

  const now = new Date();
  switch (timeRange) {
    case '24h':
      return gte(column, new Date(now.getTime() - 24 * 60 * 60 * 1000));
    case '1w':
      return gte(column, new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
    case '1m':
      return gte(column, new Date(new Date().setMonth(now.getMonth() - 1)));
    case '1y':
      return gte(column, new Date(new Date().setFullYear(now.getFullYear() - 1)));
    default:
      return undefined;
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const playerId = url.searchParams.get("player_id");
    const coachId = url.searchParams.get("coach_id");
    const status = url.searchParams.get("status");
    const timeRange = url.searchParams.get("timeRange");

    // Build filters
    const filters = [];

    if (playerId) filters.push(eq(playerEvaluation.player_id, parseInt(playerId)));
    if (coachId) filters.push(eq(playerEvaluation.coach_id, parseInt(coachId)));
    if (status) filters.push(eq(playerEvaluation.status, parseInt(status)));

    const timeCondition = getTimeFilterCondition(playerEvaluation.created_at, timeRange);
    if (timeCondition) filters.push(timeCondition);

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    // Get total count for pagination
    const totalResults = await db
      .select({ count: playerEvaluation.id })
      .from(playerEvaluation)
      .where(whereClause);

    const totalCount = totalResults.length;
    const totalPages = Math.ceil(totalCount / limit);

    // Fetch paginated data
    const evaluations = await db
      .select({
        id: playerEvaluation.id,
        player_id: playerEvaluation.player_id,
        coach_id: playerEvaluation.coach_id,
        review_title: playerEvaluation.review_title,
        primary_video_link: playerEvaluation.primary_video_link,
        jerseyNumber: playerEvaluation.jerseyNumber,
        status: playerEvaluation.status,
        turnaroundTime: playerEvaluation.turnaroundTime,
        payment_status: playerEvaluation.payment_status,
        created_at: playerEvaluation.created_at,
        is_deleted: playerEvaluation.is_deleted,
      })
      .from(playerEvaluation)
      .where(whereClause)
      .orderBy(desc(playerEvaluation.created_at))
      .limit(limit)
      .offset(offset);

    return Response.json({
      data: evaluations,
      currentPage: page,
      totalPages,
      totalCount,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error("[GET /api/evaluations] Error:", error);
    return new Response("Failed to fetch evaluations", { status: 500 });
  }
}
