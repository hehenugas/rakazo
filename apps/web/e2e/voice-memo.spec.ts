import { expect, test } from "@playwright/test";
import { captureScreenshot, completeOnboarding, signup } from "./helpers";

test("voice memo records, sends, and plays back", async ({ page }, testInfo) => {
  const stamp = Date.now();
  await signup(page, `voice-memo-${stamp}@rakazo.test`, "password12", "Voice");
  await completeOnboarding(page);

  // Headless Chromium uses the fake media device, so recording is deterministic.
  await page.getByRole("button", { name: "Record voice memo" }).click();
  await page.getByRole("button", { name: "Stop voice memo" }).click();

  const memo = page.getByTestId("voice-memo-card").first();
  await expect(memo).toBeVisible({ timeout: 30_000 });
  await expect(memo.locator("audio")).toBeVisible({ timeout: 30_000 });
  await captureScreenshot(page, testInfo, "14-voice-memo-playback");
});
