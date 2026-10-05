import { RPCHandler } from "@orpc/server/fetch";
import type { Actor } from "@rakazo/contracts";
import type { PrismaClient } from "@rakazo/db";
import { describe, expect, it, vi } from "vitest";
import { createRouter, type RouterDeps } from "./router.js";

function libraryDeps() {
  const prisma = {
    bot: { findFirst: vi.fn() },
    artifact: { findMany: vi.fn() },
    $queryRaw: vi.fn().mockResolvedValue([]),
    deploymentSettings: { findUnique: vi.fn().mockResolvedValue(null) },
  } as unknown as PrismaClient;
  const deps = {
    prisma,
    env: {
      defaultProvider: "fake",
      defaultModel: "fake-model",
      webOrigin: "http://127.0.0.1:5173",
      screenProxySecret: "fake-test-secret",
      sandboxProvider: "fake",
    },
    dataDir: "/tmp/rakazo-library-test",
  } as unknown as RouterDeps;
  const actor = {
    spaceId: "workspace-1",
    userId: "user-1",
    email: "user@rakazo.test",
    isDeploymentOwner: true,
  } satisfies Actor;
  return { prisma, actor, handler: new RPCHandler(createRouter(deps)) };
}

function rpc(handler: RPCHandler, actor: Actor, path: string, input: unknown) {
  return handler.handle(
    new Request(`http://127.0.0.1/rpc/${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ json: input }),
    }),
    { prefix: "/rpc", context: { actor } },
  );
}

describe("artifacts.listSpace (Bot-scoped Library)", () => {
  it("refuses a Library scoped to a Bot the actor does not own", async () => {
    const { prisma, actor, handler } = libraryDeps();
    prisma.bot.findFirst = vi.fn().mockResolvedValue(null);

    const { response } = await rpc(handler, actor, "artifacts/listSpace", {
      botId: "bot-foreign",
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(prisma.artifact.findMany).not.toHaveBeenCalled();
  });

  it("lists the owning actor's space artifacts and pages them", async () => {
    const { prisma, actor, handler } = libraryDeps();
    prisma.bot.findFirst = vi.fn().mockResolvedValue({
      id: "bot-1",
      thread: { id: "thread-1" },
      computer: null,
    });
    const createdAt = new Date("2026-01-01T00:00:00Z");
    prisma.$queryRaw = vi.fn().mockResolvedValue([
      {
        id: "artifact-1",
        familyId: "artifact-1",
        botId: "bot-1",
        groupId: "group-1",
        runId: null,
        name: "Report",
        description: null,
        mimeType: "application/pdf",
        size: 10,
        version: 1,
        createdAt,
        versionCount: 2,
      },
    ]);

    const { response } = await rpc(handler, actor, "artifacts/listSpace", {
      botId: "bot-1",
      limit: 60,
    });

    expect(response.status).toBe(200);
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    const body = (await response.json()) as {
      json: { items: Array<Record<string, unknown>>; nextCursor: string | null };
    };
    expect(body.json.items).toHaveLength(1);
    expect(body.json.items[0]).toMatchObject({
      id: "artifact-1",
      groupId: "group-1",
      versionCount: 2,
    });
    expect(body.json.nextCursor).toBeNull();
  });
});
