import { db } from "@/lib/db";
import { coaches, users } from "@/lib/schema";
type UserStatus = {
  suspend: number;
  is_deleted: number;
};
export async function GET() {
  try {
    const [coachData, playerData] = await Promise.all([
      db.select().from(coaches),
      db.select().from(users),
    ]);

const countStatus = (arr: UserStatus[]) => ({
      view: arr.filter((item) => item.suspend === 1 && item.is_deleted === 1).length,
      suspended: arr.filter((item) => item.suspend === 0&& item.is_deleted === 1).length,
      disabled: arr.filter((item) => item.is_deleted === 0).length,
    });

    const response = {
      coach: countStatus(coachData),
      player: countStatus(playerData),
    };
console.log("res",response);
    return new Response(JSON.stringify(response), { status: 200 });
  } catch (err) {
    console.error("Status API Error:", err);
    return new Response("Failed to fetch coach/player stats", { status: 500 });
  }
}
