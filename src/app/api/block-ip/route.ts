// import { db } from "@/lib/db";
// import { ip_logs, block_ips } from "@/lib/schema";
// import { count, eq ,ilike} from "drizzle-orm";
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: Request) {
//   try {
//     const { ipToBlock } = await req.json();
 
//     // ✅ Check if IP is already blocked
//     const existing = await db
//       .select()
//       .from(block_ips)
//       .where(eq(block_ips.block_ip_address, ipToBlock));

//     if (existing.length > 0) {
//       return NextResponse.json(
//         { error: "IP already blocked" },
//         { status: 400 }
//       );
//     }

//     // ✅ Count users who used this IP (using LEFT JOIN + GROUP BY for consistency)
//     const ipCountResult = await db
//       .select({
//         ip: ip_logs.ip_address,
//         user_count: count(ip_logs.userId).as("user_count"),
//       })
//       .from(ip_logs)
//       .where(eq(ip_logs.ip_address, ipToBlock))
//       .groupBy(ip_logs.ip_address);

//     const userCount = ipCountResult[0]?.user_count ?? 0;

//     // ✅ Insert IP into block_ips table
//     await db.insert(block_ips).values({
//       block_ip_address: ipToBlock,
//       user_count: userCount,
//       status: "block",
//     });

//     return NextResponse.json({
//       success: true,
//       message: `IP blocked successfully for ${userCount} user(s).`,
//     });
//   } catch (error) {
//     console.error("Block IP error:", error);
//     return NextResponse.json(
//       { error: "Failed to block IP" },
//       { status: 500 }
//     );
//   }
// }

// export async function GET(req: NextRequest) {
//     try {
//         const { searchParams } = new URL(req.url);
//         const search = searchParams.get('search');

//         const data = await db
//             .select()
//             .from(block_ips)
//             .where(
//                 search
//                     ? ilike(block_ips.block_ip_address, `%${search}%`)
//                     : undefined
//             );

//         return NextResponse.json(data);
//     } catch (err) {
//         console.error('Error fetching blocked IPs:', err);
//         return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
//     }
// }
import { db } from "@/lib/db";
import { ip_logs, block_ips } from "@/lib/schema";
import { count, eq,ilike,and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { selectedTab, value } = body;

    if (!selectedTab || !value) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 });
    }

    const input = value.trim();

   const alreadyBlocked = await db
  .select()
  .from(block_ips)
  .where(
    and(
      eq(block_ips.block_ip_address, input),
      eq(block_ips.status, "block") // ✅ Only if it's actively blocked
    )
  );

if (alreadyBlocked.length > 0) {
  return NextResponse.json(
    { error: `${selectedTab} is already blocked.` },
    { status: 400 }
  );
}

    // ✅ Build where clause for counting users from ip_logs
    let whereClause;
    switch (selectedTab) {
      case "IP Address":
        whereClause = eq(ip_logs.ip_address, input);
        break;
      case "Country":
        whereClause = eq(ip_logs.country, input);
        break;
      case "City":
        whereClause = eq(ip_logs.city, input);
        break;
      case "Region":
        whereClause = eq(ip_logs.region, input);
        break;
      default:
        return NextResponse.json({ error: "Invalid block type" }, { status: 400 });
    }

    const [{ user_count }] = await db
      .select({ user_count: count(ip_logs.userId).as("user_count") })
      .from(ip_logs)
      .where(whereClause);

    // ✅ Insert into block_ips
    await db.insert(block_ips).values({
      block_ip_address: input,                // 👈 actual value being blocked (IP, city, country, etc.)
      block_type: selectedTab,         // 👈 store tab label exactly as selected (e.g., "City", "Region")
      user_count,
      status: "block",
    });

    return NextResponse.json({
      success: true,
      message: `${selectedTab} blocked successfully for ${user_count} user(s).`,
    });
  } catch (error) {
    console.error("Block IP error:", error);
    return NextResponse.json({ error: "Failed to block entry" }, { status: 500 });
  }
}


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const data = await db
      .select()
      .from(block_ips)
      .where(
        search
          ? ilike(block_ips.block_ip_address, `%${search}%`)
          : undefined
      );

    return NextResponse.json(data);
  } catch (err) {
    console.error("Error fetching blocked IPs:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
