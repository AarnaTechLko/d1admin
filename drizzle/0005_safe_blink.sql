ALTER TABLE "ticket" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "ticket" ALTER COLUMN "id" SET DEFAULT nextval('ticket_id_seq');