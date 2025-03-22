import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  uniqueIndex,
  integer
} from "drizzle-orm/pg-core";

export const coaches = pgTable(
  "coaches",
  {
    id: serial("id").primaryKey(),
    first_name: varchar("first_name"),
    last_name: varchar("last_name"),
    experience_years: integer("experience_years"),
    certification_level: varchar("certification_level"),
    location: varchar("location"),
    gender: varchar("gender"),
    sport: varchar("sport"),
    team: varchar("team"),
    email: varchar("email").notNull().unique(),
    phone: varchar("phone"),
    image: text("image"),
    password: text("password").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (coaches) => ({
    uniqueIdx: uniqueIndex("unique_idx").on(coaches.email),
  })
);
