ALTER TABLE "spaces" ADD COLUMN "mainBotId" TEXT;

CREATE INDEX "spaces_mainBotId_idx" ON "spaces"("mainBotId");

ALTER TABLE "spaces"
ADD CONSTRAINT "spaces_mainBotId_fkey"
FOREIGN KEY ("mainBotId") REFERENCES "bots"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
