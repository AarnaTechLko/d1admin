// // /app/api/data/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/lib/db"; // Your DB config
// import {  gte } from "drizzle-orm";
// import { sub } from "date-fns";
// import { users, coaches, enterprises, teams, ticket, payments, playerEvaluation } from "@/lib/schema";

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const type = searchParams.get("type");

//   const last24Hours = sub(new Date(), { hours: 24 });

//   const tableMap: any = {
//     player: users,
//     coach: coaches,
//     organization: enterprises,
//     team: teams,
//     ticket: ticket,
//     payment: payments,
//     evaluation: playerEvaluation,
//   };

//   const table = tableMap[type as keyof typeof tableMap];
//   if (!table) return NextResponse.json({ data: [] });

//   const data = await db
//     .select()
//     .from(table)
//     .where(gte(table.created_at, last24Hours));

//   return NextResponse.json({ data });
// }
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gte } from "drizzle-orm";
import { sub } from "date-fns";
import {
  users,
  coaches,
  enterprises,
  teams,
  ticket,
  payments,
  playerEvaluation,
} from "@/lib/schema";

// Only allow these specific types
type TableKey =
  | "player"
  | "coach"
  | "organization"
  | "team"
  | "ticket"
  | "payment"
  | "evaluation";

// Map type name to actual Drizzle table object
const tableMap = {
  player: users,
  coach: coaches,
  organization: enterprises,
  team: teams,
  ticket: ticket,
  payment: payments,
  evaluation: playerEvaluation,
} as const;

// Get keys from tableMap
// type TableMap = typeof tableMap;
// type ValidTable = TableMap[TableKey];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as TableKey | null;

    if (!type || !(type in tableMap)) {
      return NextResponse.json({ error: "Invalid type parameter." }, { status: 400 });
    }

    const table = tableMap[type];
    const since = sub(new Date(), { hours: 24 });

    const data = await db
      .select()
      .from(table)
      // @ts-expect-error: Assume created_at exists; ensure it's in your schema
      .where(gte(table.created_at, since));

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
          console.error("Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
