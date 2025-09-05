import "@/lib/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from 'pg';
import { users } from "./schema";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL, // Aurora connection string injected via ECS
  ssl: { rejectUnauthorized: false }, // Aurora requires SSL
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});
export const db = drizzle(pool, { schema });

export const getUsers = async () => {
  const selectResult = await db.select().from(users);
  console.log("Results", selectResult);
  return selectResult;
};

export type NewUser = typeof users.$inferInsert;

export const insertUser = async (user: NewUser) => {
  return db.insert(users).values(user).returning();
};

export const getAllUsers = async () => {
  return db.query.users.findMany();
};
