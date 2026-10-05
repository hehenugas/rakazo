import { RPCHandler } from "@orpc/server/fetch";
import type { Actor } from "@rakazo/contracts";
import type { PrismaClient } from "@rakazo/db";
import { describe, expect, it, vi } from "vitest";
import { createRouter, type RouterDeps } from "./router.js";

function teamDeps() {
  const prisma = {
    bot: { findFirst: vi.fn() },
    teamBot: { findMany: vi.fn().mockResolvedValue([]), count: vi.fn().mockResolvedValue(0) },
    teamBotMember: { findFirst: vi.fn(), createMany: vi.fn().mockResolvedValue({}) },
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
  it("lists only Team Bots the actor is a member of", async () => {
    const { prisma, actor, handler } = teamDeps();
    await rpc(handler, actor, "teamBots/list", {});
    expect(prisma.teamBot.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          spaceId: "workspace-1",
          members: { some: { userId: "user-1" } },
        }),
      }),
    );
  });

  it("refuses to open a Team Bot the actor is not a member of", async () => {
    const { prisma, actor, handler } = teamDeps();
    prisma.teamBotMember.findFirst = vi.fn().mockResolvedValue(null);

    const { response } = await rpc(handler, actor, "teamBots/open", {
      teamBotId: "team-foreign",
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(prisma.bot.findFirst).not.toHaveBeenCalled();
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
