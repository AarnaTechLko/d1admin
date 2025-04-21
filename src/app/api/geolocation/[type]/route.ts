import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { coaches } from '@/lib/schema';
import { enterprises } from '@/lib/schema';
import { and, isNotNull, ne } from 'drizzle-orm';

// Define a type for your response data
interface LocationData {
  id: string;
  name: string;
  country: string | null;
  state: string | null;
  city: string | null;
}

export async function GET(req: NextRequest, context: { params: { type: string } }) {
  const { type } = context.params; // Extract type from context.params
  let data: LocationData[] = [];

  if (type === 'player') {
    const players = await db
      .select()
      .from(users)
      .where(
        and(
          isNotNull(users.first_name),
          ne(users.first_name, '')
        )
      );

    data = players.map((item) => ({
      id: String(item.id), // Convert to string
      name: `${item.first_name} ${item.last_name}`,
      country: item.country,
      state: item.state,
      city: item.city,
    }));
  } else if (type === 'coach') {
    const coachesList = await db
      .select()
      .from(coaches)
      .where(
        and(
          isNotNull(coaches.firstName),
          ne(coaches.firstName, '')
        )
      );

    data = coachesList.map((item) => ({
      id: String(item.id),
      name: `${item.firstName} ${item.lastName}`,
      country: item.country,
      state: item.state,
      city: item.city,
    }));
  } else if (type === 'organization') {
    const organizations = await db
      .select()
      .from(enterprises)
      .where(
        and(
          isNotNull(enterprises.organizationName),
          ne(enterprises.organizationName, '')
        )
      );

    data = organizations.map((item) => ({
      id: String(item.id), // Convert number to string
      name: item.organizationName,
      country: item.country,
      state: item.state,
      city: item.city,
    }));
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      type,
      country,
      state,
      city,
      message,
      targetIds,
    }: {
      type: 'player' | 'coach' | 'organization';
      country?: string;
      state?: string;
      city?: string;
      message: string;
      targetIds: string[];
    } = body;

    if (!type || !message || !Array.isArray(targetIds) || targetIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields or no recipients selected.' },
        { status: 400 }
      );
    }

    // Simulate sending notification
    console.log(`📢 Sending notification to ${type}s...`);
    console.log(`🌍 Location: ${country || 'any'} / ${state || 'any'} / ${city || 'any'}`);
    console.log(`📝 Message: ${message}`);
    console.log(`🎯 Recipients: ${targetIds.join(', ')}`);

    return NextResponse.json({ success: true, message: 'Notification sent successfully.' });
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
