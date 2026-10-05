import { expect, test } from "@playwright/test";
import { captureScreenshot, completeOnboarding, signup } from "./helpers";

test("Team Bot creation opens the actor's private instance", async ({ page }, testInfo) => {
  const stamp = Date.now();
  await signup(page, `team-bots-${stamp}@rakazo.test`, "password12", "Team");
  await completeOnboarding(page);

  await page.getByTestId("create-menu-trigger").click();
  await page.getByTestId("create-new-team-bot").click();
  const form = page.getByTestId("create-team-bot-form");
  await expect(form).toBeVisible();
  await captureScreenshot(page, testInfo, "11-team-bot-setup");

  const instanceUrl = page.waitForURL(/\/app\/[^/]+$/, { timeout: 30_000 });
  await form.locator("label:has-text('Name') input").fill("Research crew");
  await form.locator("label:has-text('Title') input").fill("Research assistant");
  await form
    .locator("label:has-text('Description') textarea")
    .fill("Shared research helper for the team.");
  await form.getByRole("button", { name: "Create Team Bot" }).click();
  await instanceUrl;

  const aside = page.locator("aside").first();
  await expect(aside.getByRole("button", { name: /Research crew/ }).first()).toBeVisible();
  await expect(page.getByTestId("composer-bar")).toBeVisible();
  await captureScreenshot(page, testInfo, "12-team-bot-instance");

  // The picker now lists the shared definition under Team Bots.
  await page.getByTestId("create-menu-trigger").click();
  const picker = page.getByTestId("bot-create-picker");
  await expect(picker.getByText("Team Bots")).toBeVisible();
  await expect(picker.getByText("Research crew").first()).toBeVisible();

  // The instance's details hub carries the template share/export affordance.
  await page.getByTestId("bot-settings-trigger").click();
  await expect(page.getByTestId("conversation-details-share")).toBeVisible();
  await captureScreenshot(page, testInfo, "12a-team-bot-share");
});
