CREATE TABLE "artifact_deliveries" (
  "id" TEXT NOT NULL,
  "spaceId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "artifactId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "connectionId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "connectionSnapshot" CHAR(64) NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "externalFileId" TEXT,
  "externalUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "artifact_deliveries_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "artifact_deliveries_artifactId_fkey"
    FOREIGN KEY ("artifactId") REFERENCES "artifacts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "artifact_deliveries_connectionId_fkey"
    FOREIGN KEY ("connectionId") REFERENCES "connections"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "artifact_deliveries_idempotencyKey_key"
  ON "artifact_deliveries"("idempotencyKey");

CREATE UNIQUE INDEX "artifact_deliveries_scope_key"
  ON "artifact_deliveries"("spaceId", "userId", "artifactId", "version", "connectionId", "connectionSnapshot");

CREATE INDEX "artifact_deliveries_space_user_artifact_idx"
  ON "artifact_deliveries"("spaceId", "userId", "artifactId");
