-- Team Bot publish lifecycle. Existing team bots were created under the
-- auto-grant semantics, so they keep working for current members.
ALTER TABLE "team_bots" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'draft';
UPDATE "team_bots" SET "status" = 'published';
