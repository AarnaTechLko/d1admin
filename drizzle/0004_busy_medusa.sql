CREATE TABLE "ticket_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"replied_by" text NOT NULL,
	"message" text NOT NULL,
	"status" varchar DEFAULT 'Pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ticket" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "coaches" ADD COLUMN "isCompletedProfile" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "assign_to" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "isCompletedProfile" boolean DEFAULT false;