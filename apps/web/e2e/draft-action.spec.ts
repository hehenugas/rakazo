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
  await expect(toField).not.toBeEditable();

  await card.getByRole("button", { name: "Edit" }).click();
  await expect(toField).toBeEditable();
  await card.getByRole("button", { name: "Save" }).click();
  await expect(toField).not.toBeEditable();

  const submitted = page.waitForResponse((response) =>
    response.url().includes("/rpc/threads/submitDraftAction"),
  );
  await card.getByRole("button", { name: "Send" }).click();
  await submitted;
  await expect(card.getByText("submitted", { exact: true })).toBeVisible({
    timeout: 30_000,
  });
  // The roster preview echoes the reply, so assert inside the transcript.
  await expect(
    page
      .getByTestId("transcript")
      .getByText("done. the submitted action went out through the connected provider."),
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
  await expect(card.getByText("discarded", { exact: true })).toBeVisible({
    timeout: 15_000,
  });
  await captureScreenshot(page, testInfo, "11-draft-action-discarded");
});

test("formatted email draft: preview, validation, and one approved send", async ({
  page,
}, testInfo) => {
  await signup(page, `draft-format-${Date.now()}@rakazo.test`, "password12", "Drafts");
  await completeOnboarding(page);

  const composer = page.getByPlaceholder(/Message/);
  await composer.fill("please draft a formatted email to the team");
  await page.keyboard.press("Enter");

  const card = page.getByTestId("draft-action-card");
  await expect(card).toBeVisible({ timeout: 30_000 });
  const preview = card.getByTestId("draft-email-preview");
  await expect(preview.getByRole("heading", { name: "Status" })).toBeVisible();
  await expect(preview.locator("strong")).toHaveText("on track");
  await expect(preview.getByRole("listitem")).toHaveCount(2);
  await captureScreenshot(page, testInfo, "draft-email-formatted-preview");

  // An invalid recipient blocks Send and says why.
  await card.getByRole("button", { name: "Edit" }).click();
  const to = card.getByRole("textbox", { name: "To" });
  await to.fill("not-an-address");
  await expect(card.getByText("Invalid address")).toBeVisible();
  await expect(card.getByRole("button", { name: "Send" })).toBeDisabled();
  await to.fill("team@example.test, lead@example.test");
  await expect(card.getByRole("button", { name: "Send" })).toBeEnabled();

  // Send goes through the server once; the card then freezes.
  let submits = 0;
  page.on("request", (request) => {
    if (request.url().includes("/rpc/threads/submitDraftAction")) submits += 1;
  });
  const submitted = page.waitForResponse((response) =>
    response.url().includes("/rpc/threads/submitDraftAction"),
  );
  await card.getByRole("button", { name: "Send" }).click();
  expect((await submitted).ok()).toBe(true);
  await expect(card.getByText("submitted", { exact: true })).toBeVisible({ timeout: 30_000 });
  await expect(card.getByRole("button", { name: "Send" })).toHaveCount(0);
  await expect(
    page
      .getByTestId("transcript")
      .getByText("done. the submitted action went out through the connected provider."),
  ).toBeVisible({ timeout: 30_000 });
  expect(submits).toBe(1);
});
