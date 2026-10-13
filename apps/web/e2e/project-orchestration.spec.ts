import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { activeBotId, captureScreenshot, completeOnboarding, rpc, signup } from "./helpers";

type ProjectDto = {
  id: string;
  status: string;
  tasks: Array<{ id: string; status: string; botName?: string }>;
};

async function send(page: Parameters<typeof rpc>[0], botId: string, text: string) {
  return rpc(page, "threads/send", { botId, text, clientNonce: randomUUID() });
}

async function createHelper(page: Parameters<typeof rpc>[0]) {
  return rpc<{ id: string }>(page, "bots/create", {
    name: "Helper",
    title: "assistant",
    description: "Takes delegated tasks.",
    instructions: "",
    notifyOnFinish: true,
    computerMode: "team",
  });
}

test("a Bot starts a Project, delegates a task, and progress and completion follow the child run", async ({
  page,
}, testInfo) => {
  await signup(page, `project-orch-${Date.now()}@rakazo.test`, "password12", "Orchestrate");
  await completeOnboarding(page);
  const chiefId = activeBotId(page);
  await createHelper(page);

  await send(page, chiefId, "create project titled Launch plan with objective Ship the launch");
  await expect
    .poll(async () => (await rpc<ProjectDto[]>(page, "projects/list", { botId: chiefId })).length, {
      timeout: 30_000,
    })
    .toBe(1);
  const [project] = await rpc<ProjectDto[]>(page, "projects/list", { botId: chiefId });
  // The creating turn must be over, or the next message would only steer it.
  await expect
    .poll(
      async () =>
        (await rpc<{ runs: unknown[] }>(page, "runs/list", { filter: "active" })).runs.length,
    )
    .toBe(0);

  await send(
    page,
    chiefId,
    `start project task project:${project!.id} assignee:Helper do: draft the launch checklist`,
  );
  await expect
    .poll(
      async () => {
        const current = await rpc<ProjectDto>(page, "projects/get", { projectId: project!.id });
        return `${current.status}:${current.tasks[0]?.status}:${current.tasks[0]?.botName}`;
      },
      { timeout: 60_000 },
    )
    .toBe("completed:completed:Helper");

  await page.reload();
  await page.getByTestId("bot-settings-trigger").click();
  await page.getByTestId("conversation-details-tasks").click();
  await page
    .getByTestId("bot-tasks")
    .getByRole("button", { name: /Launch plan/ })
    .click();
  const detail = page.getByTestId("project-detail");
  await expect(detail.getByTestId("project-status")).toHaveText("completed");
  await expect(detail.getByText("Helper", { exact: true })).toBeVisible();
  await captureScreenshot(page, testInfo, "70-project-delegated-completed");

  // The transcript card follows the child run (kept in sync by the reconciler).
  await page.getByRole("button", { name: "Close panel" }).click();
  await expect(page.getByText("1 of 1 done")).toBeVisible({ timeout: 90_000 });
});

test("a child blocker reaches the Main Bot and the answered child lets the project finish", async ({
  page,
}, testInfo) => {
  await signup(page, `project-block-${Date.now()}@rakazo.test`, "password12", "Blocker");
  await completeOnboarding(page);
  const chiefId = activeBotId(page);
  const helper = await createHelper(page);
  await rpc(page, "spaces/setMainBot", { botId: chiefId });
  const project = await rpc<ProjectDto>(page, "projects/create", {
    botId: chiefId,
    title: "Offsite",
    objective: "Plan the offsite",
    plan: [],
  });

  await send(
    page,
    chiefId,
    `start project task project:${project.id} assignee:Helper do: ask me which city should I use`,
  );
  await expect
    .poll(
      async () => (await rpc<ProjectDto>(page, "projects/get", { projectId: project.id })).status,
      {
        timeout: 60_000,
      },
    )
    .toBe("waiting");

  // The reconciler posts the blocker into the Main Bot's chat, once.
  await page.goto(`/app/${chiefId}`);
  await expect(page.getByText("Offsite needs your input.")).toBeVisible({ timeout: 90_000 });
  await expect(page.getByText("Offsite needs your input.")).toHaveCount(1);
  await captureScreenshot(page, testInfo, "71-main-bot-attention");

  // Answering where the blocker lives lets the child, then the project, finish.
  await page.goto(`/app/${helper.id}`);
  await page.getByRole("button", { name: "Send it" }).click();
  await expect
    .poll(
      async () => (await rpc<ProjectDto>(page, "projects/get", { projectId: project.id })).status,
      {
        timeout: 60_000,
      },
    )
    .toBe("completed");
});

test("stopping the Bot that owns a Project stops its delegated work and nothing else", async ({
  page,
}) => {
  await signup(page, `project-stop-${Date.now()}@rakazo.test`, "password12", "Stopper");
  await completeOnboarding(page);
  const chiefId = activeBotId(page);
  const helper = await createHelper(page);
  const project = await rpc<ProjectDto>(page, "projects/create", {
    botId: chiefId,
    title: "Long job",
    objective: "Keep going",
    plan: [],
  });

  await send(
    page,
    chiefId,
    `start project task project:${project.id} assignee:Helper do: keep working until i stop you`,
  );
  // An unrelated run on the same Helper that the project's Stop must leave alone.
  await send(page, helper.id, "keep working until i stop you");
  const helperRuns = async () =>
    (
      await rpc<{ runs: Array<{ botId: string; trigger: string }> }>(page, "runs/list", {
        filter: "active",
      })
    ).runs.filter((run) => run.botId === helper.id);
  await expect
    .poll(async () => (await helperRuns()).map((run) => run.trigger).sort(), { timeout: 60_000 })
    .toEqual(["project_task", "user"]);

  await rpc(page, "threads/stop", { botId: chiefId });

  await expect
    .poll(
      async () => (await rpc<ProjectDto>(page, "projects/get", { projectId: project.id })).status,
    )
    .toBe("cancelled");
  expect((await helperRuns()).map((run) => run.trigger)).toEqual(["user"]);

  // Retrying reopens the cancelled child.
  await rpc(page, "projects/retry", { projectId: project.id });
  const retried = await rpc<ProjectDto>(page, "projects/get", { projectId: project.id });
  expect(retried.status).toBe("running");
  await rpc(page, "projects/stop", { projectId: project.id });
});

test("a delegated child's consequential action waits for approval like any other run", async ({
  page,
}) => {
  await signup(page, `project-approval-${Date.now()}@rakazo.test`, "password12", "Approver");
  await completeOnboarding(page);
  const chiefId = activeBotId(page);
  const helper = await createHelper(page);
  await rpc(page, "approvalRules/set", {
    effect: "require_approval",
    matchKind: "connector",
    matchValue: "destination.write",
  });
  const project = await rpc<ProjectDto>(page, "projects/create", {
    botId: chiefId,
    title: "Record keeping",
    objective: "Write the record",
    plan: [],
  });

  await send(
    page,
    chiefId,
    `start project task project:${project.id} assignee:Helper do: write this to the destination crm as a note`,
  );
  await expect
    .poll(
      async () => (await rpc<ProjectDto>(page, "projects/get", { projectId: project.id })).status,
      {
        timeout: 60_000,
      },
    )
    .toBe("waiting");

  await page.goto(`/app/${helper.id}`);
  await page.getByRole("button", { name: "Allow once", exact: true }).click();
  await expect
    .poll(
      async () => (await rpc<ProjectDto>(page, "projects/get", { projectId: project.id })).status,
      {
        timeout: 60_000,
      },
    )
    .toBe("completed");
});
