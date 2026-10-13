import type { SandboxProvider } from "@rakazo/adapter-kit";
import type { Actor } from "@rakazo/contracts";
import { ACTIVE_RUN_STATUSES } from "@rakazo/core";
import type { PrismaClient, ThreadEvents } from "@rakazo/db";
import { IsolationError } from "@rakazo/db";
import { stopThreadRuns } from "./thread-target.js";

type StopDeps = { prisma: PrismaClient; sandbox: SandboxProvider; events: ThreadEvents };

/**
 * Stop a Project's own work. Only runs whose task belongs to the project are cancelled, so
 * other runs on the same bots, computers, or Space are untouched. Explicit cancellation sticks
 * until the project is retried.
 */
export async function stopProjectWork(deps: StopDeps, actor: Actor, projectId: string) {
  const projectOpen = await deps.prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<Array<{ status: string }>>`
      SELECT status FROM projects
      WHERE id = ${projectId} AND "spaceId" = ${actor.spaceId} AND "userId" = ${actor.userId}
      FOR UPDATE
    `;
    const current = rows[0];
    if (!current) throw new IsolationError();
    if (current.status === "completed") return false;
    await tx.project.update({
      where: { id: projectId },
      data: { status: "cancelled", completedAt: null },
    });
    await tx.task.updateMany({
      where: { projectId, status: { in: ["planned", "queued", "running", "waiting"] } },
      data: { status: "cancelled" },
    });
    return true;
  });
  if (!projectOpen) return;
  const active = await deps.prisma.run.findMany({
    where: {
      spaceId: actor.spaceId,
      userId: actor.userId,
      status: { in: [...ACTIVE_RUN_STATUSES] },
      task: { projectId },
    },
    select: { id: true, threadId: true, botId: true },
  });
  const byThread = new Map<string, { botId: string; runIds: string[] }>();
  for (const run of active) {
    const entry = byThread.get(run.threadId) ?? { botId: run.botId, runIds: [] };
    entry.runIds.push(run.id);
    byThread.set(run.threadId, entry);
  }
  for (const [threadId, entry] of byThread) {
    await stopThreadRuns(
      deps,
      actor,
      { kind: "bot", botId: entry.botId, threadId },
      {
        onlyRunIds: entry.runIds,
      },
    );
  }
  await cancelProjectCloudAgents(deps.prisma, actor, projectId);
}

/**
 * Cloud agents outlive the run that launched them, so they are owned through the card message
 * that run published: only agents launched by a run of this project's tasks are cancelled.
 * Setting `cancelRequested` is the same durable intent `cloud_agent_cancel` uses; the poller owns
 * the remote call, and re-running is a no-op.
 */
async function cancelProjectCloudAgents(prisma: PrismaClient, actor: Actor, projectId: string) {
  const runs = await prisma.run.findMany({
    where: { spaceId: actor.spaceId, userId: actor.userId, task: { projectId } },
    select: { id: true },
  });
  if (!runs.length) return;
  const cards = await prisma.message.findMany({
    where: { runId: { in: runs.map((run) => run.id) } },
    select: { id: true },
  });
  if (!cards.length) return;
  await prisma.cloudAgent.updateMany({
    where: {
      spaceId: actor.spaceId,
      userId: actor.userId,
      messageId: { in: cards.map((card) => card.id) },
      status: "running",
      cancelRequested: false,
    },
    data: { cancelRequested: true, version: { increment: 1 }, nextPollAt: new Date() },
  });
}

/** A Bot told to stop also stops the open Projects it started, and nothing else. */
export async function stopProjectsOwnedByBot(deps: StopDeps, actor: Actor, botId: string) {
  const owned = await deps.prisma.project.findMany({
    where: {
      spaceId: actor.spaceId,
      userId: actor.userId,
      botId,
      status: { in: ["planned", "running", "waiting"] },
    },
    select: { id: true },
  });
  for (const project of owned) await stopProjectWork(deps, actor, project.id);
}
