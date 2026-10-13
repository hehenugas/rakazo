import { randomUUID } from "node:crypto";
import type { JobPublisher } from "@rakazo/adapter-kit";
import type { MessageBlock } from "@rakazo/contracts";
import { createDb, type PrismaClient } from "@rakazo/db";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  acquireComputerExecutionLease,
  ComputerBusyError,
  releaseComputerExecutionLease,
} from "./computer-lifecycle.js";
import { reconcileProjects, retryProjectWork, startProjectTask } from "./project-orchestration.js";

const describePostgres =
  process.env.VERIFY_DATABASE && process.env.DATABASE_URL ? describe.sequential : describe.skip;

describePostgres("project orchestration (PostgreSQL)", () => {
  let db: ReturnType<typeof createDb>;
  let prisma: PrismaClient;
  const owners: string[] = [];
  const jobs = { enqueue: vi.fn().mockResolvedValue(undefined) } as unknown as JobPublisher;
  const events = { notify: vi.fn().mockResolvedValue(undefined) };
  const deps = () => ({ prisma, jobs, events });

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

  async function setup(projectOwner: "chief" | "helper" = "chief") {
    const id = randomUUID();
    owners.push(id);
    await prisma.user.create({
      data: { id, name: "Project test", email: `${id}@example.test`, emailVerified: true },
    });
    await prisma.organization.create({
      data: { id, name: "Project test", slug: id, createdAt: new Date() },
    });
    await prisma.space.create({
      data: { id, organizationId: id, name: "Project test", isDefault: true },
    });
    await prisma.member.create({
      data: { id, organizationId: id, userId: id, role: "owner", createdAt: new Date() },
    });
    const makeBot = async (name: string) => {
      const bot = await prisma.bot.create({
        data: { spaceId: id, userId: id, name, color: "test-color" },
      });
      const thread = await prisma.thread.create({
        data: { spaceId: id, userId: id, botId: bot.id },
      });
      return { id: bot.id, threadId: thread.id };
    };
    const chief = await makeBot("Chief");
    const helper = await makeBot("Helper");
    await prisma.space.update({ where: { id }, data: { mainBotId: chief.id } });
    const project = await prisma.project.create({
      data: {
        spaceId: id,
        userId: id,
        botId: projectOwner === "chief" ? chief.id : helper.id,
        title: "Launch plan",
        objective: "Ship it",
        status: "planned",
      },
    });
    return { id, chief, helper, project };
  }

  const scope = (s: Awaited<ReturnType<typeof setup>>) => ({
    id: s.project.id,
    spaceId: s.id,
    userId: s.id,
    botId: s.project.botId,
  });

  async function setLatestRun(taskId: string, status: string) {
    const run = await prisma.run.findFirstOrThrow({
      where: { taskId },
      orderBy: { createdAt: "desc" },
    });
    await prisma.run.update({ where: { id: run.id }, data: { status } });
    return run.id;
  }

  async function attentionMessages(threadId: string) {
    return prisma.message.findMany({
      where: { threadId, clientNonce: { startsWith: "attn:" } },
      orderBy: { createdAt: "asc" },
    });
  }

  it("starts a child as its own project_task run on the assignee's thread", async () => {
    const s = await setup();
    const started = await startProjectTask(deps(), scope(s), {
      prompt: "Draft the checklist",
      assignee: "helper",
    });
    expect(started).toMatchObject({ ok: true, botId: s.helper.id });
    if (!("ok" in started)) throw new Error("expected a started task");
    const run = await prisma.run.findUniqueOrThrow({ where: { id: started.runId } });
    expect(run).toMatchObject({
      trigger: "project_task",
      status: "queued",
      threadId: s.helper.threadId,
      botId: s.helper.id,
    });
    const task = await prisma.task.findUniqueOrThrow({ where: { id: started.taskId } });
    expect(task.projectId).toBe(s.project.id);
    expect((await prisma.project.findUniqueOrThrow({ where: { id: s.project.id } })).status).toBe(
      "running",
    );
    expect(jobs.enqueue).toHaveBeenCalled();
  });

  it("queues a same-bot child behind a Team Computer lease and runs it once the parent releases", async () => {
    const s = await setup();
    const computer = await prisma.computer.create({
      data: {
        spaceId: s.id,
        userId: s.id,
        scope: "team",
        scopeKey: randomUUID(),
        homeKey: randomUUID(),
        kind: "fake",
      },
    });
    await prisma.bot.update({ where: { id: s.chief.id }, data: { computerId: computer.id } });
    const child = await startProjectTask(deps(), scope(s), { prompt: "Child", assignee: "chief" });
    if (!("ok" in child)) throw new Error("expected a started task");
    const parentTask = await prisma.task.create({
      data: {
        spaceId: s.id,
        userId: s.id,
        botId: s.chief.id,
        threadId: s.chief.threadId,
        prompt: "Orchestrate",
        status: "running",
      },
    });
    const parentRun = await prisma.run.create({
      data: {
        taskId: parentTask.id,
        spaceId: s.id,
        userId: s.id,
        botId: s.chief.id,
        threadId: s.chief.threadId,
        status: "running",
        trigger: "user",
      },
    });
    const lease = (runId: string) => ({
      computerId: computer.id,
      runId,
      botId: s.chief.id,
    });

    const held = await acquireComputerExecutionLease(prisma, lease(parentRun.id));
    await expect(acquireComputerExecutionLease(prisma, lease(child.runId))).rejects.toBeInstanceOf(
      ComputerBusyError,
    );
    // Busy is a wait, not a failure: the child run stays queued and the project is not failed.
    expect((await prisma.run.findUniqueOrThrow({ where: { id: child.runId } })).status).toBe(
      "queued",
    );
    expect(
      (await prisma.project.findUniqueOrThrow({ where: { id: s.project.id } })).status,
    ).not.toBe("failed");

    await releaseComputerExecutionLease(prisma, held);
    expect(await acquireComputerExecutionLease(prisma, lease(child.runId))).toMatchObject({
      runId: child.runId,
    });
  });

  it("keeps a project card current however deep it sits in the thread", async () => {
    const s = await setup();
    const started = await startProjectTask(deps(), scope(s), { prompt: "Work", assignee: "Chief" });
    if (!("ok" in started)) throw new Error("expected a started task");
    const card = await prisma.message.create({
      data: {
        threadId: s.chief.threadId,
        seq: 1,
        role: "bot",
        blocks: [
          { kind: "project", projectId: s.project.id, title: "Launch plan", status: "planned" },
        ],
      },
    });
    // 400 newer bot messages: the old scan window of 200 would never reach the card.
    await prisma.message.createMany({
      data: Array.from({ length: 400 }, (_, index) => ({
        threadId: s.chief.threadId,
        seq: index + 2,
        role: "bot",
        blocks: [{ kind: "text", text: `filler ${index}` }],
      })),
    });
    await setLatestRun(started.taskId, "running");

    await reconcileProjects(deps());

    const saved = await prisma.message.findUniqueOrThrow({ where: { id: card.id } });
    expect(saved.blocks).toEqual([
      expect.objectContaining({
        kind: "project",
        status: "running",
        progress: { done: 0, total: 1 },
      }),
    ]);
  });

  it("refuses an unknown assignee and caps active children", async () => {
    const s = await setup();
    expect(await startProjectTask(deps(), scope(s), { prompt: "x", assignee: "Nobody" })).toEqual({
      error: "Assignee bot not found.",
    });
    for (let i = 0; i < 10; i += 1) {
      expect(await startProjectTask(deps(), scope(s), { prompt: `task ${i}` })).toHaveProperty(
        "ok",
      );
    }
    expect(await startProjectTask(deps(), scope(s), { prompt: "one too many" })).toEqual({
      error: "Too many tasks are already running. Wait for some to finish.",
    });
  });

  it("surfaces a waiting child to the Main Bot exactly once, however often it reconciles", async () => {
    const s = await setup();
    const started = await startProjectTask(deps(), scope(s), {
      prompt: "Pick a city",
      assignee: "Helper",
    });
    if (!("ok" in started)) throw new Error("expected a started task");
    await setLatestRun(started.taskId, "waiting_input");

    await reconcileProjects(deps());
    await reconcileProjects(deps());
    await reconcileProjects(deps());

    const notices = await attentionMessages(s.chief.threadId);
    expect(notices).toHaveLength(1);
    expect(JSON.stringify(notices[0]?.blocks)).toContain("needs your input");
    expect((await prisma.project.findUniqueOrThrow({ where: { id: s.project.id } })).status).toBe(
      "waiting",
    );
    // The blocker lives in the Helper's chat, not the Main Bot's, so nothing lands there.
    expect(await attentionMessages(s.helper.threadId)).toHaveLength(0);
  });

  it("never posts attention into another member's Main Bot thread", async () => {
    const s = await setup();
    const other = randomUUID();
    owners.push(other);
    await prisma.user.create({
      data: { id: other, name: "Other", email: `${other}@example.test`, emailVerified: true },
    });
    const foreign = await prisma.bot.create({
      data: { spaceId: s.id, userId: other, name: "Foreign", color: "test-color" },
    });
    const foreignThread = await prisma.thread.create({
      data: { spaceId: s.id, userId: other, botId: foreign.id },
    });
    await prisma.space.update({ where: { id: s.id }, data: { mainBotId: foreign.id } });
    const started = await startProjectTask(deps(), scope(s), {
      prompt: "Pick",
      assignee: "Helper",
    });
    if (!("ok" in started)) throw new Error("expected a started task");
    await setLatestRun(started.taskId, "waiting_input");

    await reconcileProjects(deps());

    expect(await attentionMessages(foreignThread.id)).toHaveLength(0);
  });

  it("stays quiet when the blocker is already in the Main Bot's own thread", async () => {
    const s = await setup();
    const started = await startProjectTask(deps(), scope(s), { prompt: "Pick a city" });
    if (!("ok" in started)) throw new Error("expected a started task");
    await setLatestRun(started.taskId, "waiting_input");
    await reconcileProjects(deps());
    expect(await attentionMessages(s.chief.threadId)).toHaveLength(0);
  });

  it("completes the project, updates its transcript card, and announces it once", async () => {
    // A project owned by another bot: the Main Bot's thread is where the user hears about it.
    const s = await setup("helper");
    const card: MessageBlock = {
      kind: "project",
      projectId: s.project.id,
      title: "Launch plan",
      status: "planned",
      progress: { done: 0, total: 0 },
    };
    const message = await prisma.message.create({
      data: {
        threadId: s.helper.threadId,
        seq: 1,
        role: "bot",
        blocks: [card],
        botId: s.helper.id,
      },
    });
    const started = await startProjectTask(deps(), scope(s), {
      prompt: "Draft the checklist",
      assignee: "Chief",
    });
    if (!("ok" in started)) throw new Error("expected a started task");
    await setLatestRun(started.taskId, "completed");

    await reconcileProjects(deps());
    await reconcileProjects(deps());

    const project = await prisma.project.findUniqueOrThrow({ where: { id: s.project.id } });
    expect(project.status).toBe("completed");
    expect(project.completedAt).not.toBeNull();
    const updated = await prisma.message.findUniqueOrThrow({ where: { id: message.id } });
    expect((updated.blocks as MessageBlock[])[0]).toMatchObject({
      status: "completed",
      progress: { done: 1, total: 1 },
    });
    const notices = await attentionMessages(s.chief.threadId);
    expect(notices).toHaveLength(1);
    expect(JSON.stringify(notices[0]?.blocks)).toContain("is done");
  });

  it("waits for the orchestrator to finish before completing", async () => {
    const s = await setup();
    const task = await prisma.task.create({
      data: {
        spaceId: s.id,
        userId: s.id,
        botId: s.chief.id,
        threadId: s.chief.threadId,
        prompt: "Plan",
        status: "running",
      },
    });
    const orchestrator = await prisma.run.create({
      data: {
        spaceId: s.id,
        userId: s.id,
        botId: s.chief.id,
        threadId: s.chief.threadId,
        taskId: task.id,
        status: "running",
        trigger: "user",
      },
    });
    await prisma.project.update({
      where: { id: s.project.id },
      data: { orchestratorRunId: orchestrator.id },
    });
    const started = await startProjectTask(deps(), scope(s), {
      prompt: "Step one",
      assignee: "Helper",
    });
    if (!("ok" in started)) throw new Error("expected a started task");
    await setLatestRun(started.taskId, "completed");

    await reconcileProjects(deps());
    expect((await prisma.project.findUniqueOrThrow({ where: { id: s.project.id } })).status).toBe(
      "running",
    );

    await prisma.run.update({ where: { id: orchestrator.id }, data: { status: "completed" } });
    await reconcileProjects(deps());
    expect((await prisma.project.findUniqueOrThrow({ where: { id: s.project.id } })).status).toBe(
      "completed",
    );
  });

  it("retries failed children as new runs and reopens the project", async () => {
    const s = await setup();
    const started = await startProjectTask(deps(), scope(s), {
      prompt: "Flaky",
      assignee: "Helper",
    });
    if (!("ok" in started)) throw new Error("expected a started task");
    await setLatestRun(started.taskId, "failed");
    await reconcileProjects(deps());
    expect((await prisma.project.findUniqueOrThrow({ where: { id: s.project.id } })).status).toBe(
      "failed",
    );

    const retried = await retryProjectWork(deps(), scope(s));
    expect(retried.restarted).toEqual([started.taskId]);
    const runs = await prisma.run.findMany({ where: { taskId: started.taskId } });
    expect(runs.map((run) => run.status).sort()).toEqual(["failed", "queued"]);
    expect((await prisma.project.findUniqueOrThrow({ where: { id: s.project.id } })).status).toBe(
      "running",
    );
  });
});
