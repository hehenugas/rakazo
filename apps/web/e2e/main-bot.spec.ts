import { expect, test } from "@playwright/test";
import { captureScreenshot, completeOnboarding, signup } from "./helpers";

test("Main Bot selection shows the roster star and toggles off", async ({ page }, testInfo) => {
  const stamp = Date.now();
  await signup(page, `main-bot-${stamp}@rakazo.test`, "password12", "Main Bot");
  await completeOnboarding(page);

  const aside = page.locator("aside").first();
  await expect(aside.getByRole("button", { name: /Chief/ }).first()).toBeVisible();
  await expect(aside.getByLabel("Main Bot")).toHaveCount(0);

  await page.getByTestId("bot-settings-trigger").click();
  await expect(page.getByTestId("conversation-details")).toBeVisible();
  const toggle = page.getByTestId("conversation-details-main-bot");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(aside.getByLabel("Main Bot").first()).toBeVisible();
  await captureScreenshot(page, testInfo, "13-main-bot-selected");

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(aside.getByLabel("Main Bot")).toHaveCount(0);
});
