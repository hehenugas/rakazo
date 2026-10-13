-- A Project records the run that started it; child status stays derived from task runs.
ALTER TABLE "projects" ADD COLUMN "orchestratorRunId" TEXT;
ALTER TABLE "projects"
  ADD CONSTRAINT "projects_orchestratorRunId_fkey"
  FOREIGN KEY ("orchestratorRunId") REFERENCES "runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "projects_status_updatedAt_idx" ON "projects"("status", "updatedAt");
