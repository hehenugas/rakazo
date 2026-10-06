import { expect, test } from "@playwright/test";
import type { Routine } from "@rakazo/contracts";
import { activeBotId, captureScreenshot, completeOnboarding, rpc, signup } from "./helpers";

test("chat request creates a routine with next-run confirmation and management home", async ({
  page,
}, testInfo) => {
  const stamp = Date.now();
  await signup(page, `routine-chat-${stamp}@rakazo.test`, "password12", "Routine Chat");
  await completeOnboarding(page);
  const botId = activeBotId(page);

  const composer = page.getByPlaceholder(/Message/);
  await composer.fill("create a routine that posts the weekday digest");
  await page.keyboard.press("Enter");

  // The conversation confirms the routine concisely: schedule in words,
  // timezone, and next run — never a raw cron expression.
  await expect(page.getByText("scheduling that for you.")).toBeVisible({ timeout: 30_000 });
  const card = page.getByTestId("transcript").getByText("Weekday digest").first();
  await expect(card).toBeVisible();
  await expect(page.getByText("Next run").first()).toBeVisible();
  await captureScreenshot(page, testInfo, "18-routine-chat-confirmation");

  // Details → Routines is the management home and mirrors the confirmation.
  await page.getByTestId("bot-settings-trigger").click();
  await page.getByTestId("conversation-details-routines").click();
  const panel = page.getByTestId("side-panel");
  const row = panel.getByRole("button", { name: /Weekday digest/ });
  await expect(row).toBeVisible();
  await expect(row).toContainText("Weekdays at 9:00 AM");
  await expect(row).toContainText("Next run");
  await expect(row).not.toContainText("* *");

  const routines = await rpc<Routine[]>(page, "routines/list", { botId });
  expect(routines).toHaveLength(1);
  expect(routines[0]).toMatchObject({
    name: "Weekday digest",
    crons: ["0 9 * * 1-5"],
    active: true,
  });
  expect(routines[0]?.nextRunAt).not.toBeNull();
  await captureScreenshot(page, testInfo, "18-routine-management-home");
});
