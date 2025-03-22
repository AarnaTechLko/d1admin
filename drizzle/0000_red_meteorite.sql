CREATE TABLE "details" (
	"id" varchar PRIMARY KEY NOT NULL,
	"username" varchar(100) NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "details_username_unique" UNIQUE("username")
);
