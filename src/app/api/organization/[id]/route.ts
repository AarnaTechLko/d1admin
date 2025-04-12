import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  enterprises,
  users,
  coaches,
  teams,
  teamPlayers,
  teamCoaches,
  invitations,
} from '@/lib/schema';
import { eq, count, and } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const orgId = parseInt((await params).id, 10);

  if (isNaN(orgId)) {
    return NextResponse.json({ message: 'Invalid organization ID' }, { status: 400 });
  }

  try {
    // Fetch the enterprise (organization) by ID
    const enterpriseData = await db
      .select()
      .from(enterprises)
      .where(eq(enterprises.id, orgId))
      .limit(1);

    if (!enterpriseData.length) {
      return NextResponse.json({ message: 'Organization not found' }, { status: 404 });
    }

    const enterprise = enterpriseData[0];

    // Fetch all associated data and counts in parallel
    const [
      totalPlayersResult,
      totalCoachesResult,
      totalTeamsResult,
      teamPlayersData,
      teamCoachesData,
      invitationData,
      teamsData,
      coachesData,
      playersData,
    ] = await Promise.all([
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
        .where(
          and(eq(teams.created_by, 'Enterprise'), eq(teams.club_id, enterprise.id))
        ),
      db
        .select()
        .from(teamPlayers)
        .where(eq(teamPlayers.enterprise_id, enterprise.id)),
      db
        .select()
        .from(teamCoaches)
        .where(eq(teamCoaches.enterprise_id, enterprise.id)),
      db
        .select()
        .from(invitations)
        .where(eq(invitations.enterprise_id, enterprise.id)),
      db
        .select()
        .from(teams)
        .where(
          and(eq(teams.created_by, 'Enterprise'), eq(teams.club_id, enterprise.id))
        ),
      db
        .select()
        .from(coaches)
        .where(eq(coaches.enterprise_id, String(enterprise.id))),
      db
        .select()
        .from(users)
        .where(eq(users.enterprise_id, String(enterprise.id))),
    ]);

    // Send back the full org data
    return NextResponse.json({
      ...enterprise,
      totalPlayers: totalPlayersResult[0]?.count || 0,
      totalCoaches: totalCoachesResult[0]?.count || 0,
      totalTeams: totalTeamsResult[0]?.count || 0,
      teamPlayers: teamPlayersData,
      teamCoaches: teamCoachesData,
      invitations: invitationData,
      teams: teamsData,
      coaches: coachesData,
      players: playersData,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Failed to fetch organization',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
