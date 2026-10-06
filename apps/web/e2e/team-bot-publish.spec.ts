import { expect, test } from "@playwright/test";
import { captureScreenshot, completeOnboarding, signup } from "./helpers";

test("personal bot publishes to a team draft, publishes, and unpublishes", async ({
  page,
}, testInfo) => {
  const stamp = Date.now();
  await signup(page, `team-publish-${stamp}@rakazo.test`, "password12", "Team Publish");
  await completeOnboarding(page);

  // Share → Publish to Team (Start fresh) creates an owner-only draft.
  await page.getByTestId("bot-settings-trigger").click();
  await page.getByTestId("conversation-details-share").click();
  await expect(page.getByTestId("share-panel")).toBeVisible();
  await page.getByTestId("publish-team-fresh").click();
  await page.waitForURL(/\/app\/[^/]+$/, { timeout: 30_000 });

  // Reload settles the navigation on the new instance with fresh state.
  const aside = page.locator("aside").first();
  await expect(aside.getByRole("button", { name: /^Chief/ })).toHaveCount(2);
  await page.reload();
  await page.getByTestId("bot-settings-trigger").click();
  const ownerPanel = page.getByTestId("team-bot-owner");
  await expect(ownerPanel).toContainText("Draft");
  await expect(ownerPanel).toContainText("Publish to team");
  await captureScreenshot(page, testInfo, "19-team-bot-draft");

  // The picker labels the owner's draft, and the shared setup editor is reachable.
  await page.getByTestId("create-menu-trigger").click();
  await expect(
    page.getByTestId("bot-create-picker").getByText("Draft", { exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByTestId("conversation-details-team-setup").click();
  await expect(page.getByTestId("team-setup-form")).toBeVisible();
  await page.getByTestId("team-setup-form").getByRole("button", { name: "Close" }).click();

  // Publish makes it available; Unpublish takes that away without deleting.
  await page.getByTestId("bot-settings-trigger").click();
  await page.getByTestId("team-bot-publish").click();
  await expect(ownerPanel).toContainText("Published to team");
  await expect(ownerPanel).toContainText("Unpublish");
  await captureScreenshot(page, testInfo, "19-team-bot-published");

  await page.getByTestId("team-bot-unpublish").click();
  await expect(ownerPanel).toContainText("Unpublished");
});

test("Copy Bot carries the shared identity into a new team draft", async ({ page }, testInfo) => {
  const stamp = Date.now();
  await signup(page, `team-copy-${stamp}@rakazo.test`, "password12", "Team Copy");
  await completeOnboarding(page);

  const personal = page
    .locator("aside")
    .first()
    .getByRole("button", { name: /^Chief/ });
  await personal.click();
  await page.getByTestId("bot-settings-trigger").click();
  await page.getByTestId("conversation-details-share").click();
  await page.getByTestId("publish-team-copy").click();
  await page.waitForURL(/\/app\/[^/]+$/, { timeout: 30_000 });

  // The team instance mirrors the copied identity; the source stays personal.
  await expect(
    page
      .locator("aside")
      .first()
      .getByRole("button", { name: /^Chief/ }),
  ).toHaveCount(2);
  await page.reload();
  await page.getByTestId("bot-settings-trigger").click();
  await expect(page.getByTestId("team-bot-owner")).toContainText("Draft");
  await captureScreenshot(page, testInfo, "19-team-bot-copy");
});
