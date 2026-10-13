/** Trigger of runs that execute a Project child task. They never take user steering. */
export const PROJECT_TASK_RUN_TRIGGER = "project_task";

export type ProjectStatus =
  | "planned"
  | "running"
  | "waiting"
  | "completed"
  | "failed"
  | "cancelled";

export type ChildStatus = ProjectStatus;

/** Run statuses that can still make progress without the user. */
const RUNNING_RUN_STATUSES = new Set(["queued", "leased", "running"]);
const WAITING_RUN_STATUSES = new Set(["waiting_input", "waiting_takeover"]);

/**
 * One status for a child task. The latest run is the truth when the task has one; the stored
 * task status only describes work that never started.
 */
export function childStatus(
  latestRunStatus: string | null | undefined,
  taskStatus: string,
): ChildStatus {
  if (latestRunStatus) {
    if (RUNNING_RUN_STATUSES.has(latestRunStatus)) return "running";
    if (WAITING_RUN_STATUSES.has(latestRunStatus)) return "waiting";
    if (
      latestRunStatus === "completed" ||
      latestRunStatus === "failed" ||
      latestRunStatus === "cancelled"
    ) {
      return latestRunStatus;
    }
  }
  if (taskStatus === "queued" || taskStatus === "running") return "running";
  if (taskStatus === "waiting") return "waiting";
  if (taskStatus === "completed" || taskStatus === "failed" || taskStatus === "cancelled") {
    return taskStatus;
  }
  return "planned";
}

/**
 * Project status as the user sees it. Explicit completion or cancellation sticks until the
 * project is reopened. Otherwise children decide: waiting beats running beats failed, and a
 * project whose orchestrator has finished and whose children all completed is complete.
 */
export function deriveProjectStatus(input: {
  stored: string;
  children: readonly ChildStatus[];
  orchestratorActive: boolean;
}): ProjectStatus {
  const { stored, children, orchestratorActive } = input;
  if (stored === "cancelled" || stored === "completed") return stored;
  if (children.includes("waiting")) return "waiting";
  if (children.includes("running")) return "running";
  if (children.includes("failed")) return "failed";
  if (children.includes("planned")) return "running";
  const doneChildren = children.filter((child) => child === "completed").length;
  if (!orchestratorActive && children.length > 0 && doneChildren > 0) return "completed";
  if (orchestratorActive) return "running";
  return "planned";
}

export type ProjectAttentionKind = "waiting" | "failed" | "completed";

/** The user-facing moments worth surfacing; everything else is progress. */
export function projectAttentionKind(status: ProjectStatus): ProjectAttentionKind | null {
  return status === "waiting" || status === "failed" || status === "completed" ? status : null;
}
