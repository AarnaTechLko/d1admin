import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../../../lib/db';
import { eq, and, inArray } from "drizzle-orm";
import { coaches, licenses, teamCoaches } from '../../../../../../lib/schema';
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
        const { enterprise_id, teamId } = body;
        const team_id = teamId;
        if (!Array.isArray(payload)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        const emails = payload.map((item) => item.Email);

        // Check for existing emails
        const existingCoaches = await db
            .select()
            .from(coaches)
            .where(inArray(coaches.email, emails));

        const existingEmails = existingCoaches.map((coach) => coach.email);

        // Separate duplicates and new records
        const duplicates = payload.filter((item) => existingEmails.includes(item.Email));
        const newRecords = payload.filter((item) => !existingEmails.includes(item.Email));

        // If duplicates are found, return them immediately


        // Prepare new records for insertion
        const insertData = await Promise.all(newRecords.map(async (item) => {
            const password = generateRandomPassword(10);
            const hashedPassword = await hash(password, 10);
            const timestamp = Date.now();
            const slug = `${item.FirstName.trim().toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;

            await sendEmail({
                to: item.Email,
                subject: "D1 NOTES Coach Registration",
                text: "D1 NOTES Coach Registration",
                html: `<p>Dear Coach! Your account creation as a Coach on D1 NOTES has been started. </p><p>Please complete your profile in the next step to enjoy the evaluation from the best coaches.</p>\n\nHere are your login details:\nEmail: ${item.Email}\nPassword: ${password}\n\nPlease change your password upon login.\n\nBest Regards,\nYour Team`,
            });

            return {
                firstName: item.FirstName,
                lastName: item.LastName,
                email: item.Email,
                country: null,

                enterprise_id,
                team_id,
                slug,
                gender: null,
                location: null,
                sport: null,
                clubName: null,
                qualifications: null,
                image: null,
                rating: null,
                certificate: null,
                status: 'Pending',
                password: hashedPassword,

            };
        }));
        if (insertData.length > 0) {
            const insertedPlayers = await db.insert(coaches).values(insertData).returning({ id: coaches.id });


            if (Number(enterprise_id)) {
                const teamCoachData = insertedPlayers.map(player => ({
                    teamId: Number(teamId || 0),           // Adjusted to match the schema
                    coachId: player.id,       // Adjusted to match the schema
                    enterprise_id: Number(enterprise_id), // Adjusted to match the sch ema
                }));
                await db.insert(teamCoaches).values(teamCoachData);
            }
            else {
                const teamCoachData = insertedPlayers.map(player => ({
                    teamId: Number(teamId),           // Adjusted to match the schema
                    coachId: player.id,       // Adjusted to match the schema
                    enterprise_id: 0, // Adjusted to match the schema
                }));
                await db.insert(teamCoaches).values(teamCoachData);
            }




            for (const player of insertedPlayers) {
                const checkLicense = await db
                    .select()
                    .from(licenses)
                    .where(
                        and(
                            eq(licenses.enterprise_id, enterprise_id),
                            eq(licenses.status, 'Free'),
                        )
                    );

                if (checkLicense.length > 0) {
                    const updateLicense = await db.update(licenses).set({
                        status: 'Consumed',
                        used_by: player.id.toString(),
                        used_for: 'Coach',
                    }).where(eq(licenses.licenseKey, checkLicense[0].licenseKey));

                    if ((updateLicense.rowCount ?? 0) > 0) {
                        await db.update(coaches).set({
                            status: 'Active'
                        }).where(eq(coaches.id, player.id));
                    }
                }
            }
        }

        if (duplicates.length > 0) {
            return NextResponse.json({ success: false, message: 'Coaches inserted and emails sent successfully', duplicates: duplicates, });
        }
        else {
            return NextResponse.json({ success: true, message: 'Coaches inserted and emails sent successfully' });
        }
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error}, { status: 500 });
    }
}


