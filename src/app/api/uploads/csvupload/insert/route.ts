import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../../lib/db';
import { eq, inArray,and } from "drizzle-orm";
import { users,teamPlayers,licenses } from '../../../../../lib/schema';
// import { number } from 'zod';
// import { sendEmail } from '@/lib/helpers';

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
      const coach_id = body.coach_id;
      const enterprise_id = body.enterprise_id;
      const team_id = body.team_id;
  
      if (!Array.isArray(payload)) {
        return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
      }
  
      const emails = payload.map((item) => item.Email);

        // Check for existing emails
        const existingCoaches = await db
            .select()
            .from(users) 
            .where(inArray(users.email, emails));

        const existingEmails = existingCoaches.map((coach) => coach.email);

        // Separate duplicates and new records
        const duplicates = payload.filter((item) => existingEmails.includes(item.Email));
        const newRecords = payload.filter((item) => !existingEmails.includes(item.Email));
         
      // Generate hashed passwords and prepare emails
      const insertData = await Promise.all(newRecords.map(async (item) => {
        const password = generateRandomPassword(10);
        const hashedPassword = await hash(password, 10);
        const timestamp = Date.now();
        const slug = `${item.FirstName.trim().toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;
        
        
        // const emailResult = await sendEmail({
        //     to: item.Email,
        //     subject: "D1 NOTES Player Registration",
        //     text: "D1 NOTES Player Registration",
        //     html: `<p>Dear Player! Your account creation as a Player on D1 NOTES has been started. </p><p>Please complete your profile in the next step to enjoy the evaluation from the best coaches.</p>\n\nHere are your login details:\nEmail: ${item.Email}\nPassword: ${password}\n\nPlease change your password upon login.\n\nBest Regards,\nYour Team`,
        //   });
  
        return {
          first_name: item.FirstName,
          last_name: item.LastName,
          email: item.Email,
          country:null,
          
          coach_id: coach_id,
          enterprise_id: enterprise_id,
          team_id: team_id,
          sport: null,
          team: null,
          position: null,
          
          state: null,
          city: null,
          league: null,
          bio: null,
          birthday: null,
          password: hashedPassword,
          slug: slug,
        };
      }));
  
      if (insertData.length > 0) {
      const insertedPlayers = await db.insert(users).values(insertData).returning({ id: users.id });
  if(enterprise_id)
  {
    const teamPlayerData = insertedPlayers.map(player => ({
      teamId: Number(team_id),           // Adjusted to match the schema
      playerId: player.id,       // Adjusted to match the schema
      enterprise_id: Number(enterprise_id), // Adjusted to match the schema
    }));
    await db.insert(teamPlayers).values(teamPlayerData);
  }
  else{
    const teamPlayerData = insertedPlayers.map(player => ({
      teamId: Number(team_id),           // Adjusted to match the schema
      playerId: player.id,       // Adjusted to match the schema
      enterprise_id:0, // Adjusted to match the schema
    }));
    await db.insert(teamPlayers).values(teamPlayerData);
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
                used_for: 'Player',
            }).where(eq(licenses.licenseKey, checkLicense[0].licenseKey));

            if ((updateLicense.rowCount ?? 0) > 0) {
                await db.update(users).set({
                    status: 'Active'
                }).where(eq(users.id, player.id));
            }
            
        }
      }
    }
     

if(duplicates.length>0)
{
  return NextResponse.json({ success: false, message: 'Players inserted and emails sent successfully', duplicates: duplicates, });
}
else{
  return NextResponse.json({ success: true, message: 'Players inserted and emails sent successfully'});
}
      
    } catch (error) {
      console.error('Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
