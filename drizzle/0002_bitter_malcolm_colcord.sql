CREATE TABLE "coaches" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"expertise" text,
	"email" text NOT NULL,
	CONSTRAINT "coaches_email_unique" UNIQUE("email")
);
