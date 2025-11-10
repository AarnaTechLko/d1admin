import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  users,
  coaches,
  enterprises,
  countries,
  admin_message,
  chats,
  admin,
} from '@/lib/schema';
import { and, isNotNull, ne, eq, sql} from 'drizzle-orm';
// import { sendEmail } from '@/lib/helpers';
import twilio from "twilio";
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import { sendEmail } from '@/lib/email-service';



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

// type PostRequestBody = {
//   type: 'coach' | 'player' | 'organization';
//   country?: string;
//   state?: string;
//   city?: string;
//   gender?: string;
//   position?: string;
//   message: string;
//   targetIds: string[];
//   methods: {
//     email: boolean;
//     internal: boolean;
//   };
// };

// -------------------- GET Handler --------------------
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "";

    let data: LocationItem[] = [];

    if (type === "player") {
      const conditions = [isNotNull(users.first_name), ne(users.first_name, "")];

      if (status === "no-profile") conditions.push(eq(users.isCompletedProfile, false));
      else if (status === "profile") conditions.push(eq(users.isCompletedProfile, true));
      else if (status === "unsuspend") conditions.push(eq(users.suspend, 1));
      else if (status === "suspend") conditions.push(eq(users.suspend, 0));
      else if (status === "inactive") conditions.push(eq(users.visibility, "off"));
      else if (status === "active") conditions.push(eq(users.visibility, "on"));

      const players = await db
        .select({
          id: users.id,
          email: users.email,
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
        .where(and(...conditions));

      data = players.map((p) => ({
        id: String(p.id),
        name: `${p.firstName} ${p.lastName}`,
        email: p.email ?? null,
        country: p.countryName,
        state: p.state,
        city: p.city,
        gender: p.gender ?? undefined,
        position: p.position ?? undefined,
      }));

    } else if (type === "coach") {
      const conditions = [isNotNull(coaches.firstName), ne(coaches.firstName, "")];

      if (status === "no-profile") conditions.push(eq(coaches.isCompletedProfile, false));
      else if (status === "profile") conditions.push(eq(coaches.isCompletedProfile, true));
      else if (status === "unsuspend") conditions.push(eq(coaches.suspend, 1));
      else if (status === "suspend") conditions.push(eq(coaches.suspend, 0));
      else if (status === "inactive") conditions.push(eq(coaches.visibility, "off"));
      else if (status === "active") conditions.push(eq(coaches.visibility, "on"));
      else if (status === "unapproved") conditions.push(eq(coaches.approved_or_denied, 0));
      else if (status === "approved") conditions.push(eq(coaches.approved_or_denied, 1));

      const coachList = await db
        .select({
          id: coaches.id,
          email: coaches.email,
          firstName: coaches.firstName,
          lastName: coaches.lastName,
          state: coaches.state,
          city: coaches.city,
          countryName: countries.name,
        })
        .from(coaches)
        .leftJoin(countries, eq(coaches.country, sql`CAST(${countries.id} AS TEXT)`))
        .where(and(...conditions));

      data = coachList.map((c) => ({
        id: String(c.id),
        name: `${c.firstName} ${c.lastName}`,
        email: c.email ?? null,
        country: c.countryName,
        state: c.state,
        city: c.city,
      }));

    } else if (type === "organization") {
      const orgs = await db
        .select({
          id: enterprises.id,
          email: enterprises.email,
          organizationName: enterprises.organizationName,
          state: enterprises.state,
          city: enterprises.city,
          countryName: countries.name,
        })
        .from(enterprises)
        .leftJoin(countries, eq(enterprises.country, sql`CAST(${countries.id} AS TEXT)`))
        .where(and(isNotNull(enterprises.organizationName), ne(enterprises.organizationName, "")));

      data = orgs.map((o) => ({
        id: String(o.id),
        name: o.organizationName,
        email: o.email ?? null,
        country: o.countryName,
        state: o.state,
        city: o.city,
      }));

    } else if (type === "staff") {
      const staffList = await db
        .select({
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
        })
        .from(admin)
        .where(eq(admin.is_deleted, 1));

      data = staffList.map((s) => ({
        id: String(s.id),
        name: s.username,
        email: s.email ?? null,
        country: null,
        state: null,
        city: null,
        role: s.role,
      }));

    } else {
      return NextResponse.json({ error: "Invalid type provided." }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ GET Error fetching recipients:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// -------------------- POST Handler --------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, message, targetIds, methods } = body;

    if (!type || !message || !Array.isArray(targetIds) || targetIds.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const subject = body.subject || "📢 New Admin Message";
    const twilioClient = twilio(
      process.env.TWILIO_TEST_ACCOUNT_SID,
      process.env.TWILIO_TEST_AUTH_TOKEN
    );
    const TWILIO_PHONE = process.env.TWILIO_TEST_PHONE_NUMBER;
    const now = new Date();
    // const protocol = req.headers.get("x-forwarded-proto") || "http";
    // const host = req.headers.get("host");
    // const baseUrl = `${protocol}://${host}`;

    const smsResponses: MessageInstance[] = [];

    // ---------- Prepare selected methods as array ----------
    const selectedMethods: string[] = [];
if (methods.email) selectedMethods.push("email");
if (methods.sms) selectedMethods.push("sms");
if (methods.internal) selectedMethods.push("internal");

const messages = targetIds.map((receiverId: string) => ({
  sender_id: 1,
  receiver_id: Number(receiverId),
  message,
  subject: subject,
  methods: JSON.stringify(selectedMethods), // ✅ store array as JSON string
  status: 1,
  read: 0,
  created_at: now,
  updated_at: now,
  type,
}));

await db.insert(admin_message).values(messages);

    // ---------- Save Chat Records ----------
    const chatData = targetIds.map((receiverId: string) => {
      const id = Number(receiverId);
      return type === "coach"
        ? { coachId: id, playerId: 0, club_id: 0, createdAt: now, updatedAt: now }
        : { coachId: 0, playerId: id, club_id: 0, createdAt: now, updatedAt: now };
    });
    await db.insert(chats).values(chatData);

    // ---------- Send Notifications (Email/SMS) ----------
    for (const receiverId of targetIds) {
      const id = Number(receiverId);

      if (type === "coach") {
        const coach = await db.query.coaches.findFirst({ where: eq(coaches.id, id) });

        // Send Email
        if (methods.email && coach?.email) {
          await sendEmail({
            to: coach.email,
            subject: subject,
            html: `Dear ${coach.firstName},<br/><br/>
                   You’ve received a new message from Admin:<br/>
                   <blockquote>${message}</blockquote>
                   <a href="https://d1notes.com/login">Login</a><br/><br/>`,
            text: message,
          });
        }

        // Send SMS
        if (methods.sms && coach?.phoneNumber) {
          const formattedNumber = coach.phoneNumber.startsWith("+")
            ? coach.phoneNumber
            : `+91${coach.phoneNumber.replace(/\D/g, "")}`;
          await twilioClient.messages.create({
            from: TWILIO_PHONE!,
            to: formattedNumber,
            body: `Admin Message: ${message}`,
          });
        }
      }

      if (type === "player") {
        const player = await db.query.users.findFirst({ where: eq(users.id, id) });

        if (methods.email && player?.email) {
          await sendEmail({
            to: player.email,
            subject: subject,
            html: `Dear ${player.first_name},<br/><br/>
                   You’ve received a new message from Admin:<br/>
                   <blockquote>${message}</blockquote>
                   <a href="https://d1notes.com/login">Login</a><br/><br/>`,
            text: message,
          });
        }

        if (methods.sms && player?.number) {
          const formattedNumber = player.number.startsWith("+")
            ? player.number
            : `+91${player.number.replace(/\D/g, "")}`;
          const smsRes = await twilioClient.messages.create({
            from: TWILIO_PHONE!,
            to: formattedNumber,
            body: `Admin Message: ${message}`,
          });
          smsResponses.push(smsRes);
        }
      }

      if (type === "organization") {
        const org = await db.query.enterprises.findFirst({ where: eq(enterprises.id, id) });

        if (methods.email && org?.email) {
          await sendEmail({
            to: org.email,
            subject: subject,
            html: `Dear ${org.organizationName},<br/><br/>
                   You’ve received a new message from Admin:<br/>
                   <blockquote>${message}</blockquote>
                   <a href="https://d1notes.com/login">Login</a><br/><br/>`,
            text: message,
          });
        }

        if (methods.sms && org?.mobileNumber) {
          const formattedNumber = org.mobileNumber.startsWith("+")
            ? org.mobileNumber
            : `+91${org.mobileNumber.replace(/\D/g, "")}`;
          await twilioClient.messages.create({
            from: TWILIO_PHONE!,
            to: formattedNumber,
            body: `Admin Message: ${message}`,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Notification sent successfully (email/internal/SMS).",
      sentMessage: message,
      smsResponses,
    });
  } catch (error) {
    console.error("❌ POST Error sending notification:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


