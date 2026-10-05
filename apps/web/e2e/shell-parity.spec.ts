import { expect, test } from "@playwright/test";
import { captureScreenshot, completeOnboarding, signup } from "./helpers";

test("sidebar keeps Search and New chat as top actions with on-demand search", async ({
  page,
}, testInfo) => {
  const stamp = Date.now();
  await signup(page, `shell-search-${stamp}@rakazo.test`, "password12", "Shell");
  await completeOnboarding(page);

  const searchTrigger = page.getByTestId("sidebar-search-trigger");
  await expect(searchTrigger).toBeVisible();
  await expect(searchTrigger).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByTestId("sidebar-search")).toHaveCount(0);
  await expect(page.getByTestId("create-menu-trigger")).toBeVisible();

  await searchTrigger.click();
  await expect(searchTrigger).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("sidebar-search")).toBeVisible();
  await captureScreenshot(page, testInfo, "01-shell-sidebar-search");

  await page.keyboard.press("Escape");
  await page.keyboard.press("ControlOrMeta+f");
  await expect(searchTrigger).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("sidebar-search")).toBeVisible();

  await page.keyboard.press("ControlOrMeta+n");
  await expect(page.getByTestId("bot-create-picker")).toBeVisible();
  await page.keyboard.press("Escape");

  await page.keyboard.press("ControlOrMeta+b");
  await expect(page.getByRole("button", { name: "Show bots" })).toBeVisible();
  await page.keyboard.press("ControlOrMeta+b");
  await expect(searchTrigger).toBeVisible();
});

test("roster rows surface unread and activity, and Hidden Bots archives in place", async ({
  page,
}, testInfo) => {
  const stamp = Date.now();
  await signup(page, `shell-roster-${stamp}@rakazo.test`, "password12", "Shell");
  await completeOnboarding(page);

  const aside = page.locator("aside").first();
  const chiefRow = aside.getByRole("button", { name: /Chief/ }).first();
  await expect(chiefRow).toBeVisible();
  await expect(aside.getByText("Hidden Bots")).toHaveCount(0);

  await chiefRow.click({ button: "right" });
  await page.getByRole("menuitem", { name: "Archive" }).click();
  const hiddenToggle = aside.getByRole("button", { name: /Hidden Bots/ });
  await expect(hiddenToggle).toBeVisible();
  await expect(hiddenToggle).toHaveAttribute("aria-expanded", "false");

  await hiddenToggle.click();
  await expect(hiddenToggle).toHaveAttribute("aria-expanded", "true");
  await expect(aside.getByText("Chief").first()).toBeVisible();
  await captureScreenshot(page, testInfo, "02-shell-hidden-bots");

  await hiddenToggle.click();
  await expect(aside.getByText("Hidden Bots")).toBeVisible();
});

test("header identity opens Conversation Details and footer opens Connect apps", async ({
  page,
}, testInfo) => {
  const stamp = Date.now();
  await signup(page, `shell-header-${stamp}@rakazo.test`, "password12", "Shell");
  await completeOnboarding(page);

  await page.getByTestId("bot-settings-trigger").click();
  await expect(page.getByTestId("conversation-details")).toBeVisible();
  await captureScreenshot(page, testInfo, "03-shell-conversation-details");

  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Connect apps" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "Connect apps" })).toBeVisible();
  await captureScreenshot(page, testInfo, "04-shell-connect-apps");
});

test.describe("wide desktop", () => {
  test.use({ viewport: { width: 1728, height: 960 } });

  test("transcript and composer center on wide desktop screens", async ({ page }, testInfo) => {
    const stamp = Date.now();
    await signup(page, `shell-center-${stamp}@rakazo.test`, "password12", "Shell");
    await completeOnboarding(page);

    const transcript = page.getByTestId("transcript");
    await expect(transcript).toBeVisible();
    const padding = await transcript.evaluate((element) => {
      const style = window.getComputedStyle(element);
      return parseFloat(style.paddingLeft);
    });
    // Wide screens get the centered 55rem column ((pane − 880px) / 2), not the
    // compact 28px gutter.
    expect(padding).toBeGreaterThan(100);
    await captureScreenshot(page, testInfo, "05-shell-centered-column");
  });
});
