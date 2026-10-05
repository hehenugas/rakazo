import { expect, type Page, test } from "@playwright/test";
import { rpc } from "../helpers";
import { openParityWorkspace } from "./fixtures";

/**
 * M2 canonical composer states (phase 12, P12-19). Element-level screenshots of
 * `[data-testid="composer-bar"]` — no volatile content inside the composer, so
 * every state is compared against its committed baseline.
 */

const COMPOSER = '[data-testid="composer-bar"]';

async function expectComposerScreenshot(page: Page, stateId: string) {
  await expect(page.locator(COMPOSER)).toHaveScreenshot(`${stateId}.png`, {
    maxDiffPixelRatio: 0.02,
    animations: "disabled",
    caret: "hide",
  });
}

async function openComposer(page: Page) {
  return page.locator(`${COMPOSER} [contenteditable], ${COMPOSER} textarea`).first();
}

test("composer empty", async ({ page }) => {
  await openParityWorkspace(page, "parity-composer@rakazo.test", "Parity Composer");
  await expect(page.locator(COMPOSER)).toBeVisible();
  await expectComposerScreenshot(page, "c1-composer-empty");
});

test("composer with text", async ({ page }) => {
  await openParityWorkspace(page, "parity-composer-text@rakazo.test", "Parity Composer T");
  const composer = await openComposer(page);
  await composer.fill("summarize the latest deployment report");
  await expectComposerScreenshot(page, "c2-composer-text");
});

test("composer multiline", async ({ page }) => {
  await openParityWorkspace(page, "parity-composer-multi@rakazo.test", "Parity Composer M");
  const composer = await openComposer(page);
  await composer.fill("first line");
  await composer.pressSequentially("\nsecond line\nthird line");
  await expectComposerScreenshot(page, "c3-composer-multiline");
});

test("composer with inserted mention", async ({ page }) => {
  await openParityWorkspace(page, "parity-composer-mention@rakazo.test", "Parity Composer R");
  const composer = await openComposer(page);
  await composer.fill("@Ch");
  const picker = page.getByTestId("mention-picker");
  await expect(picker).toBeVisible();
  await composer.press("Enter");
  await expect(page.getByTestId("mention-picker")).toHaveCount(0);
  await expectComposerScreenshot(page, "c4-composer-mention");
});

test("composer with pasted attachment", async ({ page }) => {
  await openParityWorkspace(page, "parity-composer-attach@rakazo.test", "Parity Composer A");
  const composer = await openComposer(page);
  await composer.click();
  await page.evaluate(() => {
    const target = document.querySelector(
      '[data-testid="composer-bar"] textarea, [data-testid="composer-bar"] [contenteditable]',
    );
    if (!target) throw new Error("composer textarea not found");
    const bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
    const file = new File([bytes], "parity-brief.png", { type: "image/png" });
    const clipboardData = {
      files: [file],
      types: ["Files"],
      items: [{ kind: "file" }],
      getData: () => "",
    };
    const event = new Event("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "clipboardData", { value: clipboardData });
    target.dispatchEvent(event);
  });
  await expect(page.getByRole("button", { name: "Remove parity-brief.png" })).toBeVisible();
  await expectComposerScreenshot(page, "c5-composer-attachment");
});

test("composer while recording a voice memo", async ({ page }) => {
  await openParityWorkspace(page, "parity-composer-voice@rakazo.test", "Parity Composer V");
  // Headless Chromium uses the fake media device, so the recording state is
  // deterministic.
  await page.getByRole("button", { name: "Record voice memo" }).click();
  await expect(page.getByRole("button", { name: "Stop voice memo" })).toBeVisible();
  await expectComposerScreenshot(page, "c6-composer-voice");
  await page.getByRole("button", { name: "Stop voice memo" }).click();
  await expect(page.getByTestId("voice-memo-card").first()).toBeVisible({ timeout: 30_000 });
});

test("composer while a run is active", async ({ page }) => {
  const botId = await openParityWorkspace(
    page,
    "parity-composer-running@rakazo.test",
    "Parity Composer R",
  );
  const composer = await openComposer(page);
  // The scripted runtime hangs on this prompt, keeping send/stop observable.
  await composer.fill("keep working on the parity fixture until i stop you");
  await page.keyboard.press("Enter");
  await expect
    .poll(
      async () => {
        const result = await rpc<{ run?: { status?: string } | null }>(page, "threads/get", {
          botId,
        });
        return result.run?.status ?? "idle";
      },
      { timeout: 30_000, intervals: [200] },
    )
    .toBe("running");
  await expectComposerScreenshot(page, "c7-composer-running");
  await rpc(page, "threads/stop", { botId });
  await expect
    .poll(
      async () => {
        const result = await rpc<{ run?: { status?: string } | null }>(page, "threads/get", {
          botId,
        });
        return result.run?.status ?? "idle";
      },
      { timeout: 30_000, intervals: [200] },
    )
    .toBe("idle");
});
