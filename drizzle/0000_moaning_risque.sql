CREATE TABLE "admin" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "chatfriend" (
	"id" serial PRIMARY KEY NOT NULL,
	"chatfrom" integer,
	"chatto" integer,
	"chattoname" text,
	"chattotype" text,
	"club_id" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chats" (
	"id" serial PRIMARY KEY NOT NULL,
	"coachId" integer NOT NULL,
	"playerId" integer NOT NULL,
	"club_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "coachaccount" (
	"id" serial PRIMARY KEY NOT NULL,
	"coach_id" integer NOT NULL,
	"amount" numeric NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coachearnings" (
	"id" serial PRIMARY KEY NOT NULL,
	"coach_id" integer,
	"evaluation_id" integer NOT NULL,
	"evaluation_title" varchar,
	"player_id" integer,
	"company_amount" numeric,
	"commision_rate" numeric,
	"commision_amount" numeric,
	"transaction_id" varchar,
	"status" varchar,
	"coupon" varchar,
	"coupon_discount_percentage" numeric,
	"discount_amount" numeric,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coaches" (
	"id" serial PRIMARY KEY NOT NULL,
	"firstName" varchar,
	"lastName" varchar,
	"email" varchar,
	"phoneNumber" varchar,
	"gender" varchar,
	"location" varchar,
	"sport" varchar,
	"clubName" varchar,
	"qualifications" text,
	"expectedCharge" numeric(10, 2),
	"image" text,
	"visibility" varchar DEFAULT 'off',
	"slug" text,
	"enterprise_id" text,
	"team_id" text,
	"country" varchar,
	"state" varchar,
	"city" varchar,
	"currency" varchar DEFAULT '$',
	"rating" numeric(10, 1) DEFAULT '0',
	"password" text NOT NULL,
	"certificate" text,
	"countrycode" text,
	"facebook" text,
	"instagram" text,
	"linkedin" text,
	"xlink" text,
	"youtube" text,
	"website" text,
	"cv" text,
	"license_type" text,
	"license" text,
	"status" varchar DEFAULT 'Pending',
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" serial PRIMARY KEY NOT NULL,
	"shortname" text,
	"name" text,
	"phonecode" text
);
--> statement-breakpoint
CREATE TABLE "enterprises" (
	"id" serial PRIMARY KEY NOT NULL,
	"organizationName" text NOT NULL,
	"contactPerson" text,
	"owner_name" text,
	"package_id" integer,
	"email" text NOT NULL,
	"mobileNumber" text,
	"countryCodes" text,
	"address" text,
	"country" text,
	"state" text,
	"city" text,
	"logo" text,
	"affiliationDocs" text,
	"slug" text,
	"parent_id" integer,
	"role_id" integer,
	"buy_evaluation" text,
	"view_evaluation" text,
	"password" text NOT NULL,
	"description" text,
	"facebook" text,
	"instagram" text,
	"linkedin" text,
	"xlink" text,
	"youtube" text,
	"website" text,
	"status" text DEFAULT 'Active',
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evaluation_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"playerId" integer NOT NULL,
	"coachId" integer NOT NULL,
	"club_id" integer,
	"evaluation_id" integer NOT NULL,
	"finalRemarks" text,
	"physicalRemarks" text,
	"tacticalRemarks" text,
	"technicalRemarks" text,
	"organizationalRemarks" text,
	"distributionRemarks" text,
	"physicalScores" text NOT NULL,
	"tacticalScores" text NOT NULL,
	"technicalScores" text NOT NULL,
	"distributionScores" text,
	"organizationScores" text,
	"document" text,
	"position" text,
	"sport" text,
	"thingsToWork" text
);
--> statement-breakpoint
CREATE TABLE "evaluation_charges" (
	"id" serial PRIMARY KEY NOT NULL,
	"coach_id" integer,
	"currency" text,
	"turnaroundtime" text,
	"amount" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forgetPassword" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"role" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "freerequests" (
	"id" serial PRIMARY KEY NOT NULL,
	"clubId" integer,
	"requests" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_type" text,
	"enterprise_id" integer,
	"team_id" integer,
	"email" text,
	"invitation_for" text,
	"mobile" text,
	"invitation_link" text,
	"status" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "joinRequest" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer,
	"coach_id" integer,
	"club_id" integer,
	"type" text,
	"requestToID" integer,
	"message" text,
	"status" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "licenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"enterprise_id" integer NOT NULL,
	"buyer_type" text NOT NULL,
	"package_id" integer NOT NULL,
	"payment_info" text,
	"licenseKey" text NOT NULL,
	"used_for" text,
	"used_by" text,
	"assigned_to" integer,
	"status" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_id" integer NOT NULL,
	"sender_id" integer NOT NULL,
	"club_id" integer,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"module_fields" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orderHistory" (
	"id" serial PRIMARY KEY NOT NULL,
	"enterprise_id" integer,
	"package_id" integer,
	"amount" text,
	"licenses" integer,
	"rate" integer,
	"description" text,
	"status" text,
	"payment_info" text,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "otps" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"otp" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"packageName" text NOT NULL,
	"amount" text NOT NULL,
	"noOfLicnese" integer,
	"details" text NOT NULL,
	"status" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"coach_id" integer NOT NULL,
	"evaluation_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" varchar,
	"currency" varchar,
	"payment_info" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "player_evaluation" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"coach_id" integer NOT NULL,
	"club_id" integer,
	"parent_id" integer,
	"review_title" varchar NOT NULL,
	"primary_video_link" text NOT NULL,
	"video_link_two" text,
	"video_link_three" text,
	"video_description" text NOT NULL,
	"video_descriptionTwo" text,
	"video_descriptionThree" text,
	"jerseyNumber" text,
	"jerseyNumberTwo" text,
	"jerseyNumberThree" text,
	"jerseyColorOne" text,
	"jerseyColorTwo" text,
	"jerseyColorThree" text,
	"positionOne" text,
	"positionTwo" text,
	"positionThree" text,
	"status" integer NOT NULL,
	"turnaroundTime" varchar,
	"payment_status" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"accepted_at" timestamp,
	"rating" integer,
	"remarks" text,
	"videoOneTiming" text,
	"videoTwoTiming" text,
	"videoThreeTiming" text,
	"position" text,
	"lighttype" text,
	"percentage" text,
	"rejectremarks" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "playerbanner" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"usertype" text,
	"filepath" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"club_id" integer,
	"role_name" text,
	"module_id" text,
	"permissions" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_token" text NOT NULL,
	"user_id" serial NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "states" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"country_id" integer
);
--> statement-breakpoint
CREATE TABLE "teamCoaches" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"coachId" integer NOT NULL,
	"enterprise_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teamPlayers" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	"enterprise_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teamjoinRequest" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer,
	"player_id" integer,
	"message" text,
	"status" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_name" text NOT NULL,
	"manager_name" text,
	"manager_email" text,
	"manager_phone" text,
	"countryCodes" text,
	"logo" text NOT NULL,
	"description" text NOT NULL,
	"created_by" text NOT NULL,
	"club_id" integer,
	"slug" text NOT NULL,
	"creator_id" integer,
	"coach_id" integer,
	"team_type" text,
	"team_year" text,
	"cover_image" text,
	"password" text,
	"status" text,
	"country" text,
	"state" text,
	"address" text,
	"rating" integer,
	"city" text,
	"age_group" text,
	"leage" text,
	"visibility" varchar DEFAULT 'off',
	"facebook" text,
	"instagram" text,
	"linkedin" text,
	"xlink" text,
	"youtube" text,
	"website" text,
	"buy_evaluation" text,
	"view_evaluation" text,
	"parent_id" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar,
	"last_name" varchar,
	"grade_level" varchar,
	"location" varchar,
	"birthday" date,
	"gender" varchar,
	"sport" varchar,
	"team" varchar,
	"jersey" varchar,
	"position" varchar,
	"number" varchar,
	"email" varchar NOT NULL,
	"image" text,
	"bio" text,
	"country" varchar DEFAULT '0',
	"state" varchar,
	"city" varchar,
	"league" text,
	"countrycode" text,
	"password" text NOT NULL,
	"enterprise_id" text DEFAULT '0',
	"coach_id" text DEFAULT '0',
	"team_id" text DEFAULT '0',
	"slug" text,
	"playingcountries" text,
	"height" text,
	"weight" text,
	"parent_id" integer,
	"gpa" text,
	"graduation" text,
	"school_name" text,
	"facebook" text,
	"instagram" text,
	"linkedin" text,
	"website" text,
	"xlink" text,
	"youtube" text,
	"age_group" text DEFAULT '0',
	"birth_year" text DEFAULT '0',
	"status" varchar DEFAULT 'Pending',
	"visibility" varchar DEFAULT 'off',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "coaches_unique_idx" ON "coaches" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_unique_idx" ON "payments" USING btree ("player_id","coach_id","evaluation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_unique_idx" ON "users" USING btree ("email");