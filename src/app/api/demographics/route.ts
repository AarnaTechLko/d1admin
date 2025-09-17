// import { NextResponse } from "next/server";
// import { db } from "@/lib/db";
// import { countries, coaches, users } from "@/lib/schema";
// import { sql, eq } from "drizzle-orm";

// export async function GET() {
//   try {
//     // Fetch countries with counts of coaches & players
//     const result = await db
//       .select({
//         id: countries.id,
//         country: countries.name,
//         coachesCount: sql<number>`COUNT(DISTINCT ${coaches.id})`,
//         playersCount: sql<number>`COUNT(DISTINCT ${users.id})`,
//       })
//       .from(countries)
//       .leftJoin(coaches, eq(coaches.country, countries.id)) // ✅ join by ID
//       .leftJoin(users, eq(users.country, countries.id))     // ✅ join by ID
//       .groupBy(countries.id, countries.name);

//     // Total across all countries
//     const totalCustomers = result.reduce(
//       (sum, row) => sum + (Number(row.coachesCount) + Number(row.playersCount)),
//       0
//     );

//     // Format response
//     const demographics = result.map((row) => {
//       const coaches = Number(row.coachesCount ?? 0);
//       const players = Number(row.playersCount ?? 0);
//       const customers = coaches + players;

//       return {
//         id: row.id,
//         country: row.country ?? "Unknown",
//         coaches,
//         players,
//         customers,
//         percentage: totalCustomers
//           ? Math.round((customers / totalCustomers) * 100)
//           : 0,
//         image: `/images/country/${(row.country ?? "unknown")
//           .toLowerCase()
//           .replace(/\s+/g, "-")}.png`,
//       };
//     });

//     return NextResponse.json(demographics);
//   } catch (error) {
//     console.error("Error fetching demographics:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch demographics" },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { countries, coaches, users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        // Get all countries
        const allCountries = await db.select().from(countries);

        // For each country, fetch its coaches & players
        const demographics = await Promise.all(
            allCountries.map(async (country) => {
                const countryCoaches = await db
                    .select()
                    .from(coaches)
                    .where(eq(coaches.country, country.name!));  // ✅ string match

                const countryPlayers = await db
                    .select()
                    .from(users)
                    .where(eq(users.country, country.name!));   // ✅ string match

                return {
                    id: country.id,
                    country: country.name ?? "Unknown",
                    coaches: countryCoaches, // full coach objects
                    players: countryPlayers, // full player objects
                    coachesCount: countryCoaches.length,
                    playersCount: countryPlayers.length,
                    customers: countryCoaches.length + countryPlayers.length,
                    image: `/images/country/${(country.name ?? "unknown")
                        .toLowerCase()
                        .replace(/\s+/g, "-")}.png`,
                };
            })
        );

        return NextResponse.json(demographics);
    } catch (error) {
        console.error("Error fetching demographics:", error);
        return NextResponse.json(
            { error: "Failed to fetch demographics" },
            { status: 500 }
        );
    }
}
