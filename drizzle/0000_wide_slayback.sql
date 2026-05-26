CREATE TABLE "ability" (
	"id" serial PRIMARY KEY NOT NULL,
	"evaluation_id" integer NOT NULL,
	"filename" text NOT NULL,
	"comments" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admin" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" text NOT NULL,
	"country_code" text NOT NULL,
	"phone_number" text NOT NULL,
	"birthdate" date NOT NULL,
	"image" text,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "admin_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "admin_message" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" integer DEFAULT 1,
	"receiver_id" integer NOT NULL,
	"methods" text,
	"message" text NOT NULL,
	"status" integer DEFAULT 1,
	"read" integer DEFAULT 0,
	"subject" text NOT NULL,
	"type" varchar(20),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admin_payment_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"payment_id" integer NOT NULL,
	"admin_id" integer NOT NULL,
	"action_reason" text NOT NULL,
	"action_type" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "block_ips" (
	"id" serial PRIMARY KEY NOT NULL,
	"block_ip_address" varchar(45) NOT NULL,
	"user_count" integer NOT NULL,
	"status" varchar(10) DEFAULT 'block',
	"is_deleted" integer DEFAULT 1,
	"block_type" varchar(20)
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"coach_id" integer,
	"player_id" integer,
	"evaluation_id" integer,
	"start_time" timestamp with time zone,
	"end_time" timestamp with time zone,
	"status" varchar(20),
	"meeting_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"position_id" integer,
	"name" varchar(50) NOT NULL,
	"display_order" integer NOT NULL,
	"optional" boolean DEFAULT false,
	"is_removed" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "categories_attributes" (
	"id" serial PRIMARY KEY NOT NULL,
	"categories_id" integer,
	"name" varchar(50) NOT NULL,
	"data_type" text NOT NULL,
	"display_order" integer,
	"is_removed" boolean DEFAULT false
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
CREATE TABLE "coach_teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"sport" integer,
	"coach_id" integer,
	"team_name" text NOT NULL,
	"gender" text NOT NULL,
	"age_group" text,
	"birth_year" text,
	"league" text,
	"logo" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"graduation_year" integer
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
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" integer DEFAULT 1 NOT NULL,
	"stripe_transfer_id" text,
	"funds_available_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "coaches" (
	"id" serial PRIMARY KEY NOT NULL,
	"blockedPlayerIds" text,
	"firstName" varchar,
	"lastName" varchar,
	"email" varchar,
	"phoneNumber" varchar,
	"gender" varchar,
	"location" varchar,
	"sport" integer,
	"clubName" varchar,
	"title" varchar,
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
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"is_deleted" integer DEFAULT 1 NOT NULL,
	"isCompletedProfile" boolean DEFAULT false,
	"avgReviewRating" numeric(10, 1) DEFAULT '0',
	"is_email_verified" boolean DEFAULT false,
	"last_login_attempt" timestamp,
	"blocked_time" timestamp,
	"no_of_attempts" integer DEFAULT 0,
	"stripe_acount_id" text,
	"stripe_payouts_enabled" boolean DEFAULT false,
	"stripe_details_submitted" boolean DEFAULT false,
	"approved_or_denied" integer DEFAULT 0,
	"tiktok" text,
	"suspend" integer DEFAULT 1 NOT NULL,
	"suspend_days" integer,
	"suspend_start_date" date,
	"suspend_end_date" date,
	"verified" integer DEFAULT 0,
	"percentage" numeric,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"coach_level" text NOT NULL,
	"highschool_compliance" boolean DEFAULT true,
	"eighth_grade_compliance" boolean DEFAULT true,
	"feature_in_carousel" boolean DEFAULT false,
	"grade_compliance" integer[] DEFAULT '{}'::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" serial PRIMARY KEY NOT NULL,
	"shortname" text,
	"name" text,
	"phonecode" text,
	"lat" double precision,
	"lng" double precision
);
--> statement-breakpoint
CREATE TABLE "discount_coupon" (
	"id" serial PRIMARY KEY NOT NULL,
	"coach_id" integer,
	"name" varchar(255) NOT NULL,
	"discount" numeric(5, 2) NOT NULL,
	"count" integer DEFAULT 0,
	"marked_delete" boolean DEFAULT false,
	"date_created" timestamp DEFAULT now(),
	"isActive" boolean DEFAULT true
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
	"last_login_attempt" timestamp,
	"is_deleted" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"suspend" integer DEFAULT 1 NOT NULL,
	"suspend_days" integer,
	"suspend_start_date" date,
	"suspend_end_date" date,
	"blocked_time" timestamp,
	"no_of_attempts" integer DEFAULT 0,
	"is_email_verified" boolean DEFAULT false,
	"isCompletedProfile" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "evaluation_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"playerId" integer NOT NULL,
	"coachId" integer NOT NULL,
	"club_id" integer,
	"evaluation_id" integer NOT NULL,
	"finalRemarks" text,
	"coach_input" json,
	"eval_average" numeric,
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
CREATE TABLE "expense_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer DEFAULT 0,
	"categoryid" integer,
	"amount" numeric(12, 2) DEFAULT '0',
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"date" date DEFAULT now() NOT NULL,
	"is_deleted" integer DEFAULT 1 NOT NULL
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
CREATE TABLE "guest_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_id" integer NOT NULL,
	"message" text NOT NULL,
	"sender" varchar(20) NOT NULL,
	"created_at" text DEFAULT 'now()'
);
--> statement-breakpoint
CREATE TABLE "guest_user" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255),
	"phone" varchar(20),
	"message" text,
	"status" integer DEFAULT 1
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
	"invitation_status" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ip_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"ip_address" varchar(45) NOT NULL,
	"type" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"login_time" timestamp,
	"logout_time" timestamp,
	"city" varchar(100),
	"region" varchar(100),
	"country" varchar(5),
	"postal" varchar(20),
	"org" varchar(255),
	"loc" varchar(50),
	"timezone" varchar(100)
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
CREATE TABLE "master_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "master_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_id" integer NOT NULL,
	"sender_id" integer NOT NULL,
	"receiver_id" integer NOT NULL,
	"club_id" integer,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"read" boolean DEFAULT false
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
CREATE TABLE "parent_consents" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"parent_name" varchar(100) NOT NULL,
	"consent_date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"coach_id" integer NOT NULL,
	"evaluation_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"original_amount" numeric(10, 2),
	"status" varchar,
	"currency" varchar,
	"payment_info" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"description" text,
	"intent_id" text,
	"charge_id" text,
	"waive_off" boolean DEFAULT false,
	"discount" numeric(5, 2) DEFAULT '0',
	"coupon_code_id" integer,
	"is_deleted" integer DEFAULT 1 NOT NULL
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
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_updated_by_id" integer,
	"is_deleted" integer DEFAULT 1 NOT NULL,
	"review_status" integer DEFAULT 1 NOT NULL,
	"pdf_filename" text
);
--> statement-breakpoint
CREATE TABLE "player_positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"sport_id" integer,
	"name" varchar(50) NOT NULL,
	"display_order" integer NOT NULL,
	"is_removed" boolean DEFAULT false,
	"type" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_sports_attributes" (
	"id" serial PRIMARY KEY NOT NULL,
	"sport_id" integer,
	"name" varchar(50) NOT NULL,
	"marked_false" boolean DEFAULT false,
	"display_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_under_coaches" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer,
	"coach_id" integer NOT NULL,
	"email" text NOT NULL,
	"coach_team_id" integer,
	"invitation_link" text NOT NULL,
	"invitation_status" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
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
CREATE TABLE "players_under_coach_teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer,
	"player_id" integer
);
--> statement-breakpoint
CREATE TABLE "positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"sport_id" integer,
	"name" varchar(50) NOT NULL,
	"display_order" integer NOT NULL,
	"is_removed" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "radar_evaluation" (
	"id" serial PRIMARY KEY NOT NULL,
	"playerId" integer,
	"coachId" integer,
	"club_id" integer,
	"evaluation_id" integer,
	"speed" integer,
	"ability" integer,
	"cod_with_ball" integer,
	"cod_without_ball" integer,
	"counter_move_jump" integer,
	"receiving_first_touch" integer,
	"shots_on_goal" integer,
	"finishing_touches" integer,
	"combination_play" integer,
	"workrate" integer,
	"pressing_from_front" integer,
	"one_v_one_domination" integer,
	"goal_threat" integer,
	"being_a_good_teammate" integer,
	"decision_making_score" integer,
	"touches_in_final_third" integer,
	"off_the_ball_movement" integer,
	"space_in_box_ability" integer,
	"forward_runs" integer,
	"persistence" text,
	"aggression" text,
	"alertness" text,
	"scoring" text,
	"receiving" text,
	"passing" text,
	"mobility" text,
	"anticipation" text,
	"pressure" text,
	"speed_endurance" text,
	"strength" text,
	"explosive_movements" text,
	"super_strengths" text,
	"development_areas" text,
	"idp_goals" text,
	"key_skills" text,
	"attacking" text,
	"defending" text,
	"transition_defending" text,
	"transition_attacking" text
);
--> statement-breakpoint
CREATE TABLE "ranking" (
	"id" serial PRIMARY KEY NOT NULL,
	"rank" integer NOT NULL,
	"player_id" integer NOT NULL,
	"added_by" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"count" integer DEFAULT 1,
	"sport_id" integer
);
--> statement-breakpoint
CREATE TABLE "refunds" (
	"id" serial PRIMARY KEY NOT NULL,
	"payment_id" integer NOT NULL,
	"refund_type" varchar(10) NOT NULL,
	"amount_refunded" numeric(10, 2) NOT NULL,
	"remaining_amount" numeric(10, 2) NOT NULL,
	"refund_by" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer,
	"coach_id" integer,
	"rating" numeric(3, 1),
	"title" varchar(100),
	"comment" varchar(5000),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"review_status" integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE "role" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"role" bigint,
	"role_name" varchar(100),
	"change_password" integer DEFAULT 0,
	"refund" integer DEFAULT 0,
	"monitor_activity" integer DEFAULT 0,
	"view_finance" integer DEFAULT 0,
	"access_ticket" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
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
CREATE TABLE "sports" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50),
	"display_order" integer,
	"is_removed" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "states" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"country_id" integer
);
--> statement-breakpoint
CREATE TABLE "suspendlog" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" varchar(20),
	"suspend_start_date" date,
	"suspend_end_date" date,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tab_last_seen" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"role" varchar(10) NOT NULL,
	"tab" varchar(20) NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL
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
	"is_deleted" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"suspend" integer DEFAULT 1 NOT NULL,
	"suspend_days" integer,
	"suspend_start_date" date,
	"suspend_end_date" date
);
--> statement-breakpoint
CREATE TABLE "ticket" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text NOT NULL,
	"assign_to" integer DEFAULT 0,
	"ticket_from" integer DEFAULT 0,
	"status" varchar DEFAULT 'Pending',
	"role" varchar,
	"message" text NOT NULL,
	"priority" varchar(20) DEFAULT 'Medium',
	"created_by" integer DEFAULT 0,
	"created_for" integer DEFAULT 0,
	"escalate" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ticket_assign" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"from_id" integer NOT NULL,
	"to_id" integer NOT NULL,
	"escalate" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"replied_by" text NOT NULL,
	"message" text NOT NULL,
	"status" varchar DEFAULT 'Pending',
	"created_at" timestamp DEFAULT now(),
	"file_name" text,
	"priority" varchar(20) DEFAULT 'Medium',
	"read" integer DEFAULT 0,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ticket_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"notes" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "unsubscribes" (
	"email" varchar(255) NOT NULL,
	"unsubscribe_token" varchar(64) NOT NULL,
	"unsubscribed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "userOrgStatus" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_user_id" integer,
	"enterprise_id" integer,
	"status" text DEFAULT 'Pending' NOT NULL,
	"text" text
);
--> statement-breakpoint
CREATE TABLE "user_consent_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"user_type" varchar(10) NOT NULL,
	"consent_type" varchar(20) NOT NULL,
	"action" varchar(10) NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_consents" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"user_type" varchar(10) NOT NULL,
	"terms_conditions" boolean DEFAULT false,
	"marketing_text" boolean DEFAULT false,
	"account_text" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"position_id" integer,
	CONSTRAINT "user_positions_unique" UNIQUE("user_id","position_id")
);
--> statement-breakpoint
CREATE TABLE "user_sports" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"sport_id" integer,
	"experience" text,
	"league" text,
	"team_name" varchar,
	"age_group" text,
	"birth_year" text,
	"image" text,
	"grade_level" varchar,
	"jersey" varchar,
	"dominant" json,
	CONSTRAINT "user_sport_unique" UNIQUE("user_id","sport_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"blockedCoachIds" text,
	"first_name" varchar,
	"last_name" varchar,
	"grade_level" varchar,
	"location" varchar,
	"birthday" date,
	"gender" varchar,
	"sport" integer,
	"parent_email" varchar,
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
	"height_unit" varchar(10) DEFAULT 'cm' NOT NULL,
	"weight" text,
	"weight_unit" varchar(10) DEFAULT 'kg' NOT NULL,
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
	"is_email_verified" boolean DEFAULT false,
	"last_login_attempt" timestamp,
	"blocked_time" timestamp,
	"no_of_attempts" integer DEFAULT 0,
	"tiktok" text,
	"is_deleted" integer DEFAULT 1 NOT NULL,
	"isCompletedProfile" boolean DEFAULT false,
	"suspend" integer DEFAULT 1 NOT NULL,
	"suspend_days" integer,
	"suspend_start_date" date,
	"suspend_end_date" date,
	"diamond" integer DEFAULT 0,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"foot" text,
	"sport_attributes" json,
	"is_under_16" boolean DEFAULT false,
	CONSTRAINT "users_parent_email_unique" UNIQUE("parent_email"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verified" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"verified_by" integer NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "video_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer,
	"coach_id" integer,
	"booking_id" integer,
	"amount" numeric,
	"original_amount" numeric,
	"status" varchar,
	"currency" varchar,
	"payment_info" text,
	"description" text,
	"intent_id" text,
	"charge_id" text,
	"is_deleted" boolean DEFAULT false,
	"company_amount" numeric,
	"commission_rate" numeric,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "waitlisted_players" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	CONSTRAINT "waitlisted_players_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "admin_payment_logs" ADD CONSTRAINT "admin_payment_logs_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_payment_logs" ADD CONSTRAINT "admin_payment_logs_admin_id_admin_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_position_id_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories_attributes" ADD CONSTRAINT "categories_attributes_categories_id_categories_id_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_teams" ADD CONSTRAINT "coach_teams_sport_sports_id_fk" FOREIGN KEY ("sport") REFERENCES "public"."sports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_teams" ADD CONSTRAINT "coach_teams_coach_id_coaches_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coaches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaches" ADD CONSTRAINT "coaches_sport_sports_id_fk" FOREIGN KEY ("sport") REFERENCES "public"."sports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_coupon" ADD CONSTRAINT "discount_coupon_coach_id_coaches_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coaches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_consents" ADD CONSTRAINT "parent_consents_player_id_users_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_positions" ADD CONSTRAINT "player_positions_sport_id_sports_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_sports_attributes" ADD CONSTRAINT "player_sports_attributes_sport_id_sports_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_under_coaches" ADD CONSTRAINT "player_under_coaches_player_id_users_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_under_coaches" ADD CONSTRAINT "player_under_coaches_coach_id_coaches_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coaches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_under_coaches" ADD CONSTRAINT "player_under_coaches_coach_team_id_coach_teams_id_fk" FOREIGN KEY ("coach_team_id") REFERENCES "public"."coach_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players_under_coach_teams" ADD CONSTRAINT "players_under_coach_teams_team_id_coach_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."coach_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players_under_coach_teams" ADD CONSTRAINT "players_under_coach_teams_player_id_users_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "positions" ADD CONSTRAINT "positions_sport_id_sports_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ranking" ADD CONSTRAINT "ranking_sport_id_sports_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_player_id_users_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_coach_id_coaches_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coaches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_notes" ADD CONSTRAINT "ticket_notes_ticket_id_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."ticket"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userOrgStatus" ADD CONSTRAINT "userOrgStatus_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_positions" ADD CONSTRAINT "user_positions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_positions" ADD CONSTRAINT "user_positions_position_id_player_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."player_positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sports" ADD CONSTRAINT "user_sports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sports" ADD CONSTRAINT "user_sports_sport_id_sports_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_sport_sports_id_fk" FOREIGN KEY ("sport") REFERENCES "public"."sports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "coaches_unique_idx" ON "coaches" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_unique_idx" ON "payments" USING btree ("player_id","coach_id","evaluation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "player_evaluation_player_status_updated_idx" ON "player_evaluation" USING btree ("player_id","status","updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "player_evaluation_coach_status_updated_idx" ON "player_evaluation" USING btree ("coach_id","status","updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "tab_last_seen_user_role_tab_idx" ON "tab_last_seen" USING btree ("user_id","role","tab");--> statement-breakpoint
CREATE UNIQUE INDEX "users_unique_idx" ON "users" USING btree ("email");