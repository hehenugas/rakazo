-- Voice memo transcript with optional segment timing, kept beside the audio artifact.
ALTER TABLE "artifacts" ADD COLUMN "transcript" JSONB;
