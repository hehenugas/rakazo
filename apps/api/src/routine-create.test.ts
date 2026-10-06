import { RPCHandler } from "@orpc/server/fetch";
import type { Actor, PrismaClient } from "@rakazo/contracts";
import { describe, expect, it, vi } from "vitest";
import { createRouter, type RouterDeps } from "./router.js";

describe("routines.create", () => {
  const actor = {
    spaceId: "space-1",
    userId: "user-1",
    email: "user@rakazo.test",
    isDeploymentOwner: true,
  } satisfies Actor;

  function fixture(options?: { otherMembersRoutine?: boolean }) {
    const routineRow = {
      id: "routine-1",
      botId: "bot-1",
      spaceId: "space-1",
      userId: "user-1",
      name: "Morning digest",
      prompt: "Post the morning digest here.",
      crons: ["@once"],
      timezone: "America/New_York",
      active: true,
      notify: true,
      webhookEnabled: false,
      githubEnabled: false,
      messageProvider: null,
      lastRunAt: null,
      nextRunAt: new Date(Date.now() + 60_000),
      createdAt: new Date("2026-10-06T00:00:00.000Z"),
    };
    const createdBlocks: unknown[] = [];
    const tx = {
      thread: { update: vi.fn().mockResolvedValue({ nextMessageSeq: 3, nextEventSeq: 5 }) },
      message: {
        create: vi.fn(async ({ data }: { data: { blocks: unknown } }) => {
          createdBlocks.push(data.blocks);
          return { id: "message-1" };
        }),
      },
      event: { create: vi.fn(async () => ({ seq: 4, threadId: "thread-1" })) },
      run: { findUnique: vi.fn().mockResolvedValue(null) },
      task: { create: vi.fn() },
    };
    const enqueue = vi.fn(async () => undefined);
    const routineCreate = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
      ...routineRow,
      ...Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)),
    }));
    const prisma = {
      routine: {
        create: routineCreate,
        findFirst: vi.fn(async () =>
          options?.otherMembersRoutine ? { ...routineRow, userId: "user-2" } : routineRow,
        ),
        update: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
          ...routineRow,
          ...Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)),
        })),
        delete: vi.fn(async () => routineRow),
      },
      bot: {
        findFirst: vi
          .fn()
          .mockResolvedValue({ id: "bot-1", thread: { id: "thread-1" }, computer: null }),
      },
      $transaction: vi.fn(async (run: (client: typeof tx) => unknown) => run(tx)),
    } as unknown as PrismaClient;
    const deps = {
      prisma,
      env: { sandboxProvider: "fake" },
      events: { append: vi.fn(async () => undefined) },
      jobs: { enqueue, cancel: vi.fn(async () => undefined) },
    } as unknown as RouterDeps;
    const handler = new RPCHandler(createRouter(deps));
    const call = (body: Record<string, unknown>, path = "routines/create") =>
      handler
        .handle(
          new Request(`http://127.0.0.1/rpc/${path}`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ json: body }),
          }),
          { prefix: "/rpc", context: { actor } },
        )
        .then(async ({ response }) => ({ status: response.status, body: await response.json() }));
    return { createdBlocks, enqueue, routineCreate, prisma, call };
  }

  it("arms an editor-created one-shot from runAt and enqueues the wakeup", async () => {
    const { enqueue, routineCreate, call } = fixture();
    const runAt = new Date(Date.now() + 60_000).toISOString();
    const { status, body } = await call({
      botId: "bot-1",
      name: "Morning digest",
      prompt: "Post the morning digest here.",
      crons: ["@once"],
      timezone: "America/New_York",
      active: true,
      notify: true,
      webhookEnabled: false,
      githubEnabled: false,
      messageProvider: null,
      runAt,
    });
    expect(status).toBe(200);
    expect(routineCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ nextRunAt: expect.any(Date) }) }),
    );
    expect((body as { json: { nextRunAt: string } }).json.nextRunAt).toBeTruthy();
    expect(enqueue).toHaveBeenCalledOnce();
  });

  it("refuses an active one-shot without a run time", async () => {
    const { enqueue, routineCreate, call } = fixture();
    const { status, body } = await call({
      botId: "bot-1",
      name: "Morning digest",
      prompt: "Post the morning digest here.",
      crons: ["@once"],
      timezone: "UTC",
      active: true,
      notify: true,
      webhookEnabled: false,
      githubEnabled: false,
      messageProvider: null,
    });
    expect(status).toBe(400);
    expect((body as { json: { message: string } }).json.message).toContain("run time");
    expect(routineCreate).not.toHaveBeenCalled();
    expect(enqueue).not.toHaveBeenCalled();
  });

  it("refuses a run time on a recurring routine", async () => {
    const { call } = fixture();
    const { status } = await call({
      botId: "bot-1",
      name: "Digest",
      prompt: "Post the digest.",
      crons: ["0 9 * * 1-5"],
      timezone: "UTC",
      active: true,
      notify: true,
      webhookEnabled: false,
      githubEnabled: false,
      messageProvider: null,
      runAt: new Date(Date.now() + 60_000).toISOString(),
    });
    expect(status).toBe(400);
  });

  it("confirms creation with a card carrying instruction, schedule, timezone, and next run", async () => {
    const { createdBlocks, call } = fixture();
    const { status } = await call({
      botId: "bot-1",
      name: "Morning digest",
      prompt: "Post the morning digest here.",
      crons: ["0 8 * * 1-5"],
      timezone: "America/New_York",
      active: true,
      notify: true,
      webhookEnabled: false,
      githubEnabled: false,
      messageProvider: null,
    });
    expect(status).toBe(200);
    expect(createdBlocks).toHaveLength(1);
    const block = (createdBlocks[0] as Array<{ kind: string; lines?: Array<{ k: string }> }>)[0];
    expect(block.kind).toBe("card");
    const keys = (block.lines ?? []).map((line) => line.k);
    expect(keys).toEqual(["Routine", "Instruction", "When", "Timezone", "Next run"]);
  });
});

describe("team bot routine isolation", () => {
  const actor = {
    spaceId: "space-1",
    userId: "user-1",
    email: "user@rakazo.test",
    isDeploymentOwner: true,
  } satisfies Actor;

  function fixture() {
    // The real query filters on actor.userId, so a routine created by another
    // member (user-2) is invisible: the mock models the database by returning
    // null for this actor.
    const findFirst = vi.fn(async () => null);
    const prisma = {
      routine: { findFirst, update: vi.fn(), delete: vi.fn() },
      bot: {
        findFirst: vi
          .fn()
          .mockResolvedValue({ id: "bot-1", thread: { id: "thread-1" }, computer: null }),
      },
    } as unknown as PrismaClient;
    const handler = new RPCHandler(
      createRouter({
        prisma,
        env: { sandboxProvider: "fake" },
        events: { append: vi.fn(async () => undefined) },
        jobs: { enqueue: vi.fn(async () => undefined), cancel: vi.fn(async () => undefined) },
      } as unknown as RouterDeps),
    );
    const call = (path: string, body: Record<string, unknown>) =>
      handler
        .handle(
          new Request(`http://127.0.0.1/rpc/${path}`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ json: body }),
          }),
          { prefix: "/rpc", context: { actor } },
        )
        .then(async ({ response }) => ({ status: response.status }));
    return { findFirst, call };
  }

  it("scopes update to the actor who created the routine", async () => {
    const { findFirst, call } = fixture();
    const { status } = await call("routines/update", {
      routineId: "routine-t1",
      active: false,
    });
    expect(status).toBe(404);
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: "user-1" }),
      }),
    );
  });

  it("scopes history to the actor who created the routine", async () => {
    const { findFirst, call } = fixture();
    const { status } = await call("routines/history", { routineId: "routine-t1" });
    expect(status).toBe(404);
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: "user-1" }),
      }),
    );
  });
});
