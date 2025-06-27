import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { licenses, enterprises, users, coaches, teams } from '@/lib/schema';
import { eq, ilike, or, count, desc, and, gte, SQL } from 'drizzle-orm';

type TimeRange = '24h' | '1w' | '1m' | '1y';

/**
 * Return a time-based filter for createdAt based on the given range.
 */
function getTimeFilterCondition(column: typeof enterprises.createdAt, timeRange: TimeRange | string | null): SQL | undefined {
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

/**
 * GET: Fetch paginated, non-suspended enterprises with optional filters.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const search = url.searchParams.get('search')?.trim() || '';
  const timeRange = url.searchParams.get('timeRange') || '';
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);
  const offset = (page - 1) * limit;

  try {
    const conditions: (SQL | undefined)[] = [
      eq(enterprises.is_deleted, 0), // ✅ Only non-suspended enterprises
    ];

    // Optional search filters
    if (search) {
      const searchConditions: (SQL | undefined)[] = [
        ilike(enterprises.organizationName, `%${search}%`),
        ilike(enterprises.email, `%${search}%`),
        ilike(enterprises.state, `%${search}%`),
        ilike(enterprises.mobileNumber, `%${search}%`),
        ilike(enterprises.country, `%${search}%`),
        ilike(enterprises.address, `%${search}%`),
        ilike(enterprises.status, `%${search}%`),
      ];
      conditions.push(or(...searchConditions.filter(Boolean)));
    }

    // Time range condition
    const timeCondition = getTimeFilterCondition(enterprises.createdAt, timeRange);
    if (timeCondition) {
      conditions.push(timeCondition);
    }

    const whereClause = and(...conditions.filter(Boolean));

    // Fetch paginated enterprises
    const enterprisesData = await db
      .select()
      .from(enterprises)
      .where(whereClause)
      .orderBy(desc(enterprises.createdAt))
      .offset(offset)
      .limit(limit);

    // Add player/coach/team counts to each enterprise
    const enrichedEnterprises = await Promise.all(
      enterprisesData.map(async (enterprise) => {
        const [players, coachesCount, teamsCount] = await Promise.all([
          db.select({ count: count() }).from(users).where(eq(users.enterprise_id, String(enterprise.id))),
          db.select({ count: count() }).from(coaches).where(eq(coaches.enterprise_id, String(enterprise.id))),
          db.select({ count: count() }).from(teams).where(and(eq(teams.created_by, 'Enterprise'), eq(teams.club_id, enterprise.id))),
        ]);
        return {
          ...enterprise,
          totalPlayers: players[0]?.count || 0,
          totalCoaches: coachesCount[0]?.count || 0,
          totalTeams: teamsCount[0]?.count || 0,
        };
      })
    );

    // Count total for pagination
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

// DELETE: Delete enterprise by ID
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const organizationId = url.searchParams.get("id");

    if (!organizationId) {
      return NextResponse.json({ message: "Organization ID is required" }, { status: 400 });
    }

    const id = Number(organizationId);
    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid Organization ID" }, { status: 400 });
    }

    await db.delete(enterprises).where(eq(enterprises.id, id));

    return NextResponse.json({ message: "Organization deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete organization", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST: Fetch license and resource stats for an enterprise
export async function POST(req: NextRequest) {
  try {
    const { enterprise_id } = await req.json();

    if (!enterprise_id) {
      return NextResponse.json({ message: "Enterprise ID is required" }, { status: 400 });
    }

    const [consumedLicenses, activeLicenses, totalCoaches, totalPlayers, totalTeams] = await Promise.all([
      db.select({ count: count() }).from(licenses).where(and(eq(licenses.enterprise_id, enterprise_id), eq(licenses.status, 'Consumed'))),
      db.select({ count: count() }).from(licenses).where(and(eq(licenses.enterprise_id, enterprise_id), eq(licenses.status, 'Free'))),
      db.select({ count: count() }).from(coaches).where(eq(coaches.enterprise_id, enterprise_id)),
      db.select({ count: count() }).from(users).where(eq(users.enterprise_id, enterprise_id)),
      db.select({ count: count() }).from(teams).where(and(eq(teams.created_by, 'Enterprise'), eq(teams.club_id, enterprise_id))),
    ]);

    return NextResponse.json({
      consumeLicenses: consumedLicenses[0]?.count || 0,
      activeLicenses: activeLicenses[0]?.count || 0,
      totalCoaches: totalCoaches[0]?.count || 0,
      totalPlayers: totalPlayers[0]?.count || 0,
      totalTeams: totalTeams[0]?.count || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch enterprise stats", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PUT: Update enterprise status
export async function PUT(req: NextRequest) {
  try {
    const { organizationId, newStatus } = await req.json();

    if (!organizationId || !newStatus) {
      return NextResponse.json({ message: "Organization ID and new status are required" }, { status: 400 });
    }

    if (!['Active', 'Inactive'].includes(newStatus)) {
      return NextResponse.json({ message: "Invalid status. Only 'Active' or 'Inactive' allowed." }, { status: 400 });
    }

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
