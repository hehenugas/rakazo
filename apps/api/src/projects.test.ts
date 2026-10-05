import { RPCHandler } from "@orpc/server/fetch";
import type { Actor } from "@rakazo/contracts";
import type { PrismaClient } from "@rakazo/db";
import { describe, expect, it, vi } from "vitest";
import { createRouter, type RouterDeps } from "./router.js";

function projectsDeps() {
  const prisma = {
    bot: { findFirst: vi.fn() },
    space: { update: vi.fn().mockResolvedValue({}) },
    project: {
      findFirst: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      update: vi.fn(),
      create: vi.fn(),
    },
    message: { findFirst: vi.fn(), update: vi.fn().mockResolvedValue({}) },
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
    dataDir: "/tmp/rakazo-projects-test",
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

describe("spaces.setMainBot", () => {
  it("rejects a Main Bot that is not an active Bot in the actor's space", async () => {
    const { prisma, actor, handler } = projectsDeps();
    prisma.bot.findFirst = vi.fn().mockResolvedValue(null);

    const { response } = await rpc(handler, actor, "spaces/setMainBot", {
      botId: "bot-foreign",
    });

    expect(response.status).toBe(400);
    expect(prisma.space.update).not.toHaveBeenCalled();
  });

  it("persists the chosen Main Bot and clears it with null", async () => {
    const { prisma, actor, handler } = projectsDeps();
    prisma.bot.findFirst = vi
      .fn()
      .mockResolvedValueOnce({ id: "bot-1" })
      .mockResolvedValueOnce({ id: "bot-1" });

    const set = await rpc(handler, actor, "spaces/setMainBot", { botId: "bot-1" });
    expect(set.response.status).toBe(200);
    await expect(set.response.json()).resolves.toEqual({ json: { mainBotId: "bot-1" } });
    expect(prisma.space.update).toHaveBeenCalledWith({
      where: { id: "workspace-1" },
      data: { mainBotId: "bot-1" },
    });

    const clear = await rpc(handler, actor, "spaces/setMainBot", { botId: null });
    expect(clear.response.status).toBe(200);
    expect(prisma.space.update).toHaveBeenLastCalledWith({
      where: { id: "workspace-1" },
      data: { mainBotId: null },
    });
    // Clearing must not require a bot lookup.
    expect(prisma.bot.findFirst).toHaveBeenCalledTimes(1);
  });
});

describe("projects", () => {
  it("hides projects outside the actor's space or user scope", async () => {
    const { prisma, actor, handler } = projectsDeps();
    prisma.project.findFirst = vi.fn().mockResolvedValue(null);

    const { response } = await rpc(handler, actor, "projects/get", {
      projectId: "project-foreign",
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(prisma.project.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ spaceId: "workspace-1", userId: "user-1" }),
      }),
    );
  });

  it("stamps completedAt when a project completes and clears it on reopen", async () => {
    const { prisma, actor, handler } = projectsDeps();
    const row = {
      id: "project-1",
      botId: "bot-1",
      title: "Launch",
      objective: "Ship it",
      plan: ["step"],
      status: "planned",
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
      completedAt: null,
      tasks: [],
    };
    prisma.project.findFirst = vi.fn().mockResolvedValue({ id: "project-1", status: "planned" });
    prisma.project.update = vi.fn().mockResolvedValue(row);

    const complete = await rpc(handler, actor, "projects/update", {
      projectId: "project-1",
      status: "completed",
    });
    expect(complete.response.status).toBe(200);
    expect(prisma.project.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "project-1" },
        data: expect.objectContaining({ status: "completed", completedAt: expect.any(Date) }),
      }),
    );

    row.status = "completed";
    prisma.project.findFirst = vi.fn().mockResolvedValue({ id: "project-1", status: "completed" });
    const reopen = await rpc(handler, actor, "projects/update", {
      projectId: "project-1",
      status: "running",
    });
    expect(reopen.response.status).toBe(200);
    expect(prisma.project.update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "running", completedAt: null }),
      }),
    );
  });

  it("rejects project statuses outside the allowed set", async () => {
    const { prisma, actor, handler } = projectsDeps();

    const { response } = await rpc(handler, actor, "projects/update", {
      projectId: "project-1",
      status: "exploded",
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(prisma.project.update).not.toHaveBeenCalled();
  });
});

describe("threads.updateDraftAction", () => {
  function botTargetPrisma(prisma: PrismaClient) {
    prisma.bot.findFirst = vi.fn().mockResolvedValue({
      id: "bot-1",
      thread: { id: "thread-1" },
      computer: null,
    });
  }

  it("refuses to edit a draft on a message the actor cannot see", async () => {
    const { prisma, actor, handler } = projectsDeps();
    botTargetPrisma(prisma);
    prisma.message.findFirst = vi.fn().mockResolvedValue(null);

    const { response } = await rpc(handler, actor, "threads/updateDraftAction", {
      botId: "bot-1",
      messageId: "message-foreign",
      draftId: "draft-1",
      fields: [{ key: "to", label: "To", value: "a@b.test" }],
      status: "submitted",
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(prisma.message.update).not.toHaveBeenCalled();
  });

  it("rewrites only the matching draft block and reports ok", async () => {
    const { prisma, actor, handler } = projectsDeps();
    botTargetPrisma(prisma);
    const block = {
      kind: "draft_action",
      draftId: "draft-1",
      provider: "gmail",
      action: "send_email",
      title: "Intro",
      fields: [{ key: "to", label: "To", value: "old@b.test", multiline: false }],
      status: "draft",
    };
    prisma.message.findFirst = vi.fn().mockResolvedValue({ id: "message-1", blocks: [block] });

    const { response } = await rpc(handler, actor, "threads/updateDraftAction", {
      botId: "bot-1",
      messageId: "message-1",
      draftId: "draft-1",
      fields: [{ key: "to", label: "To", value: "new@b.test" }],
      status: "submitted",
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ json: { ok: true } });
    expect(prisma.message.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "message-1" },
        data: {
          blocks: [
            expect.objectContaining({
              draftId: "draft-1",
              status: "submitted",
              fields: [{ key: "to", label: "To", value: "new@b.test" }],
            }),
          ],
        },
      }),
    );
  });
});
