import { NextRequest, NextResponse } from 'next/server';
// import { hash } from 'bcryptjs';
import { db } from '@/lib/db';
import { licenses, enterprises, users, coaches, teams } from '@/lib/schema';
// import debug from 'debug';
// import jwt from 'jsonwebtoken';
// import { SECRET_KEY } from '@/lib/constants';
import { eq, ilike, or, count, desc, and } from 'drizzle-orm';
// import { sendEmail } from '@/lib/helpers';




export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const search = url.searchParams.get('search')?.trim() || '';  
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);
  
  try {
    const offset = (page - 1) * limit;

    const whereClause = search
      ? or(
          ilike(enterprises.organizationName, `%${search}%`),
          ilike(enterprises.email, `%${search}%`),
          ilike(enterprises.state, `%${search}%`),
          ilike(enterprises.mobileNumber, `%${search}%`),
          ilike(enterprises.country, `%${search}%`),  
          ilike(enterprises.status, `%${search}%`)  
        )
      : undefined;

    // ✅ Fetch enterprises first (without subqueries)
    const enterprisesData = await db
      .select()
      .from(enterprises)
      .where(whereClause)
      .orderBy(desc(enterprises.createdAt))
      .offset(offset)
      .limit(limit);

    // ✅ Fetch counts separately for each enterprise
    const enrichedEnterprises = await Promise.all(
      enterprisesData.map(async (enterprise) => {
        const totalPlayersResult = await db
          .select({ count: count() })
          .from(users)
          .where(eq(users.enterprise_id, String(enterprise.id)))

        const totalCoachesResult = await db
          .select({ count: count() })
          .from(coaches)
          .where(eq(coaches.enterprise_id, String(enterprise.id)));

        const totalTeamsResult = await db
          .select({ count: count() })
          .from(teams)
          .where(and(eq(teams.created_by, 'Enterprise'), eq(teams.club_id, enterprise.id)));

        return {
          ...enterprise,
          totalPlayers: totalPlayersResult[0]?.count || 0,
          totalCoaches: totalCoachesResult[0]?.count || 0,
          totalTeams: totalTeamsResult[0]?.count || 0
        };
      })
    );

    // ✅ Get total enterprise count for pagination
    const totalCount = await db
      .select({ count: count() })
      .from(enterprises)
      .where(whereClause)
      .then((result) => result[0]?.count || 0);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      enterprises: enrichedEnterprises, // Updated data with counts
      currentPage: page,
      totalPages: totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });

  } catch (error) {
    return NextResponse.json(
      {
        message: 'Failed to fetch organization',
        error: error instanceof Error ? error.message : String(error)
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