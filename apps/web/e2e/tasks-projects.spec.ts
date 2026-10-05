import { expect, test } from "@playwright/test";
import { captureScreenshot, completeOnboarding, rpc, signup } from "./helpers";

test("Details → Tasks → Project survives a refresh via deep link", async ({ page }, testInfo) => {
  const stamp = Date.now();
  await signup(page, `tasks-projects-${stamp}@rakazo.test`, "password12", "Tasks");
  await completeOnboarding(page);

  const botId = new URL(page.url()).pathname.split("/").pop() as string;
  const project = await rpc<{ id: string }>(page, "projects/create", {
    botId,
    title: "Quarterly report",
    objective: "Draft, review, and send the quarterly report.",
    plan: ["Collect metrics", "Draft summary", "Send to stakeholders"],
  });

  await page.getByTestId("bot-settings-trigger").click();
  await expect(page.getByTestId("conversation-details")).toBeVisible();
  await captureScreenshot(page, testInfo, "05-details-home");
  await page.getByTestId("conversation-details-tasks").click();
  const tasks = page.getByTestId("bot-tasks");
  await expect(tasks).toBeVisible();
  await expect(tasks.getByText("Quarterly report")).toBeVisible();
  await captureScreenshot(page, testInfo, "06-tasks-list");

  await tasks.getByRole("button", { name: /Quarterly report/ }).click();
  const detail = page.getByTestId("project-detail");
  await expect(detail).toBeVisible();
  await expect(detail.getByText("Draft, review, and send the quarterly report.")).toBeVisible();
  await expect(detail.getByText("Collect metrics")).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`panel=tasks&project=${project.id}`));
  await captureScreenshot(page, testInfo, "06-project-detail");

  // The same project in its completed state (status set server-side, deep link
  // restores the detail after a reload).
  await rpc(page, "projects/update", {
    projectId: project.id,
    status: "completed",
  });
  await page.reload();
  await expect(page.getByTestId("project-detail")).toBeVisible();
  await expect(detail.getByText("completed", { exact: true })).toBeVisible();
  await captureScreenshot(page, testInfo, "06b-project-completed");
  await expect(page).toHaveURL(new RegExp(`panel=tasks&project=${project.id}`));

  await page.getByTestId("bot-settings-trigger").click();
  await expect(page.getByTestId("conversation-details")).toBeVisible();
  await expect(page.getByTestId("composer-bar")).toBeVisible();
});
