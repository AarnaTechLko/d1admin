CREATE TABLE "ticket_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"replied_by" text NOT NULL,
	"message" text NOT NULL,
	"status" varchar DEFAULT 'Pending',
	"created_at" timestamp DEFAULT now()
);
