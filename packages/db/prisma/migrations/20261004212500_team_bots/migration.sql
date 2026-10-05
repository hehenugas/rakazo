CREATE TABLE "team_bots" (
  "id" TEXT NOT NULL,
  "spaceId" TEXT NOT NULL,
  "ownerUserId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "title" TEXT NOT NULL DEFAULT '',
  "description" TEXT NOT NULL DEFAULT '',
  "instructions" TEXT NOT NULL DEFAULT '',
  "color" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "team_bots_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "team_bot_members" (
  "id" TEXT NOT NULL,
  "teamBotId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'member',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "team_bot_members_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "bots" ADD COLUMN "teamBotId" TEXT;

CREATE INDEX "team_bots_spaceId_updatedAt_idx" ON "team_bots"("spaceId", "updatedAt");
CREATE INDEX "team_bots_ownerUserId_idx" ON "team_bots"("ownerUserId");
CREATE UNIQUE INDEX "team_bot_members_teamBotId_userId_key" ON "team_bot_members"("teamBotId", "userId");
CREATE INDEX "team_bot_members_userId_createdAt_idx" ON "team_bot_members"("userId", "createdAt");
CREATE INDEX "bots_teamBotId_idx" ON "bots"("teamBotId");
CREATE UNIQUE INDEX "bots_teamBotId_userId_key" ON "bots"("teamBotId", "userId");

ALTER TABLE "team_bots"
ADD CONSTRAINT "team_bots_spaceId_fkey"
FOREIGN KEY ("spaceId") REFERENCES "spaces"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "team_bot_members"
ADD CONSTRAINT "team_bot_members_teamBotId_fkey"
FOREIGN KEY ("teamBotId") REFERENCES "team_bots"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "bots"
ADD CONSTRAINT "bots_teamBotId_fkey"
FOREIGN KEY ("teamBotId") REFERENCES "team_bots"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
