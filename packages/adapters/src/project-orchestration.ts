import type { JobPublisher } from "@rakazo/adapter-kit";
import { runContinueJob } from "@rakazo/adapter-kit";
import type { MessageBlock, RunStatus } from "@rakazo/contracts";
import {
  type ChildStatus,
  childStatus,
  deriveProjectStatus,
  isActive,
  PROJECT_TASK_RUN_TRIGGER,
  type ProjectStatus,
  projectAttentionKind,
} from "@rakazo/core";
import {
  appendEventInTransaction,
  createThreadMessageInTransaction,
  type Prisma,
  type PrismaClient,
  type ThreadEvents,
} from "@rakazo/db";
import { getLogger } from "@rakazo/logging";

const PROJECT_TASK_TRIGGER = PROJECT_TASK_RUN_TRIGGER;
const MAX_TASKS_PER_PROJECT = 50;
const MAX_ACTIVE_TASKS_PER_PROJECT = 10;
const RECONCILE_BATCH = 50;
const OPEN_STATUSES = ["planned", "running", "waiting", "failed"];

export interface ProjectOrchestrationDeps {
  prisma: PrismaClient;
  jobs: JobPublisher;
  events: Pick<ThreadEvents, "notify">;
}

type ProjectScope = { id: string; spaceId: string; userId: string; botId: string };

/** Resolve a delegate by id or case-insensitive name within the owner's active bots. */
export async function resolveProjectAssignee(
  prisma: PrismaClient,
  project: ProjectScope,
  assignee: string | undefined,
) {
  const wanted = assignee?.trim();
  const bots = await prisma.bot.findMany({
    where: { spaceId: project.spaceId, userId: project.userId, archivedAt: null },
    select: { id: true, name: true, thread: { select: { id: true } } },
  });
  const found = wanted
    ? (bots.find((bot) => bot.id === wanted) ??
      bots.find((bot) => bot.name.toLowerCase() === wanted.toLowerCase()))
    : bots.find((bot) => bot.id === project.botId);
  if (!found?.thread) return null;
  return { id: found.id, name: found.name, threadId: found.thread.id };
}

/**
 * Start one child task as its own run on the assignee's thread. The run uses the normal
 * executor, so approvals, tool policy, and isolation apply exactly as for any other run.
 */
export async function startProjectTask(
  deps: ProjectOrchestrationDeps,
  project: ProjectScope,
  input: { prompt: string; assignee?: string },
): Promise<
  { ok: true; taskId: string; runId: string; botId: string; botName: string } | { error: string }
> {
  const counts = await deps.prisma.task.findMany({
    where: { projectId: project.id },
    select: {
      status: true,
      runs: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true } },
    },
  });
  if (counts.length >= MAX_TASKS_PER_PROJECT) {
    return { error: `A project can have at most ${MAX_TASKS_PER_PROJECT} tasks.` };
  }
  const active = counts.filter((task) => {
    const status = childStatus(task.runs[0]?.status, task.status);
    return status === "running" || status === "waiting";
  }).length;
  if (active >= MAX_ACTIVE_TASKS_PER_PROJECT) {
    return { error: "Too many tasks are already running. Wait for some to finish." };
  }
  const assignee = await resolveProjectAssignee(deps.prisma, project, input.assignee);
  if (!assignee) return { error: "Assignee bot not found." };
  const created = await deps.prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<Array<{ status: string }>>`
      SELECT status FROM projects
      WHERE id = ${project.id} AND "spaceId" = ${project.spaceId}
        AND "userId" = ${project.userId} AND "botId" = ${project.botId}
      FOR UPDATE
    `;
    const current = rows[0];
    if (!current || current.status === "cancelled" || current.status === "completed") return null;
    const task = await tx.task.create({
      data: {
        spaceId: project.spaceId,
        userId: project.userId,
        botId: assignee.id,
        threadId: assignee.threadId,
        projectId: project.id,
        prompt: input.prompt.slice(0, 8_000),
        status: "queued",
      },
    });
    const run = await tx.run.create({
      data: {
        spaceId: project.spaceId,
        userId: project.userId,
        botId: assignee.id,
        threadId: assignee.threadId,
        taskId: task.id,
        status: "queued",
        trigger: PROJECT_TASK_TRIGGER,
      },
      select: { id: true },
    });
    await tx.project.update({ where: { id: project.id }, data: { status: "running" } });
    return { taskId: task.id, runId: run.id };
  });
  if (!created) return { error: "Project is stopped or complete. Reopen it before adding work." };
  // The queued run is durable; the job reconciler repairs a missed wake.
  await deps.jobs.enqueue(runContinueJob(created.runId)).catch((error) => {
    getLogger().error("project task enqueue", error);
  });
  return { ok: true, ...created, botId: assignee.id, botName: assignee.name };
}

/** Requeue failed or cancelled child work as new runs and reopen the project. */
export async function retryProjectWork(
  deps: ProjectOrchestrationDeps,
  project: ProjectScope,
): Promise<{ restarted: string[] }> {
  const runIds: string[] = [];
  let restarted: string[] = [];
  await deps.prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<Array<{ status: string }>>`
      SELECT status FROM projects
      WHERE id = ${project.id} AND "spaceId" = ${project.spaceId}
        AND "userId" = ${project.userId} AND "botId" = ${project.botId}
      FOR UPDATE
    `;
    const current = rows[0];
    if (!current) throw new Error("Project not found.");
    if (current.status === "completed") throw new Error("Completed Projects cannot be retried.");
    const tasks = await tx.task.findMany({
      where: { projectId: project.id },
      select: {
        id: true,
        botId: true,
        threadId: true,
        status: true,
        runs: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true } },
      },
    });
    const retryable = tasks.filter((task) => {
      const status = childStatus(task.runs[0]?.status, task.status);
      return status === "failed" || status === "cancelled" || status === "planned";
    });
    restarted = retryable.map((task) => task.id);
    for (const task of retryable) {
      await tx.task.update({ where: { id: task.id }, data: { status: "queued" } });
      const run = await tx.run.create({
        data: {
          spaceId: project.spaceId,
          userId: project.userId,
          botId: task.botId,
          threadId: task.threadId,
          taskId: task.id,
          status: "queued",
          trigger: PROJECT_TASK_TRIGGER,
        },
        select: { id: true },
      });
      runIds.push(run.id);
    }
    await tx.project.update({
      where: { id: project.id },
      data: { status: "running", completedAt: null },
    });
  });
  for (const runId of runIds) {
    await deps.jobs.enqueue(runContinueJob(runId)).catch((error) => {
      getLogger().error("project retry enqueue", error);
    });
  }
  return { restarted };
}

const projectInclude = {
  bot: { select: { name: true, thread: { select: { id: true } } } },
  orchestratorRun: { select: { status: true } },
  tasks: {
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: {
      id: true,
      prompt: true,
      status: true,
      botId: true,
      createdAt: true,
      updatedAt: true,
      bot: { select: { name: true } },
      runs: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, status: true, threadId: true },
      },
    },
  },
} satisfies Prisma.ProjectInclude;

type ProjectRow = Prisma.ProjectGetPayload<{ include: typeof projectInclude }>;

function loadOpenProjects(prisma: PrismaClient, afterId?: string) {
  return prisma.project.findMany({
    where: { status: { in: OPEN_STATUSES }, ...(afterId ? { id: { gt: afterId } } : {}) },
    orderBy: { id: "asc" },
    take: RECONCILE_BATCH,
    include: projectInclude,
  });
}

/** Summaries for specific projects (tool and API reads), derived exactly like the reconciler. */
export async function loadProjectSummaries(prisma: PrismaClient, projectIds: string[]) {
  const rows = await prisma.project.findMany({
    where: { id: { in: projectIds } },
    include: projectInclude,
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
  });
  return rows.map((project) => ({ project, ...summarizeProject(project) }));
}

/** Everything the reconciler and the API need to agree on, computed once per project. */
export function summarizeProject(project: ProjectRow) {
  const children = project.tasks.map((task) => ({
    task,
    status: childStatus(task.runs[0]?.status, task.status),
  }));
  const derived = deriveProjectStatus({
    stored: project.status,
    children: children.map((child) => child.status),
    orchestratorActive: Boolean(
      project.orchestratorRun && isActive(project.orchestratorRun.status as RunStatus),
    ),
  });
  const done = children.filter((child) => child.status === "completed").length;
  return { children, derived, progress: { done, total: children.length } };
}

function attentionFor(project: ProjectRow, derived: ProjectStatus, children: ChildState[]) {
  const kind = projectAttentionKind(derived);
  if (!kind) return null;
  const pick = (status: ChildStatus) => children.find((child) => child.status === status);
  if (kind === "waiting") {
    const blocker = pick("waiting");
    const runId = blocker?.task.runs[0]?.id;
    if (!blocker || !runId) return null;
    return {
      nonce: `attn:${project.id}:waiting:${runId}`,
      subjectThreadId: blocker.task.runs[0]?.threadId ?? null,
      text: `**${project.title}** needs your input. Open ${blocker.task.bot.name}'s chat to answer.`,
    };
  }
  if (kind === "failed") {
    const failed = pick("failed");
    const runId = failed?.task.runs[0]?.id;
    if (!failed || !runId) return null;
    return {
      nonce: `attn:${project.id}:failed:${runId}`,
      subjectThreadId: project.bot.thread?.id ?? null,
      text: `**${project.title}** hit a problem and stopped. Open its tasks to retry.`,
    };
  }
  const last = [...children].reverse().find((child) => child.status === "completed");
  return {
    nonce: `attn:${project.id}:completed:${last?.task.runs[0]?.id ?? "done"}`,
    subjectThreadId: project.bot.thread?.id ?? null,
    text: `**${project.title}** is done.`,
  };
}

type ChildState = ReturnType<typeof summarizeProject>["children"][number];

/** Surface one event in the Main Bot's thread. The nonce makes retries and replays no-ops. */
async function postAttention(
  deps: ProjectOrchestrationDeps,
  project: ProjectRow,
  attention: { nonce: string; subjectThreadId: string | null; text: string },
) {
  const space = await deps.prisma.space.findUnique({
    where: { id: project.spaceId },
    select: {
      mainBot: {
        select: { id: true, userId: true, archivedAt: true, thread: { select: { id: true } } },
      },
    },
  });
  const main = space?.mainBot;
  const threadId = main?.thread?.id;
  // The Main Bot is per Space, but its thread belongs to one member: never post into another's.
  if (!main || main.archivedAt || main.userId !== project.userId || !threadId) return;
  // The user is already looking at the subject when it lives in the Main Bot's own thread.
  if (attention.subjectThreadId === threadId) return;
  const existing = await deps.prisma.message.findUnique({
    where: { threadId_clientNonce: { threadId, clientNonce: attention.nonce } },
    select: { id: true },
  });
  if (existing) return;
  const blocks: MessageBlock[] = [{ kind: "text", text: attention.text }];
  const event = await deps.prisma
    .$transaction(async (tx: Prisma.TransactionClient) => {
      const message = await createThreadMessageInTransaction(tx, {
        threadId,
        role: "bot",
        blocks,
        botId: main.id,
        clientNonce: attention.nonce,
      });
      return appendEventInTransaction(tx, {
        spaceId: project.spaceId,
        threadId,
        botId: main.id,
        type: "thread.message.created",
        payload: { messageId: message.id, role: "bot", blocks },
      });
    })
    .catch((error: unknown) => {
      // A concurrent pass won the unique (threadId, clientNonce); that is the dedupe working.
      if ((error as { code?: string }).code === "P2002") return null;
      throw error;
    });
  if (event) await deps.events.notify(threadId, event.seq).catch(() => undefined);
}

/** Keep the transcript card truthful: status and progress come from child runs. */
async function syncProjectCard(
  deps: ProjectOrchestrationDeps,
  project: ProjectRow,
  status: ProjectStatus,
  progress: { done: number; total: number },
) {
  const threadId = project.bot.thread?.id;
  if (!threadId) return;
  // Let the database pick the cards (JSONB containment) so a card is found however far back it
  // sits; a fixed recent-message window silently stopped updating older cards.
  const messages = await deps.prisma.message.findMany({
    where: {
      threadId,
      role: "bot",
      blocks: { array_contains: [{ kind: "project", projectId: project.id }] },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, blocks: true },
  });
  for (const message of messages) {
    const blocks = message.blocks as MessageBlock[];
    const stale = blocks.some(
      (block) =>
        block.kind === "project" &&
        block.projectId === project.id &&
        (block.status !== status ||
          block.progress?.done !== progress.done ||
          block.progress?.total !== progress.total),
    );
    if (!stale) continue;
    const next = blocks.map((block) =>
      block.kind === "project" && block.projectId === project.id
        ? { ...block, status, progress }
        : block,
    );
    const event = await deps.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.message.update({ where: { id: message.id }, data: { blocks: next } });
      return appendEventInTransaction(tx, {
        spaceId: project.spaceId,
        threadId,
        botId: project.botId,
        type: "thread.message.updated",
        payload: { messageId: message.id, role: "bot", blocks: next },
      });
    });
    await deps.events.notify(threadId, event.seq).catch(() => undefined);
  }
}

/**
 * Leader-elected pass over open projects: derive status from child runs, persist it, keep
 * the transcript card current, and surface waiting/failed/completed to the Main Bot once.
 */
export async function reconcileProjects(deps: ProjectOrchestrationDeps): Promise<void> {
  let afterId: string | undefined;
  for (;;) {
    const projects = await loadOpenProjects(deps.prisma, afterId);
    if (projects.length === 0) return;
    for (const project of projects) await reconcileProject(deps, project);
    afterId = projects[projects.length - 1]?.id;
    if (projects.length < RECONCILE_BATCH) return;
  }
}

async function reconcileProject(deps: ProjectOrchestrationDeps, project: ProjectRow) {
  try {
    const { children, derived, progress } = summarizeProject(project);
    const attention = attentionFor(project, derived, children);
    // Post before persisting: both steps are idempotent, so a crash between them retries safely.
    if (attention) await postAttention(deps, project, attention);
    if (derived !== project.status) {
      await deps.prisma.project.updateMany({
        where: { id: project.id, status: project.status },
        data: {
          status: derived,
          completedAt: derived === "completed" ? new Date() : null,
        },
      });
    }
    await syncProjectCard(deps, project, derived, progress);
  } catch (error) {
    getLogger().error("project reconciliation", error, { "project.id": project.id });
  }
}

/** Tells a delegated bot what it is part of, so its result reads as a deliverable, not chat. */
export async function projectTaskContext(
  prisma: PrismaClient,
  task: { projectId: string | null },
  botName: string,
): Promise<string | undefined> {
  if (!task.projectId) return undefined;
  const project = await prisma.project.findUnique({
    where: { id: task.projectId },
    select: { title: true, objective: true, bot: { select: { name: true } } },
  });
  if (!project) return undefined;
  const who = project.bot.name === botName ? "your Project" : `${project.bot.name}'s Project`;
  return `You are working on one task of ${who} "${project.title}". Objective: ${project.objective}\nDo only this task and finish with a short result. If you need the user to decide or approve something, ask; the Project is waiting on you and will surface it.`;
}
