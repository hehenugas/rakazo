import { expect, test } from "@playwright/test";
import { captureScreenshot, completeOnboarding, rpc, signup } from "./helpers";

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

test("voice memo transcript highlights during playback and seeks on click", async ({
  page,
}, testInfo) => {
  const stamp = Date.now();
  await signup(page, `voice-memo-sync-${stamp}@rakazo.test`, "password12", "Voice Sync");
  await completeOnboarding(page);

  // Scripted voice returns a deterministic transcript with segment timing.
  await rpc(page, "voice/connect", { provider: "scripted", apiKey: "fake-scripted-voice-key" });
  await page.reload();

  await page.getByRole("button", { name: "Record voice memo" }).click();
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: "Stop voice memo" }).click();

  const memo = page.getByTestId("voice-memo-card").first();
  const segments = memo.getByTestId("voice-memo-segment");
  await expect(segments).toHaveCount(2, { timeout: 30_000 });
  await expect(segments.nth(0)).toHaveText("hello from");
  await expect(segments.nth(1)).toHaveText("the test microphone");
  // The transcript is shown once, not repeated as a caption bubble.
  await expect(page.getByTestId("message-user-bubble")).toHaveCount(0);

  await segments.nth(1).click();
  await expect(segments.nth(1)).toHaveAttribute("aria-current", "true");
  const currentTime = await memo.locator("audio").evaluate((audio) => audio.currentTime);
  expect(currentTime).toBeGreaterThanOrEqual(0.4);
  await captureScreenshot(page, testInfo, "14-voice-memo-transcript-seek");
});

test("voice memo transcript degrades to plain text when the provider returns no timing", async ({
  page,
}) => {
  await signup(page, `voice-memo-plain-${Date.now()}@rakazo.test`, "password12", "Voice Plain");
  await completeOnboarding(page);
  await rpc(page, "voice/connect", { provider: "scripted", apiKey: "fake-scripted-voice-key" });
  await page.reload();
  await page.route("**/api/voice/transcribe", (route) =>
    route.fulfill({ json: { text: "plain words only" } }),
  );

  await page.getByRole("button", { name: "Record voice memo" }).click();
  await page.getByRole("button", { name: "Stop voice memo" }).click();

  const memo = page.getByTestId("voice-memo-card").first();
  await expect(memo.getByTestId("voice-memo-transcript")).toHaveText("plain words only", {
    timeout: 30_000,
  });
  await expect(memo.getByTestId("voice-memo-segment")).toHaveCount(0);
});
