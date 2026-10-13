import { randomUUID } from "node:crypto";
import type { SandboxProvider } from "@rakazo/adapter-kit";
import type { Actor } from "@rakazo/contracts";
import { createDb, type PrismaClient, type ThreadEvents } from "@rakazo/db";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { stopProjectsOwnedByBot, stopProjectWork } from "./project-control.js";

const describePostgres =
  process.env.VERIFY_DATABASE && process.env.DATABASE_URL ? describe.sequential : describe.skip;

describePostgres("project stop ownership (PostgreSQL)", () => {
  let db: ReturnType<typeof createDb>;
  let prisma: PrismaClient;
  const owners: string[] = [];
  const events = { notify: vi.fn().mockResolvedValue(undefined) } as unknown as ThreadEvents;
  const sandbox = {} as SandboxProvider;
  const deps = () => ({ prisma, sandbox, events });

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
      data: { id, name: "Stop test", email: `${id}@example.test`, emailVerified: true },
    });
    await prisma.organization.create({
      data: { id, name: "Stop test", slug: id, createdAt: new Date() },
    });
    await prisma.space.create({
      data: { id, organizationId: id, name: "Stop test", isDefault: true },
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
    const actor: Actor = {
      spaceId: id,
      userId: id,
      email: `${id}@example.test`,
      isDeploymentOwner: true,
    };
    const makeProject = (botId: string, title: string) =>
      prisma.project.create({
        data: { spaceId: id, userId: id, botId, title, objective: title, status: "running" },
      });
    /** A task with one run; `projectId` null makes it unrelated work. */
    const makeWork = async (
      bot: { id: string; threadId: string },
      projectId: string | null,
      status = "running",
    ) => {
      const task = await prisma.task.create({
        data: {
          spaceId: id,
          userId: id,
          botId: bot.id,
          threadId: bot.threadId,
          projectId,
          prompt: "work",
          status: "running",
        },
      });
      const run = await prisma.run.create({
        data: {
          spaceId: id,
          userId: id,
          botId: bot.id,
          threadId: bot.threadId,
          taskId: task.id,
          status,
          trigger: projectId ? "project_task" : "user",
        },
      });
      return { taskId: task.id, runId: run.id };
    };
    const statusOf = async (runId: string) =>
      (await prisma.run.findUniqueOrThrow({ where: { id: runId } })).status;
    let seq = 0;
    /** A running cloud agent whose card message was published by `runId`. */
    const makeCloudAgent = async (bot: { id: string; threadId: string }, runId: string) => {
      const message = await prisma.message.create({
        data: {
          threadId: bot.threadId,
          seq: ++seq,
          role: "bot",
          blocks: [],
          botId: bot.id,
          runId,
        },
      });
      return prisma.cloudAgent.create({
        data: {
          operationKey: randomUUID(),
          providerKey: "test",
          spaceId: id,
          userId: id,
          botId: bot.id,
          threadId: bot.threadId,
          messageId: message.id,
          title: "Cloud work",
          launchRequest: {},
        },
      });
    };
    const cancelRequested = async (agentId: string) =>
      (await prisma.cloudAgent.findUniqueOrThrow({ where: { id: agentId } })).cancelRequested;
    return {
      chief,
      helper,
      actor,
      makeProject,
      makeWork,
      statusOf,
      makeCloudAgent,
      cancelRequested,
    };
  }

  it("stops only the project's own runs across bots and leaves unrelated work running", async () => {
    const s = await setup();
    const project = await s.makeProject(s.chief.id, "Launch");
    const onHelper = await s.makeWork(s.helper, project.id);
    const onChief = await s.makeWork(s.chief, project.id, "waiting_input");
    const unrelatedHelper = await s.makeWork(s.helper, null);
    const unrelatedChief = await s.makeWork(s.chief, null);

    await stopProjectWork(deps(), s.actor, project.id);

    expect(await s.statusOf(onHelper.runId)).toBe("cancelled");
    expect(await s.statusOf(onChief.runId)).toBe("cancelled");
    expect(await s.statusOf(unrelatedHelper.runId)).toBe("running");
    expect(await s.statusOf(unrelatedChief.runId)).toBe("running");
    expect((await prisma.project.findUniqueOrThrow({ where: { id: project.id } })).status).toBe(
      "cancelled",
    );
  });

  it("cancels cloud agents launched by the project's runs, once, and no others", async () => {
    const s = await setup();
    const project = await s.makeProject(s.chief.id, "Launch");
    const work = await s.makeWork(s.helper, project.id);
    const unrelated = await s.makeWork(s.helper, null);
    const owned = await s.makeCloudAgent(s.helper, work.runId);
    const other = await s.makeCloudAgent(s.helper, unrelated.runId);

    await stopProjectWork(deps(), s.actor, project.id);
    expect(await s.cancelRequested(owned.id)).toBe(true);
    expect(await s.cancelRequested(other.id)).toBe(false);

    const version = (await prisma.cloudAgent.findUniqueOrThrow({ where: { id: owned.id } }))
      .version;
    await stopProjectWork(deps(), s.actor, project.id);
    expect((await prisma.cloudAgent.findUniqueOrThrow({ where: { id: owned.id } })).version).toBe(
      version,
    );
  });

  it("stops the projects a bot owns, not the ones it merely works on", async () => {
    const s = await setup();
    const owned = await s.makeProject(s.chief.id, "Chief's");
    const other = await s.makeProject(s.helper.id, "Helper's");
    const ownedWork = await s.makeWork(s.helper, owned.id);
    const otherWork = await s.makeWork(s.chief, other.id);

    await stopProjectsOwnedByBot(deps(), s.actor, s.chief.id);

    expect(await s.statusOf(ownedWork.runId)).toBe("cancelled");
    expect(await s.statusOf(otherWork.runId)).toBe("running");
    expect((await prisma.project.findUniqueOrThrow({ where: { id: other.id } })).status).toBe(
      "running",
    );
  });

  it("does not let another user stop a project", async () => {
    const mine = await setup();
    const theirs = await setup();
    const project = await mine.makeProject(mine.chief.id, "Mine");
    await expect(stopProjectWork(deps(), theirs.actor, project.id)).rejects.toThrow();
  });
});
