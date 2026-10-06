import { RPCHandler } from "@orpc/server/fetch";
import type { Actor } from "@rakazo/contracts";
import type { PrismaClient } from "@rakazo/db";
import { describe, expect, it, vi } from "vitest";
import { createRouter, type RouterDeps } from "./router.js";

function teamDeps() {
  const prisma = {
    bot: { findFirst: vi.fn() },
    teamBot: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      update: vi.fn(),
      delete: vi.fn(),
    },
    teamBotMember: {
      findFirst: vi.fn(),
      createMany: vi.fn().mockResolvedValue({}),
      create: vi.fn(),
    },
    spaceMember: { findMany: vi.fn().mockResolvedValue([]) },
    routine: { findMany: vi.fn().mockResolvedValue([]) },
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
    dataDir: "/tmp/rakazo-team-bots-test",
  } as unknown as RouterDeps;
  const actor = {
    spaceId: "workspace-1",
    userId: "user-1",
    email: "user@rakazo.test",
    isDeploymentOwner: true,
  } satisfies Actor;
  return { prisma, deps, actor, handler: new RPCHandler(createRouter(deps)) };
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

describe("teamBots membership scoping", () => {
  it("lists owner drafts plus published team bots only", async () => {
    const { prisma, actor, handler } = teamDeps();
    await rpc(handler, actor, "teamBots/list", {});
    expect(prisma.teamBot.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          spaceId: "workspace-1",
          OR: [{ ownerUserId: "user-1" }, { status: "published" }],
        }),
      }),
    );
  });

  it("refuses to open an unseen team bot that is not published", async () => {
    const { prisma, actor, handler } = teamDeps();
    prisma.teamBot.findFirst = vi.fn().mockResolvedValue({
      id: "team-unpublished",
      spaceId: "workspace-1",
      ownerUserId: "user-2",
      status: "unpublished",
      members: [],
    });

    const { response } = await rpc(handler, actor, "teamBots/open", {
      teamBotId: "team-unpublished",
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(prisma.bot.findFirst).not.toHaveBeenCalled();
  });

  it("refuses to open someone else's draft", async () => {
    const { prisma, actor, handler } = teamDeps();
    prisma.teamBot.findFirst = vi.fn().mockResolvedValue({
      id: "team-draft",
      spaceId: "workspace-1",
      ownerUserId: "user-2",
      status: "draft",
      members: [],
    });

    const { response } = await rpc(handler, actor, "teamBots/open", {
      teamBotId: "team-draft",
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(prisma.teamBotMember.create).not.toHaveBeenCalled();
  });

  it("gates shared-setup mutations to the owner", async () => {
    const { prisma, actor, handler } = teamDeps();
    prisma.teamBot.findFirst = vi.fn().mockResolvedValue(null);

    for (const [path, input] of [
      ["teamBots/update", { teamBotId: "team-1", name: "Renamed" }],
      ["teamBots/publish", { teamBotId: "team-1" }],
      ["teamBots/unpublish", { teamBotId: "team-1" }],
      ["teamBots/remove", { teamBotId: "team-1" }],
    ] as const) {
      const { response } = await rpc(handler, actor, path, input);
      expect(response.status).toBeGreaterThanOrEqual(400);
    }
    expect(prisma.teamBot.update).not.toHaveBeenCalled();
    expect(prisma.teamBot.delete).not.toHaveBeenCalled();
  });

  it("publishes and unpublishes as the owner", async () => {
    const { prisma, actor, handler } = teamDeps();
    const row = {
      id: "team-1",
      spaceId: "workspace-1",
      ownerUserId: "user-1",
      name: "Research crew",
      title: "",
      description: "",
      instructions: "",
      color: "ink",
      status: "draft",
      createdAt: new Date("2026-10-06T00:00:00.000Z"),
      updatedAt: new Date("2026-10-06T00:00:00.000Z"),
    };
    prisma.teamBot.findFirst = vi.fn().mockResolvedValue(row);
    prisma.teamBot.update = vi.fn(async ({ data }: { data: { status: string } }) => ({
      ...row,
      status: data.status,
    }));

    const published = await rpc(handler, actor, "teamBots/publish", { teamBotId: "team-1" });
    expect(published.response.status).toBe(200);
    expect(prisma.teamBot.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "published" } }),
    );

    const unpublished = await rpc(handler, actor, "teamBots/unpublish", { teamBotId: "team-1" });
    expect(unpublished.response.status).toBe(200);
    expect(prisma.teamBot.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "unpublished" } }),
    );
  });

  it("propagates shared-setup changes to every member instance", async () => {
    const { prisma, actor, handler } = teamDeps();
    const row = {
      id: "team-1",
      spaceId: "workspace-1",
      ownerUserId: "user-1",
      name: "Research crew",
      title: "",
      description: "",
      instructions: "old instructions",
      color: "ink",
      status: "published",
      createdAt: new Date("2026-10-06T00:00:00.000Z"),
      updatedAt: new Date("2026-10-06T00:00:00.000Z"),
    };
    prisma.teamBot.findFirst = vi.fn().mockResolvedValue(row);
    prisma.teamBot.update = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
      ...row,
      ...data,
    }));
    prisma.bot = { ...prisma.bot, updateMany: vi.fn().mockResolvedValue({ count: 2 }) };
    prisma.$transaction = vi.fn(
      async (run: (tx: { teamBot: { update: unknown }; bot: { updateMany: unknown } }) => unknown) =>
        run({
          teamBot: { update: prisma.teamBot.update },
          bot: { updateMany: prisma.bot.updateMany },
        }),
    );

    const { response } = await rpc(handler, actor, "teamBots/update", {
      teamBotId: "team-1",
      instructions: "new instructions",
    });

    expect(response.status).toBe(200);
    expect(prisma.teamBot.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { instructions: "new instructions" } }),
    );
    expect(prisma.bot.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { teamBotId: "team-1" },
        data: { instructions: "new instructions" },
      }),
    );
  });
});

describe("export.template redaction", () => {
  it("exports only the whitelisted bot and routine fields", async () => {
    const { prisma, actor, handler } = teamDeps();
    prisma.bot.findFirst = vi.fn().mockResolvedValue({
      id: "bot-1",
      thread: { id: "thread-1" },
      computer: null,
      name: "Chief",
      title: "Lead",
      description: "desc",
      instructions: "be helpful",
      color: "#000000",
      memoryScope: "shared",
      modelProvider: "openai-compatible",
      modelId: "offline-fixture",
      thinkingLevel: "medium",
      // Fields that must NOT leak into the template:
      spawnKey: "onboarding:first",
      teamBotId: null,
      webhookConfigured: true,
    });
    prisma.routine.findMany = vi.fn().mockResolvedValue([
      {
        name: "digest",
        prompt: "write the digest",
        crons: ["0 9 * * *"],
        timezone: "UTC",
        active: true,
        notify: true,
        webhookEnabled: false,
        githubEnabled: false,
        messageProvider: null,
        // Fields that must NOT leak into the template:
        id: "routine-1",
        userId: "user-1",
        lastRunAt: new Date(),
      },
    ]);

    const { response } = await rpc(handler, actor, "export/template", { botId: "bot-1" });

    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      json: {
        version: number;
        bot: Record<string, unknown>;
        routines: Array<Record<string, unknown>>;
      };
    };
    expect(body.json.version).toBe(1);
    expect(Object.keys(body.json.bot).sort()).toEqual(
      [
        "color",
        "computerMode",
        "description",
        "instructions",
        "memoryScope",
        "modelId",
        "modelProvider",
        "name",
        "thinkingLevel",
        "title",
      ].sort(),
    );
    expect(Object.keys(body.json.routines[0]).sort()).toEqual(
      [
        "active",
        "crons",
        "githubEnabled",
        "messageProvider",
        "name",
        "notify",
        "prompt",
        "timezone",
        "webhookEnabled",
      ].sort(),
    );
  });
});
