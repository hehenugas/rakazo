import { expect, test } from "@playwright/test";
import { captureScreenshot, completeOnboarding, signup } from "./helpers";

test("email draft: edit, save, submit, and sent state", async ({ page }, testInfo) => {
  const stamp = Date.now();
  await signup(page, `draft-email-${stamp}@rakazo.test`, "password12", "Drafts");
  await completeOnboarding(page);

  const composer = page.getByPlaceholder(/Message/);
  await composer.fill("please draft an email to the client about the intro call");
  await page.keyboard.press("Enter");

  const card = page.getByTestId("draft-action-card");
  await expect(card).toBeVisible({ timeout: 30_000 });
  await expect(card.getByText("Intro call follow-up")).toBeVisible();
  const toField = card.getByRole("textbox", { name: "To" });
  await expect(toField).toHaveValue("client@example.test");
  await expect(toField).toBeReadOnly();

  await card.getByRole("button", { name: "Edit" }).click();
  await expect(toField).toBeEditable();
  await card.getByRole("button", { name: "Save" }).click();
  await expect(toField).toBeReadOnly();

  const submitted = card.waitForResponse((response) =>
    response.url().includes("/rpc/threads/updateDraftAction"),
  );
  await card.getByRole("button", { name: "Send" }).click();
  await submitted;
  await expect(card.getByText("submitted", { exact: true })).toBeVisible({ timeout: 30_000 });
  await expect(
    page.getByText("done. the submitted action went out through the connected provider."),
  ).toBeVisible({ timeout: 30_000 });
  await captureScreenshot(page, testInfo, "10-draft-action-submitted");
});

test("slack draft: discard keeps the message from sending", async ({ page }, testInfo) => {
  const stamp = Date.now();
  await signup(page, `draft-slack-${stamp}@rakazo.test`, "password12", "Drafts");
  await completeOnboarding(page);

  const composer = page.getByPlaceholder(/Message/);
  await composer.fill("draft a slack message for standup");
  await page.keyboard.press("Enter");

  const card = page.getByTestId("draft-action-card");
  await expect(card).toBeVisible({ timeout: 30_000 });
  await expect(card.getByText("Standup note")).toBeVisible();

  await card.getByRole("button", { name: "Discard" }).click();
  await expect(card.getByText("discarded", { exact: true })).toBeVisible({ timeout: 15_000 });
  await captureScreenshot(page, testInfo, "11-draft-action-discarded");
});
