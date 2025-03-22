import { varchar,serial, text, pgTable, timestamp } from "drizzle-orm/pg-core";


export const details = pgTable("details", {
  id: varchar("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// import { pgTable, serial, text, varchar, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 150 }).unique().notNull(),
  password: text("password").notNull(), // Storing hashed password
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const coaches = pgTable("coaches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  expertise: text("expertise"),
  email: text("email").unique().notNull(),
});

// import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  position: text("position"),
  email: text("email").unique().notNull(),
});

// import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type"),
  email: text("email").unique().notNull(),
});

// import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  coach: text("coach"),
  location: text("location"),
});
