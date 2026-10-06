import { expect, type Page, test } from "@playwright/test";
import { completeOnboarding, openSidebarSearch, rpc, signup } from "../helpers";
import {
  attachJson,
  captureParityState,
  measureShellGeometry,
  PARITY_MOBILE_VIEWPORT,
  PARITY_NARROW_VIEWPORT,
  PARITY_PROMPTS,
  PARITY_VIEWPORT,
  parityMaskLocators,
  seedParityBot,
} from "./fixtures";

/**
 * M2 canonical-state captures (phase 10).
 *
 * Stable states are screenshot-compared against committed baselines with the
 * documented masks and tolerance. Volatile states (working, waiting, streamed
 * replies) are captured as evidence only — pixel-diffing them would require
 * masking structural UI, which the phase 10 contract forbids. Their behavior
 * is verified by the dedicated specs referenced in the parity matrix.
 */

const DIFF_TOLERANCE = 0.02;

async function expectParityScreenshot(
  page: Page,
  stateId: string,
  extraMasks: Parameters<Page["locator"]>[] = [],
) {
  await expect(page).toHaveScreenshot(`${stateId}.png`, {
    maxDiffPixelRatio: DIFF_TOLERANCE,
    mask: [...parityMaskLocators(page), ...extraMasks.map((locator) => locator(page))],
    animations: "disabled",
    caret: "hide",
  });
}

test("idle conversation with the onboarding choice card", async ({ page }, testInfo) => {
  await signup(page, "parity-idle@rakazo.test", "password12", "Parity Idle");
  await completeOnboarding(page);
  await page.setViewportSize(PARITY_VIEWPORT);
  await expect(page.getByTestId("composer-bar")).toBeVisible();
  await expectParityScreenshot(page, "01-idle-conversation");
  await captureParityState(page, testInfo, "01-idle-conversation");
  await attachJson(
    testInfo,
    "idle-conversation-measurements.json",
    await measureShellGeometry(page),
  );
});

test("sidebar search open with a query", async ({ page }) => {
  await signup(page, "parity-search@rakazo.test", "password12", "Parity Search");
  await completeOnboarding(page);
  await seedParityBot(page, "Research Crew", "Research assistant", "#6366F1::shape_1");
  await page.setViewportSize(PARITY_VIEWPORT);
  await page.reload();
  await expect(page.getByTestId("composer-bar")).toBeVisible();
  const input = await openSidebarSearch(page);
  await input.fill("research");
  await expect(page.getByRole("button", { name: /Research Crew/ }).first()).toBeVisible();
  await expectParityScreenshot(page, "02-search-open");
});

test("new chat picker open", async ({ page }) => {
  await signup(page, "parity-new-chat@rakazo.test", "password12", "Parity New Chat");
  await completeOnboarding(page);
  await page.setViewportSize(PARITY_VIEWPORT);
  await expect(page.getByTestId("composer-bar")).toBeVisible();
  await page.getByTestId("create-menu-trigger").click();
  await expect(page.getByTestId("bot-create-picker")).toBeVisible();
  await expectParityScreenshot(page, "03-new-chat-open");
});

test("conversation details home", async ({ page }) => {
  await signup(page, "parity-details@rakazo.test", "password12", "Parity Details");
  await completeOnboarding(page);
  await page.setViewportSize(PARITY_VIEWPORT);
  await expect(page.getByTestId("composer-bar")).toBeVisible();
  await page.getByTestId("bot-settings-trigger").click();
  await expect(page.getByTestId("conversation-details")).toBeVisible();
  await expectParityScreenshot(page, "04-conversation-details-home");
});

test("tasks list and project detail", async ({ page }) => {
  await signup(page, "parity-tasks@rakazo.test", "password12", "Parity Tasks");
  await completeOnboarding(page);
  const botId = new URL(page.url()).pathname.split("/").filter(Boolean).at(-1) as string;
  const project = await rpc<{ id: string }>(page, "projects/create", {
    botId,
    title: "Quarterly report",
    objective: "Draft, review, and send the quarterly report.",
    plan: ["Collect metrics", "Draft summary", "Send to stakeholders"],
  });
  await page.setViewportSize(PARITY_VIEWPORT);
  await page.reload();
  await page.getByTestId("bot-settings-trigger").click();
  await page.getByTestId("conversation-details-tasks").click();
  await expect(page.getByTestId("bot-tasks").getByText("Quarterly report")).toBeVisible();
  await expectParityScreenshot(page, "05-tasks-list");
  await page
    .getByTestId("bot-tasks")
    .getByRole("button", { name: /Quarterly report/ })
    .click();
  await expect(page.getByTestId("project-detail")).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`panel=tasks&project=${project.id}`));
  await expectParityScreenshot(page, "06-project-detail");
});

test("routines list with a seeded routine", async ({ page }) => {
  await signup(page, "parity-routines@rakazo.test", "password12", "Parity Routines");
  await completeOnboarding(page);
  const botId = new URL(page.url()).pathname.split("/").filter(Boolean).at(-1) as string;
  await rpc(page, "routines/create", {
    botId,
    name: "Morning digest",
    prompt: "Send the morning digest",
    crons: ["0 9 * * 1-5"],
    timezone: "UTC",
    active: true,
    notify: true,
  });
  await page.setViewportSize(PARITY_VIEWPORT);
  await page.reload();
  await page.getByTestId("bot-settings-trigger").click();
  await page.getByTestId("conversation-details-routines").click();
  await expect(page.getByTestId("side-panel").getByText("Morning digest")).toBeVisible();
  await expectParityScreenshot(page, "07-routines-list");
});

test("library empty state", async ({ page }) => {
  await signup(page, "parity-library@rakazo.test", "password12", "Parity Library");
  await completeOnboarding(page);
  await page.setViewportSize(PARITY_VIEWPORT);
  await page.getByTestId("bot-settings-trigger").click();
  await page.getByTestId("conversation-details-library").click();
  await expect(page.getByTestId("side-panel")).toBeVisible();
  await expectParityScreenshot(page, "08-library");
});

test("connect apps catalog and plugin search", async ({ page }) => {
  await signup(page, "parity-connect@rakazo.test", "password12", "Parity Connect");
  await completeOnboarding(page);
  await page.setViewportSize(PARITY_VIEWPORT);
  await expect(page.getByTestId("composer-bar")).toBeVisible();
  await page.locator("aside").first().getByRole("button", { name: "Connect apps" }).click();
  await expect(page.getByPlaceholder("Search apps")).toBeVisible();
  await expectParityScreenshot(page, "09-connect-apps-catalog");
  await page.getByPlaceholder("Search apps").fill("git");
  await expect(page.getByText("GitHub", { exact: true })).toBeVisible();
  await expectParityScreenshot(page, "10-connect-apps-search");
});

test("team bot setup form and private instance", async ({ page }) => {
  await signup(page, "parity-team@rakazo.test", "password12", "Parity Team");
  await completeOnboarding(page);
  await page.setViewportSize(PARITY_VIEWPORT);
  await expect(page.getByTestId("composer-bar")).toBeVisible();

  await page.getByTestId("create-menu-trigger").click();
  await page.getByTestId("create-new-team-bot").click();
  const form = page.getByTestId("create-team-bot-form");
  await expect(form).toBeVisible();
  await expectParityScreenshot(page, "11-team-bot-setup");

  await form.locator("label:has-text('Name') input").fill("Research crew");
  await form.locator("label:has-text('Title') input").fill("Research assistant");
  await form.getByRole("button", { name: "Create Team Bot" }).click();
  await page.waitForURL(/\/app\/[^/]+$/);
  await expect(page.getByTestId("composer-bar")).toBeVisible();
  await expectParityScreenshot(page, "12-team-bot-instance");
});

test("main bot selected with roster star", async ({ page }) => {
  await signup(page, "parity-main-bot@rakazo.test", "password12", "Parity Main Bot");
  await completeOnboarding(page);
  await page.setViewportSize(PARITY_VIEWPORT);
  await expect(page.getByTestId("composer-bar")).toBeVisible();
  await page.getByTestId("bot-settings-trigger").click();
  await expect(page.getByTestId("conversation-details")).toBeVisible();
  const toggle = page.getByTestId("conversation-details-main-bot");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("aside").first().getByLabel("Main Bot").first()).toBeVisible();
  await expectParityScreenshot(page, "13-main-bot-selected");
});

test("roster with unread bot reply", async ({ page }, testInfo) => {
  await signup(page, "parity-unread@rakazo.test", "password12", "Parity Unread");
  await completeOnboarding(page);
  const other = await seedParityBot(page, "Inbox Sweep", "Inbox assistant", "#F97316::shape_2");
  await rpc(page, "threads/send", { botId: other.id, text: PARITY_PROMPTS.note });
  await page.setViewportSize(PARITY_VIEWPORT);
  // The reply lands and marks the non-active bot unread in the roster; the
  // sr-only marker is the stable signal (run timing itself is volatile, and
  // threads/get reports idle again once the short scripted run completes).
  await expect(page.locator("aside").first().getByText("(unread)")).toBeVisible({
    timeout: 60_000,
  });
  await page.reload();
  await expect(page.getByTestId("composer-bar")).toBeVisible();
  const unreadRow = page
    .locator("aside")
    .first()
    .getByRole("button", { name: /Inbox Sweep/ });
  await expect(unreadRow.first()).toBeVisible();
  await captureParityState(page, testInfo, "14-roster-unread");
  await expectParityScreenshot(page, "14-roster-unread");
});

test("working bot state", async ({ page }, testInfo) => {
  await signup(page, "parity-working@rakazo.test", "password12", "Parity Working");
  await completeOnboarding(page);
  await page.setViewportSize(PARITY_VIEWPORT);
  await expect(page.getByTestId("composer-bar")).toBeVisible();
  // "keep working" pins the scripted runtime in the running state, so the
  // transient working UI is observable deterministically.
  const botId = new URL(page.url()).pathname.split("/").filter(Boolean).at(-1) as string;
  await page
    .getByTestId("composer-bar")
    .getByRole("combobox")
    .fill("keep working on the parity fixture until i stop you");
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
  await captureParityState(page, testInfo, "15-working-bot");
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

test("waiting-for-user protected input", async ({ page }, testInfo) => {
  await signup(page, "parity-waiting@rakazo.test", "password12", "Parity Waiting");
  await completeOnboarding(page);
  await page.setViewportSize(PARITY_VIEWPORT);
  await expect(page.getByTestId("composer-bar")).toBeVisible();
  await page
    .getByTestId("composer-bar")
    .getByRole("combobox")
    .fill("install the gsc cli and sign in");
  await page.keyboard.press("Enter");
  const computerCard = page.getByTestId("computer-card");
  await expect(computerCard).toBeVisible({ timeout: 90_000 });
  await expect(computerCard.getByText("Needs you", { exact: true })).toBeVisible();
  await captureParityState(page, testInfo, "16-waiting-for-user");
});

test("completed scripted response in transcript", async ({ page }, testInfo) => {
  await signup(page, "parity-response@rakazo.test", "password12", "Parity Response");
  await completeOnboarding(page);
  await page.setViewportSize(PARITY_VIEWPORT);
  await expect(page.getByTestId("composer-bar")).toBeVisible();
  await page.getByTestId("composer-bar").getByRole("combobox").fill(PARITY_PROMPTS.note);
  await page.keyboard.press("Enter");
  // The streamed reply content is deterministic for the scripted runtime, so
  // wait on the transcript text rather than the transient run status.
  await expect(page.getByTestId("transcript")).toContainText(/parity-ok/i, {
    timeout: 120_000,
  });
  await captureParityState(page, testInfo, "17-normal-response");
});

test("editable email draft action", async ({ page }, testInfo) => {
  await signup(page, "parity-draft@rakazo.test", "password12", "Parity Draft");
  await completeOnboarding(page);
  await page.setViewportSize(PARITY_VIEWPORT);
  await expect(page.getByTestId("composer-bar")).toBeVisible();
  await page.getByTestId("composer-bar").getByRole("combobox").fill(PARITY_PROMPTS.email);
  await page.keyboard.press("Enter");
  const card = page.getByTestId("draft-action-card");
  await expect(card).toBeVisible({ timeout: 60_000 });
  await expect(card.getByText("Intro call follow-up")).toBeVisible();
  await captureParityState(page, testInfo, "18-editable-draft");
});

test("failed send presentation", async ({ page }, testInfo) => {
  await signup(page, "parity-failed@rakazo.test", "password12", "Parity Failed");
  await completeOnboarding(page);
  await page.setViewportSize(PARITY_VIEWPORT);
  await expect(page.getByTestId("composer-bar")).toBeVisible();
  // "fail this run" makes the scripted runtime throw deterministically.
  await page.getByTestId("composer-bar").getByRole("combobox").fill("fail this run");
  await page.getByRole("button", { name: "Send" }).click();
  const error = page.getByTestId("composer-error");
  await expect(error).toBeVisible({ timeout: 30_000 });
  await expect(error).toContainText("Scripted run failure");
  await captureParityState(page, testInfo, "21-failed-send");
});

test("narrow desktop idle", async ({ page }) => {
  await signup(page, "parity-narrow@rakazo.test", "password12", "Parity Narrow");
  await completeOnboarding(page);
  await page.setViewportSize(PARITY_NARROW_VIEWPORT);
  await expect(page.getByTestId("composer-bar")).toBeVisible();
  await expectParityScreenshot(page, "19-narrow-desktop-idle");
});

test("mobile idle", async ({ page }) => {
  await signup(page, "parity-mobile@rakazo.test", "password12", "Parity Mobile");
  await completeOnboarding(page);
  await page.setViewportSize(PARITY_MOBILE_VIEWPORT);
  await expect(page.getByTestId("composer-bar")).toBeVisible();
  await expectParityScreenshot(page, "20-mobile-idle");
});

test("geometry and typography measurements", async ({ page }, testInfo) => {
  await signup(page, "parity-measure@rakazo.test", "password12", "Parity Measure");
  await completeOnboarding(page);
  await page.setViewportSize(PARITY_VIEWPORT);
  await expect(page.getByTestId("composer-bar")).toBeVisible();
  const measurements = await measureShellGeometry(page);
  await attachJson(testInfo, "shell-geometry.json", measurements);
  const record = measurements as Record<string, { rect?: { width: number } } | null>;
  expect(record.sidebar?.rect?.width).toBeGreaterThan(200);
  expect(record.composer?.rect?.width).toBeGreaterThan(300);
});
