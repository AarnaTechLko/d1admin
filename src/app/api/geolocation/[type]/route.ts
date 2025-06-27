import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  users,
  coaches,
  enterprises,
  countries,
  admin_message,
  chats,
} from '@/lib/schema';
import { and, isNotNull, ne, eq, sql } from 'drizzle-orm';
import { sendEmail } from '@/lib/helpers';

// -------------------- Types --------------------
type LocationItem = {
  id: string;
  name: string;
  country: string | null;
  state: string | null;
  city: string | null;
  gender?: string | null;
  position?: string | null;
};

type PostRequestBody = {
  type: 'coach' | 'player' | 'organization';
  country?: string;
  state?: string;
  city?: string;
  gender?: string;
  position?: string;
  message: string;
  targetIds: string[];
  methods: {
    email: boolean;
    internal: boolean;
  };
};

// -------------------- GET Handler --------------------
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    let data: LocationItem[] = [];

    if (type === 'player') {
      const players = await db
        .select({
          id: users.id,
          firstName: users.first_name,
          lastName: users.last_name,
          state: users.state,
          city: users.city,
          gender: users.gender,
          position: users.position,
          countryName: countries.name,
        })
        .from(users)
        .leftJoin(countries, eq(users.country, sql`CAST(${countries.id} AS TEXT)`))
        .where(and(isNotNull(users.first_name), ne(users.first_name, '')));

      data = players.map((p) => ({
        id: String(p.id),
        name: `${p.firstName} ${p.lastName}`,
        country: p.countryName,
        gender: p.gender ?? undefined,
        position: p.position ?? undefined,
        state: p.state,
        city: p.city,
      }));
    } else if (type === 'coach') {
      const coachList = await db
        .select({
          id: coaches.id,
          firstName: coaches.firstName,
          lastName: coaches.lastName,
          state: coaches.state,
          city: coaches.city,
          countryName: countries.name,
        })
        .from(coaches)
        .leftJoin(countries, eq(coaches.country, sql`CAST(${countries.id} AS TEXT)`))
        .where(and(isNotNull(coaches.firstName), ne(coaches.firstName, '')));

      data = coachList.map((c) => ({
        id: String(c.id),
        name: `${c.firstName} ${c.lastName}`,
        country: c.countryName,
        state: c.state,
        city: c.city,
      }));
    } else if (type === 'organization') {
      const orgs = await db
        .select({
          id: enterprises.id,
          organizationName: enterprises.organizationName,
          state: enterprises.state,
          city: enterprises.city,
          countryName: countries.name,
        })
        .from(enterprises)
        .leftJoin(countries, eq(enterprises.country, sql`CAST(${countries.id} AS TEXT)`))
        .where(and(isNotNull(enterprises.organizationName), ne(enterprises.organizationName, '')));

      data = orgs.map((o) => ({
        id: String(o.id),
        name: o.organizationName,
        country: o.countryName,
        state: o.state,
        city: o.city,
      }));
    } else {
      return NextResponse.json({ error: 'Invalid type provided.' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ GET Error fetching recipients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// -------------------- POST Handler --------------------
export async function POST(req: NextRequest) {
  try {
    const body: PostRequestBody = await req.json();
    const { type, message, targetIds, methods } = body;

    if (!type || !message || !Array.isArray(targetIds) || targetIds.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const now = new Date();
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host');
    const baseUrl = `${protocol}://${host}`;

    // Insert internal message
    if (methods.internal) {
      const messages = targetIds.map((receiverId) => ({
        sender_id: 1,
        receiver_id: Number(receiverId),
        message,
        status: 1,
        read: 0,
        created_at: now,
        updated_at: now,
      }));
      await db.insert(admin_message).values(messages);
    }

    // Insert chat records
    const chatData = targetIds.map((receiverId) => {
      const id = Number(receiverId);
      return type === 'coach'
        ? { coachId: id, playerId: 0, club_id: 0, createdAt: now, updatedAt: now }
        : { coachId: 0, playerId: id, club_id: 0, createdAt: now, updatedAt: now };
    });
    await db.insert(chats).values(chatData);

    // Send email (if enabled)
    if (methods.email) {
      for (const receiverId of targetIds) {
        const id = Number(receiverId);

        if (type === 'coach') {
          const coach = await db.query.coaches.findFirst({ where: eq(coaches.id, id) });
          if (coach?.email) {
            await sendEmail({
              to: coach.email,
              subject: '📢 New Admin Message',
              html: `
                Dear ${coach.firstName},<br/><br/>
                You’ve received a new message from Admin:<br/>
                <blockquote>${message}</blockquote>
                <a href="${baseUrl}/login">Login</a> to view the message.<br/><br/>
                Regards,<br/>D1 Admin`,
              text: message,
            });
          }
        } else if (type === 'player') {
          const player = await db.query.users.findFirst({ where: eq(users.id, id) });
          if (player?.email) {
            await sendEmail({
              to: player.email,
              subject: '📢 New Admin Message',
              html: `
                Dear ${player.first_name},<br/><br/>
                You’ve received a new message from Admin:<br/>
                <blockquote>${message}</blockquote>
                <a href="${baseUrl}/login">Login</a> to view the message.<br/><br/>
                Regards,<br/>D1 Admin`,
              text: message,
            });
          }
        } else if (type === 'organization') {
          const org = await db.query.enterprises.findFirst({ where: eq(enterprises.id, id) });
          if (org?.email) {
            await sendEmail({
              to: org.email,
              subject: '📢 New Admin Message',
              html: `
                Dear ${org.organizationName},<br/><br/>
                You’ve received a new message from Admin:<br/>
                <blockquote>${message}</blockquote>
                <a href="${baseUrl}/login">Login</a> to view the message.<br/><br/>
                Regards,<br/>D1 Admin`,
              text: message,
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully.',
    });
  } catch (error) {
    console.error('❌ POST Error sending notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

