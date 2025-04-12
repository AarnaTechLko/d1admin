CREATE TABLE "userOrgStatus" (
	"org_user_id" integer,
	"enterprise_id" integer,
	"status" text DEFAULT 'Pending' NOT NULL,
	"text" text
);
--> statement-breakpoint
ALTER TABLE "userOrgStatus" ADD CONSTRAINT "userOrgStatus_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE no action ON UPDATE no action;