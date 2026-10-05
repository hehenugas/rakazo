import { RPCHandler } from "@orpc/server/fetch";
import type { Actor } from "@rakazo/contracts";
import type { PrismaClient } from "@rakazo/db";
import { describe, expect, it, vi } from "vitest";
import { createRouter, type RouterDeps } from "./router.js";

function mainBotDeps() {
  const prisma = {
    bot: { findFirst: vi.fn().mockResolvedValue({ id: "bot-1" }) },
    space: { update: vi.fn().mockResolvedValue({}) },
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
    dataDir: "/tmp/rakazo-main-bot-test",
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

describe("one-Main-Bot invariant", () => {
  it("keeps a single Main Bot per space: the column moves, never multiplies", async () => {
    const { prisma, actor, handler } = mainBotDeps();

    const first = await rpc(handler, actor, "spaces/setMainBot", { botId: "bot-1" });
    expect(first.response.status).toBe(200);
    const second = await rpc(handler, actor, "spaces/setMainBot", { botId: "bot-2" });
    expect(second.response.status).toBe(200);

    expect(prisma.space.update).toHaveBeenCalledTimes(2);
    expect(prisma.space.update).toHaveBeenLastCalledWith({
      where: { id: "workspace-1" },
      data: { mainBotId: "bot-2" },
    });
  });

  it("only accepts active Bots inside the actor's space as Main Bot", async () => {
    const { prisma, actor, handler } = mainBotDeps();
    // The lookup filters on spaceId and archivedAt — a foreign or archived bot
    // never matches, so the handler rejects before touching the space row.
    prisma.bot.findFirst = vi.fn().mockResolvedValue(null);
    const { response } = await rpc(handler, actor, "spaces/setMainBot", {
      botId: "bot-archived-elsewhere",
    });
    expect(response.status).toBe(400);
    expect(prisma.space.update).not.toHaveBeenCalled();
  });
});
