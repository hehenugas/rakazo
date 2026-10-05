CREATE TABLE "projects" (
  "id" TEXT NOT NULL,
  "spaceId" TEXT NOT NULL,
  "botId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "objective" TEXT NOT NULL,
  "plan" JSONB NOT NULL DEFAULT '[]',
  "status" TEXT NOT NULL DEFAULT 'planned',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "tasks" ADD COLUMN "projectId" TEXT;

CREATE INDEX "projects_spaceId_botId_userId_status_updatedAt_idx"
ON "projects"("spaceId", "botId", "userId", "status", "updatedAt");

CREATE INDEX "tasks_projectId_createdAt_idx" ON "tasks"("projectId", "createdAt");

ALTER TABLE "projects"
ADD CONSTRAINT "projects_spaceId_fkey"
FOREIGN KEY ("spaceId") REFERENCES "spaces"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "projects"
ADD CONSTRAINT "projects_botId_fkey"
FOREIGN KEY ("botId") REFERENCES "bots"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tasks"
ADD CONSTRAINT "tasks_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "projects"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
