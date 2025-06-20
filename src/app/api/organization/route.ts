import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { licenses, enterprises, users, coaches, teams } from '@/lib/schema';
import { eq, ilike, or, count, desc, and, gte } from 'drizzle-orm';

type TimeRange = '24h' | '1w' | '1m' | '1y';

// ✅ Updated to use enterprises.createdAt
function getTimeFilterCondition(column: typeof enterprises.createdAt, timeRange: TimeRange | string | null) {
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

// GET Handler: Fetch Enterprises
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const search = url.searchParams.get('search')?.trim() || '';
  const timeRange = url.searchParams.get('timeRange') || '';
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);
  const offset = (page - 1) * limit;

  try {
    const conditions = [];

    // Search filters
    if (search) {
      conditions.push(
        or(
          ilike(enterprises.organizationName, `%${search}%`),
          ilike(enterprises.email, `%${search}%`),
          ilike(enterprises.state, `%${search}%`),
          ilike(enterprises.mobileNumber, `%${search}%`),
          ilike(enterprises.country, `%${search}%`),
          ilike(enterprises.address, `%${search}%`),
          ilike(enterprises.status, `%${search}%`)
        )
      );
    }

    // Time-based filter ✅ (correct function & column used)
    const timeCondition = getTimeFilterCondition(enterprises.createdAt, timeRange);
    if (timeCondition) {
      conditions.push(timeCondition);
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    // Fetch paginated enterprises
    const enterprisesData = await db
      .select()
      .from(enterprises)
      .where(whereClause)
      .orderBy(desc(enterprises.createdAt))
      .offset(offset)
      .limit(limit);

    // Enrich each enterprise with related counts
    const enrichedEnterprises = await Promise.all(
      enterprisesData.map(async (enterprise) => {
        const [totalPlayers, totalCoaches, totalTeams] = await Promise.all([
          db
            .select({ count: count() })
            .from(users)
            .where(eq(users.enterprise_id, String(enterprise.id))),
          db
            .select({ count: count() })
            .from(coaches)
            .where(eq(coaches.enterprise_id, String(enterprise.id))),
          db
            .select({ count: count() })
            .from(teams)
            .where(and(eq(teams.created_by, 'Enterprise'), eq(teams.club_id, enterprise.id))),
        ]);

        return {
          ...enterprise,
          totalPlayers: totalPlayers[0]?.count || 0,
          totalCoaches: totalCoaches[0]?.count || 0,
          totalTeams: totalTeams[0]?.count || 0,
        };
      })
    );

    // Total count for pagination
    const totalCount = await db
      .select({ count: count() })
      .from(enterprises)
      .where(whereClause)
      .then((res) => res[0]?.count || 0);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      enterprises: enrichedEnterprises,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Failed to fetch organizations',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}


export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const organizationId = url.searchParams.get("id");

    if (!organizationId) {
      return NextResponse.json({ message: "Organization ID is required" }, { status: 400 });
    }

    const organizationIdNumber = Number(organizationId);
    if (isNaN(organizationIdNumber)) {
      return NextResponse.json({ message: "Invalid Organization ID" }, { status: 400 });
    }

    // Delete the coach by ID
    await db.delete(enterprises).where(eq(enterprises.id, organizationIdNumber));

    return NextResponse.json({ message: "Organization deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete organization", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}




export async function POST(req: NextRequest) {
  const { enterprise_id } = await req.json();

  const consumeLicensesResult = await db
    .select({ count: count() })
    .from(licenses)
    .where(
      and(
        eq(licenses.enterprise_id, enterprise_id),
        eq(licenses.status, 'Consumed')
      )
    );
  const consumeLicenses = consumeLicensesResult[0]?.count || 0;

  const activeLicensesResult = await db
    .select({ count: count() })
    .from(licenses)
    .where(
      and(
        eq(licenses.enterprise_id, enterprise_id),
        eq(licenses.status, 'Free')
      )
    );
  const activeLicenses = activeLicensesResult[0]?.count || 0;

  const totalCoachesResult = await db
    .select({ count: count() })
    .from(coaches)
    .where(eq(coaches.enterprise_id, enterprise_id));
  const totalCoaches = totalCoachesResult[0]?.count || 0;

  const totalPlayersResult = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.enterprise_id, enterprise_id));
  const totalPlayers = totalPlayersResult[0]?.count || 0;

  const totalTeamsResult = await db
    .select({ count: count() })
    .from(teams)
    .where(and(eq(teams.created_by, 'Enterprise'), eq(teams.club_id, enterprise_id)));
  const totalTeams = totalTeamsResult[0]?.count || 0;

  return NextResponse.json(
    { consumeLicenses, activeLicenses, totalCoaches, totalPlayers, totalTeams },
    { status: 200 }
  );
}


export async function PUT(req: NextRequest) {
  try {
    const { organizationId, newStatus } = await req.json();

    if (!organizationId || !newStatus) {
      return NextResponse.json({ message: "organization ID and new status are required" }, { status: 400 });
    }

    if (newStatus !== "Active" && newStatus !== "Inactive") {
      return NextResponse.json({ message: "Invalid status. Only Active or Inactive are allowed." }, { status: 400 });
    }

    // Update org's status
    await db
      .update(enterprises)
      .set({ status: newStatus })
      .where(eq(enterprises.id, organizationId));

    return NextResponse.json({ message: "Status updated successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update status", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}