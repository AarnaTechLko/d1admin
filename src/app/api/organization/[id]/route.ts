
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
  playerEvaluation,
} from '@/lib/schema';
import { eq, count, and } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
    { params }: { params: Promise<{ id: string }> }

  //  { params }: { params: { id: string } }
    //  context: { params: { id: string } }

) {
    //  const { params } = context; // ✅ Await context

  const orgId = parseInt(( await params).id, 10);
  console.log("get users id:",orgId);

  if (isNaN(orgId)) {
    return NextResponse.json(
      { message: 'Invalid organization ID' },
      { status: 400 }
    );
  }

  try {
    // Fetch organization (enterprise)
    const [enterprise] = await db
      .select()
      .from(enterprises)
      .where(eq(enterprises.id, orgId))
      .limit(1);

    if (!enterprise) {
      return NextResponse.json(
        { message: 'Organization not found' },
        { status: 404 }
      );
    }

    // Fetch counts and data in parallel
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
      evaluationsByPlayers,
      evaluationsByCoaches,
    ] = await Promise.all([
      db
        .select({ count: count() })
        .from(users)
        .where(eq(users.enterprise_id, String(orgId))),

      db
        .select({ count: count() })
        .from(coaches)
        .where(eq(coaches.enterprise_id, String(orgId))),

      db
        .select({ count: count() })
        .from(teams)
        .where(and(eq(teams.created_by, 'Enterprise'), eq(teams.club_id, orgId))),

      db.select().from(teamPlayers).where(eq(teamPlayers.enterprise_id, orgId)),

      db.select().from(teamCoaches).where(eq(teamCoaches.enterprise_id, orgId)),

      db.select().from(invitations).where(eq(invitations.enterprise_id, orgId)),

      db
        .select()
        .from(teams)
        .where(and(eq(teams.created_by, 'Enterprise'), eq(teams.club_id, orgId))),

      db.select().from(coaches).where(eq(coaches.enterprise_id, String(orgId))),

      db.select().from(users).where(eq(users.enterprise_id, String(orgId))),

      // Player evaluations joined with users (players)
      db
        .select({
          Player: playerEvaluation.player_id,
          Title: playerEvaluation.review_title,
          Video: playerEvaluation.primary_video_link,
          Jersey: playerEvaluation.jerseyNumber,
          Status: playerEvaluation.status,
          TurnAround: playerEvaluation.turnaroundTime,
          Created_At: playerEvaluation.created_at,
        })
        .from(playerEvaluation)
        .leftJoin(users, eq(users.id, playerEvaluation.player_id))
        .where(eq(users.enterprise_id, String(orgId))),

      // Coach evaluations joined with coaches
      db
        .select({
          Coach: playerEvaluation.coach_id,
          Title: playerEvaluation.review_title,
          Video: playerEvaluation.primary_video_link,
          Jersey: playerEvaluation.jerseyNumber,
          Status: playerEvaluation.status,
          TurnAround: playerEvaluation.turnaroundTime,
          Created_At: playerEvaluation.created_at,
        })
        .from(playerEvaluation)
        .leftJoin(coaches, eq(coaches.id, playerEvaluation.coach_id))
        .where(eq(coaches.enterprise_id, String(orgId))),
    ]);

    // Get player counts per team
    const playersCountPerTeam = await db
      .select({
        teamId: teamPlayers.teamId,
        count: count(),
      })
      .from(teamPlayers)
      .where(eq(teamPlayers.enterprise_id, orgId))
      .groupBy(teamPlayers.teamId);

    // Get coach counts per team
    const coachesCountPerTeam = await db
      .select({
        teamId: teamCoaches.teamId,
        count: count(),
      })
      .from(teamCoaches)
      .where(eq(teamCoaches.enterprise_id, orgId))
      .groupBy(teamCoaches.teamId);

    // Create lookup maps for counts
    const playersCountMap = new Map(
      playersCountPerTeam.map((item) => [item.teamId, item.count])
    );
    const coachesCountMap = new Map(
      coachesCountPerTeam.map((item) => [item.teamId, item.count])
    );

    // Format teams with player and coach counts
    const formattedTeams = teamsData.map((team) => ({
      id:team.id,
      Logo: team.logo || null,
      Name: team.team_name || '',
      Player: playersCountMap.get(team.id) ?? 0,
      Coach: coachesCountMap.get(team.id) ?? 0,
      Type: team.team_type || 'N/A',
      Year: team.team_year || 'N/A',
      Status: team.status || 'active',
      Actions: 'Delete',
    }));


    // Format coaches for frontend
    const formattedCoaches = coachesData.map((coach) => ({
      id:coach.id,
      image: coach.image || null,
      Coach: `${coach.firstName || ''} ${coach.lastName || ''}`,
      Gender: coach.gender || 'N/A',
      Sport: coach.sport || 'N/A',
      Earnings: 'N/A',
      Evaluations: evaluationsByCoaches.filter((e) => e.Coach === coach.id)
        .length
        .toString(),
      Status: coach.status || 'active',
      History: 'View',
      Actions: 'Delete',
    }));
    // Format players for frontend
    const formattedPlayers = playersData.map((player) => ({
      id:player.id,
      image: player.image || null,
      Player: `${player.first_name || ''} ${player.last_name || ''}`,
      Positions: player.position || 'N/A',
      Grade_level: player.grade_level || 'N/A',
      Age: player.birthday
        ? `${new Date().getFullYear() - new Date(player.birthday).getFullYear()}`
        : 'N/A',
      Height: player.height || 'N/A',
      weight: player.weight || 'N/A',
      Status: player.status || 'active',
      History: 'View',
      Actions: 'Delete',
    }));

    return NextResponse.json({
      ...enterprise,
      totalPlayers: totalPlayersResult[0]?.count || 0,
      totalCoaches: totalCoachesResult[0]?.count || 0,
      totalTeams: totalTeamsResult[0]?.count || 0,
      teamPlayers: teamPlayersData,
      teamCoaches: teamCoachesData,
      invitations: invitationData,
      teams: formattedTeams,
      coaches: formattedCoaches,
      players: formattedPlayers,
      evaluationsByPlayers,
      evaluationsByCoaches,
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






