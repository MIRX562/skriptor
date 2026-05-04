ALTER TABLE "segments" DROP COLUMN "speaker";--> statement-breakpoint
ALTER TABLE "segments" ADD COLUMN "speaker_index" integer;--> statement-breakpoint
ALTER TABLE "transcriptions" ADD COLUMN "speakers" jsonb;
