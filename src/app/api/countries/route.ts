// import { NextResponse } from "next/server";
// import { db } from "@/lib/db";
// import { countries, coaches, users } from "@/lib/schema";

// export async function GET() {
//   try {
//     // Fetch all countries
//     const allCountries = await db.select().from(countries);

//     // Fetch all coaches and players
//     const allCoaches = await db.select().from(coaches);
//     const allPlayers = await db.select().from(users);

//     // Group coaches & players by country
//     const result = allCountries.map((country) => {
//       // Ensure comparison works regardless of string/int mismatch
//       const countryId = String(country.id);

//       const countryCoaches = allCoaches.filter(
//         (c) => String(c.country) === countryId
//       );
//       const countryPlayers = allPlayers.filter(
//         (u) => String(u.country) === countryId
//       );

//       const coachIds = countryCoaches.map((c) => c.id);
//       const playerIds = countryPlayers.map((u) => u.id);

//       return {
//         id: country.id,
//         country: country.name,
//         coaches: coachIds.length,
//         players: playerIds.length,
//         customers: [...coachIds, ...playerIds], // merge both arrays
//         coachIds,
//         playerIds,
//       };
//     });

//     // Calculate total customers
//     const totalCustomers = result.reduce(
//       (sum, row) => sum + row.customers.length,
//       0
//     );

//     const formatted = result.map((row) => ({
//       ...row,
//       percentage: totalCustomers
//         ? Math.round((row.customers.length / totalCustomers) * 100)
//         : 0,
//     }));

//     // ✅ Sort: first show countries with data, then the rest
//     const sorted = [
//       ...formatted.filter((row) => row.customers.length > 0),
//       ...formatted.filter((row) => row.customers.length === 0),
//     ];

//     return NextResponse.json(sorted);
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json(
//       { error: "Failed to fetch countries" },
//       { status: 500 }
//     );
//   }
// }



// import { NextResponse } from "next/server";
// import { db } from "@/lib/db";
// import { countries, coaches, users } from "@/lib/schema";

// export async function GET() {
//   try {
//     // Fetch all countries
//     const allCountries = await db.select().from(countries);
//     // Fetch all coaches and players
//     const allCoaches = await db.select().from(coaches);
//     const allPlayers = await db.select().from(users);
//     // Group coaches & players by country
//     const result = allCountries.map((country) => {
//       const countryId = String(country.id);
//       const countryCoaches = allCoaches.filter(
//         (c) => String(c.country) === countryId
//       );
//       const countryPlayers = allPlayers.filter(
//         (u) => String(u.country) === countryId
//       );
//       const coachIds = countryCoaches.map((c) => c.id);
//       const playerIds = countryPlayers.map((u) => u.id);
//       return {
//         id: country.id,
//         country: country.name,
//         coaches: coachIds.length,
//         players: playerIds.length,
//         customers: [...coachIds, ...playerIds], // merged IDs
//         coachIds,
//         playerIds,
        
//       };
//     });

//     // ✅ Keep only countries that actually have customers
//     const nonEmpty = result.filter((row) => row.customers.length > 0);

//     // Calculate total customers (only from non-empty countries)
//     const totalCustomers = nonEmpty.reduce(
//       (sum, row) => sum + row.customers.length,
//       0
//     );

//     const formatted = nonEmpty.map((row) => ({
//       ...row,
//       percentage: totalCustomers
//         ? Math.round((row.customers.length / totalCustomers) * 100)
//         : 0,
//     }));

//     return NextResponse.json(formatted);
//   } catch (err) {
//     console.error("Error fetching country data:", err);
//     return NextResponse.json(
//       { error: "Failed to fetch countries" },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { countries, coaches, users } from "@/lib/schema";

export async function GET() {
  try {
    // Fetch all countries with lat/lng
    const allCountries = await db.select({
      id: countries.id,
      shortname: countries.shortname,
      country: countries.name,
      lat: countries.lat, // Type-safe access
      lng: countries.lng, // Type-safe access
    }).from(countries);

    // Fetch all coaches and players
    const allCoaches = await db.select().from(coaches);
    const allPlayers = await db.select().from(users);

    // Map countries to include coach/player counts and IDs
    const result = allCountries.map((country) => {
      const countryId = String(country.id);

      const countryCoaches = allCoaches.filter(
        (c) => String(c.country) === countryId
      );
      const countryPlayers = allPlayers.filter(
        (u) => String(u.country) === countryId
      );

      const coachIds = countryCoaches.map((c) => c.id);
      const playerIds = countryPlayers.map((u) => u.id);

      return {
        id: country.id,
        shortname: country.shortname ?? "",
        country: country.country ?? "",
        coaches: coachIds.length,
        players: playerIds.length,
        customers: [...coachIds, ...playerIds],
        coachIds,
        playerIds,
        lat: country.lat ?? null,
        lng: country.lng ?? null,
      };
    });

    // Only include countries with at least one customer
    const nonEmpty = result.filter((row) => row.customers.length > 0);

    // Calculate total customers
    const totalCustomers = nonEmpty.reduce(
      (sum, row) => sum + row.customers.length,
      0
    );

    // Add percentage per country
    const formatted = nonEmpty.map((row) => ({
      ...row,
      percentage: totalCustomers
        ? Math.round((row.customers.length / totalCustomers) * 100)
        : 0,
    }));
    console.log("formatted",formatted);

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Error fetching country data:", err);
    return NextResponse.json(
      { error: "Failed to fetch countries" },
      { status: 500 }
    );
  }
}
