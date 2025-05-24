import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../../lib/db';
import { eq, inArray, and } from "drizzle-orm";
import { users, teamPlayers, teams, teamCoaches, coaches } from '../../../../../lib/schema';
// import { number } from 'zod';
import { sendEmail } from '@/lib/helpers';


const generateRandomPassword = (length = 12) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?";
    let password = "";

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }

    return password;
};
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const payload = body.csvData;
        const enterprise_id = body.enterprise_id;
        const logo = body.logo;

        if (!Array.isArray(payload)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        const teamNameMap = new Map();

        payload.forEach((item) => {
            const normalizedTeamName = item.TeamName.trim().toLowerCase().replace(/\s+/g, '-');
            if (!teamNameMap.has(normalizedTeamName)) {
                teamNameMap.set(normalizedTeamName, []);
            }
            teamNameMap.get(normalizedTeamName)?.push(item);
        });

        const uniquePayload = Array.from(teamNameMap.values());
        const teamNames = Array.from(teamNameMap.keys());

        const existingTeams = await db
            .select({ id: teams.id, slug: teams.slug })
            .from(teams)
            .where(
                and(
                    inArray(teams.slug, teamNames),
                    eq(teams.creator_id, enterprise_id)
                )
            );

        const existingTeamsMap = new Map(existingTeams.map(team => [team.slug, team.id]));
        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        const host = req.headers.get('host');
        const baseUrl = `${protocol}://${host}`;
        const excludedUsers: { status: string; email: string; existingEnterprise: string }[] = [];
        const excludedCoaches: { status: string; email: string; existingEnterprise: string }[] = [];

        const insertData = await Promise.all(uniquePayload.map(async (teamItems) => {
            const item = teamItems[0];

            const teamNameFormatted = item.TeamName.trim().toLowerCase().replace(/\s+/g, '-');
            let teamId = existingTeamsMap.get(teamNameFormatted);

            if (!teamId) {
                const teamInsert = await db.insert(teams).values({
                    team_name: item.TeamName,
                    created_by: 'Enterprise',
                    creator_id: enterprise_id,
                    slug: teamNameFormatted,
                    team_type: item.Gender,

                    team_year: item.YearAndAgeGroup,
                    club_id: enterprise_id,
                    status: 'Active',
                    logo: logo,
                    cover_image: '',
                    description: 'Team Created',
                }).returning({ teamId: teams.id });

                teamId = teamInsert[0]?.teamId;
                existingTeamsMap.set(teamNameFormatted, teamId);
            }

            const playersToInsert: { userId: string; password: string; email: string }[] = [];
            for (const player of teamItems) {
                const password = generateRandomPassword(10);
                const hashedPassword = await hash(password, 10);
                const userEmail = player.PlayersEmail;

                const existingUser = await db.select().from(users).where(eq(users.email, userEmail));

                if (existingUser.length > 0) {
                    const user = existingUser[0];
                    if (user.enterprise_id !== enterprise_id) {
                        excludedUsers.push({
                            status: 'Pending',
                            email: userEmail,
                            existingEnterprise: user.enterprise_id ?? 'N/A'
                        });
                        continue;
                    }
                } else {
                    const user = await db.insert(users).values({

                        email: userEmail,
                        password: hashedPassword,
                        status: 'Pending',
                        enterprise_id: enterprise_id
                    }).returning({ userId: users.id });

                    playersToInsert.push({
                        userId: user[0]?.userId.toString(),
                        password: hashedPassword,
                        email: userEmail,
                    });


                    await sendEmail({
                        to: userEmail,
                        subject: `D1 NOTES Registration`,
                        text: `D1 NOTES Registration `,
                        html: `<div style="font-family: 'Arial', sans-serif; padding: 20px; background-color: #f9fafb; border-radius: 8px; max-width: 600px; margin: 0 auto;">
                            Dear Player! You have been added  to take advantage of D1 Note's Enterprises / white label service.  
                            <a href="${baseUrl}/login" style="font-weight: bold; color: blue;">Click Here</a> 
                            to login and complete your profile. Your login details are as follows:
                            <p>Email: ${userEmail}</p>
                            <p>Password: ${password}</p>
                            After completing your profile and your access to the Organization or Team will automatically be activated. 
                            <p className="mt-5">Regards, <br/> D1 Notes</p>
                        </div>`
                    }).catch(err => console.error(`Email Sending Error for ${userEmail}:`, err));

                }
            }

            const coachesToInsert: { coachId: string; password: string; email: string }[] = [];
            for (const coach of teamItems) {
                const password = generateRandomPassword(10);
                const hashedPassword = await hash(password, 10);
                const userEmail = coach.CoachEmail;

                const existingCoach = await db.select().from(coaches).where(eq(coaches.email, userEmail));

                if (existingCoach.length > 0) {
                    const coach = existingCoach[0];
                    if (coach.enterprise_id !== enterprise_id) {
                        excludedCoaches.push({
                            status: 'Pending',
                            email: userEmail,
                            existingEnterprise: coach.enterprise_id ?? 'N/A'
                        });
                        continue;
                    }
                } else {
                    const user = await db.insert(coaches).values({

                        email: userEmail,
                        password: hashedPassword,
                        status: 'Pending',
                        enterprise_id: enterprise_id
                    }).returning({ userId: coaches.id });

                    coachesToInsert.push({
                        coachId: user[0]?.userId.toString(),
                        password: hashedPassword,
                        email: userEmail,
                    });


                    await sendEmail({
                        to: userEmail,
                        subject: `D1 NOTES Registration`,
                        text: `D1 NOTES Registration `,
                        html: `<div style="font-family: 'Arial', sans-serif; padding: 20px; background-color: #f9fafb; border-radius: 8px; max-width: 600px; margin: 0 auto;">
                            Dear Coach! You have been added  to take advantage of D1 Note's Enterprises / white label service.  
                            <a href="${baseUrl}/login" style="font-weight: bold; color: blue;">Click Here</a> 
                            to login and complete your profile. Your login details are as follows:
                            <p>Email: ${userEmail}</p>
                            <p>Password: ${password}</p>
                            After completing your profile and your access to the Organization or Team will automatically be activated. 
                            <p className="mt-5">Regards, <br/> D1 Notes</p>
                        </div>`
                    }).catch(err => console.error(`Email Sending Error for ${userEmail}:`, err));
                }
            }

            return { teamId, playersToInsert, coachesToInsert };
        }));

        for (const data of insertData) {
            const teamId = data.teamId;

            if (data.coachesToInsert.length > 0) {
                await db.insert(teamCoaches).values(
                    data.coachesToInsert.map((coach) => ({
                        enterprise_id: Number(enterprise_id),
                        teamId: Number(teamId),
                        coachId: Number(coach.coachId),
                    }))
                );
            }

            if (data.playersToInsert.length > 0) {
                await db.insert(teamPlayers).values(
                    data.playersToInsert.map((player) => ({
                        enterprise_id: Number(enterprise_id),
                        teamId: Number(teamId),
                        playerId: Number(player.userId),
                    }))
                );
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Teams and players inserted successfully',
            excludedUsers,
            excludedCoaches
        });

    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}









