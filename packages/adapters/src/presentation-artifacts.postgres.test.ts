import { randomUUID } from "node:crypto";
import type { ArtifactStore } from "@rakazo/adapter-kit";
import { DECK_MIME } from "@rakazo/core";
import { createDb, type PrismaClient } from "@rakazo/db";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { saveDeckArtifact } from "./presentation-artifacts.js";

const describePostgres =
  process.env.VERIFY_DATABASE && process.env.DATABASE_URL ? describe.sequential : describe.skip;

function memoryStore(): ArtifactStore & { objects: Map<string, Uint8Array> } {
  const objects = new Map<string, Uint8Array>();
  return {
    objects,
    put: async ({ bytes }: { bytes: Uint8Array }) => {
      const id = randomUUID();
      objects.set(id, bytes);
      return { id };
    },
    get: async (id: string) => objects.get(id)!,
    remove: async (id: string) => void objects.delete(id),
  } as unknown as ArtifactStore & { objects: Map<string, Uint8Array> };
}

describePostgres("deck artifacts (PostgreSQL)", () => {
  let db: ReturnType<typeof createDb>;
  let prisma: PrismaClient;
  const owners: string[] = [];

  beforeAll(() => {
    db = createDb(process.env.DATABASE_URL!);
    prisma = db.prisma;
  });
  afterAll(async () => {
    if (!db) return;
    await prisma.organization.deleteMany({ where: { id: { in: owners } } });
    await prisma.user.deleteMany({ where: { id: { in: owners } } });
    await db.prisma.$disconnect();
    await db.pool.end();
  });

  async function setup() {
    const id = randomUUID();
    owners.push(id);
    await prisma.user.create({
      data: { id, name: "Deck test", email: `${id}@example.test`, emailVerified: true },
    });
    await prisma.organization.create({
      data: { id, name: "Deck test", slug: id, createdAt: new Date() },
    });
    await prisma.space.create({
      data: { id, organizationId: id, name: "Deck test", isDefault: true },
    });
    await prisma.member.create({
      data: { id, organizationId: id, userId: id, role: "owner", createdAt: new Date() },
    });
    const bot = await prisma.bot.create({
      data: { spaceId: id, userId: id, name: "Maker", color: "test-color" },
    });
    const thread = await prisma.thread.create({ data: { spaceId: id, userId: id, botId: bot.id } });
    const task = await prisma.task.create({
      data: {
        spaceId: id,
        userId: id,
        botId: bot.id,
        threadId: thread.id,
        prompt: "deck",
        status: "running",
      },
    });
    const run = await prisma.run.create({
      data: {
        spaceId: id,
        userId: id,
        botId: bot.id,
        threadId: thread.id,
        taskId: task.id,
        status: "running",
        trigger: "user",
      },
    });
    return { id, bot, run };
  }

  const deck = (title: string, slides = 2) => ({
    title,
    slides: Array.from({ length: slides }, (_, i) => ({ title: `Slide ${i + 1}`, bullets: ["x"] })),
  });

  it("stores a deck owned by the run's user and returns a chat card", async () => {
    const s = await setup();
    const artifacts = memoryStore();
    const saved = await saveDeckArtifact(
      { prisma, artifacts },
      {
        spaceId: s.id,
        userId: s.id,
        botId: s.bot.id,
        runId: s.run.id,
        operationId: "op-1",
        deck: deck("Launch plan"),
      },
    );
    const row = await prisma.artifact.findUniqueOrThrow({ where: { id: saved.artifactId } });
    expect(row).toMatchObject({
      spaceId: s.id,
      userId: s.id,
      botId: s.bot.id,
      mimeType: DECK_MIME,
      name: "launch-plan.deck.json",
      version: 1,
    });
    expect(saved.block).toMatchObject({ kind: "deck", title: "Launch plan", slideCount: 2 });
    const stored = JSON.parse(new TextDecoder().decode(artifacts.objects.get(row.storageKey)!));
    expect(stored.slides).toHaveLength(2);
  });

  it("saving the same title again makes a new version of the same artifact", async () => {
    const s = await setup();
    const artifacts = memoryStore();
    const input = {
      spaceId: s.id,
      userId: s.id,
      botId: s.bot.id,
      runId: s.run.id,
      operationId: "op",
    };
    const first = await saveDeckArtifact(
      { prisma, artifacts },
      { ...input, deck: deck("Plan", 2) },
    );
    const second = await saveDeckArtifact(
      { prisma, artifacts },
      { ...input, deck: deck("Plan", 3) },
    );

    expect(second.version).toBe(2);
    const rows = await prisma.artifact.findMany({
      where: { spaceId: s.id, name: "plan.deck.json" },
      orderBy: { version: "asc" },
    });
    expect(rows.map((row) => row.version)).toEqual([1, 2]);
    expect(rows[1]?.rootArtifactId).toBe(rows[0]?.rootArtifactId ?? rows[0]?.id);
    expect(first.artifactId).not.toBe(second.artifactId);
  });

  it("does not leave an orphaned object when the row cannot be written", async () => {
    const s = await setup();
    const artifacts = memoryStore();
    await expect(
      saveDeckArtifact(
        { prisma, artifacts },
        {
          spaceId: s.id,
          userId: s.id,
          botId: "missing-bot",
          runId: s.run.id,
          operationId: "op",
          deck: deck("Broken"),
        },
      ),
    ).rejects.toThrow();
    expect(artifacts.objects.size).toBe(0);
  });
});
