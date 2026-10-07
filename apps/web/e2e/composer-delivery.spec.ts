import { expect, test } from "@playwright/test";
import { captureScreenshot, completeOnboarding, signup } from "./helpers";

// The composer textarea carries role="combobox", so target it structurally —
// getByPlaceholder also breaks once the draft is non-empty.
const composer = (page: import("@playwright/test").Page) =>
  page.locator("[data-testid='composer-bar'] textarea");

test("composer lists continue on Shift+Enter, nest on Tab, and send on Enter", async ({
  page,
}, testInfo) => {
  const stamp = Date.now();
  await signup(page, `composer-list-${stamp}@rakazo.test`, "password12", "Composer Lists");
  await completeOnboarding(page);

  const box = composer(page);
  await box.pressSequentially("- buy milk");
  await box.press("Shift+Enter");
  await expect(box).toHaveValue("- buy milk\n- ");
  await box.pressSequentially("call the vet");
  await box.press("Tab");
  await expect(box).toHaveValue("- buy milk\n  - call the vet");

  // Plain Enter still sends — with the learned list text intact.
  await box.press("Enter");
  await expect(page.getByTestId("message-user-bubble").last()).toContainText(
    "- buy milk\n  - call the vet",
    { timeout: 30_000 },
  );
  await captureScreenshot(page, testInfo, "20-composer-list");
});

test("selection offers Add to prompt alongside Quote and fills the composer", async ({
  page,
}, testInfo) => {
  const stamp = Date.now();
  await signup(page, `composer-prompt-${stamp}@rakazo.test`, "password12", "Add To Prompt");
  await completeOnboarding(page);

  const box = composer(page);
  await box.fill("please echo this exact sentence back to me");
  await box.press("Enter");
  await expect(page.getByTestId("message-bot-bubble").first()).toBeVisible({ timeout: 30_000 });

  // The quote affordance only resolves when both selection endpoints sit in
  // one quote region — select an inner paragraph, not the whole bubble.
  const paragraph = page.getByTestId("message-bot-bubble").first().locator("p").last();
  await paragraph.selectText();
  const addToPrompt = page.getByTestId("add-to-prompt");
  await expect(addToPrompt).toBeVisible();
  await addToPrompt.click();

  await expect(box).toHaveValue(/^> .+\n$/s);
  await expect(box).not.toHaveValue(/Replying to/);
  await captureScreenshot(page, testInfo, "20-add-to-prompt");
});

test("a failed send shows Failed to send with Resend delivering the message", async ({
  page,
}, testInfo) => {
  const stamp = Date.now();
  await signup(page, `composer-resend-${stamp}@rakazo.test`, "password12", "Failed Resend");
  await completeOnboarding(page);

  const box = composer(page);
  // A synthesized 500 is deterministic: the request never reaches the network,
  // so the send is guaranteed to fail without an abort/transmission race.
  await page.route("**/rpc/threads/send", (route) =>
    route.fulfill({ status: 500, body: "send failed" }),
  );
  await box.fill("this message will fail once");
  await box.press("Enter");

  // The bubble appears immediately; the failure lands on the bubble itself.
  const bubble = page.getByTestId("message-user-bubble").last();
  await expect(bubble).toContainText("this message will fail once", { timeout: 30_000 });
  const failedRow = page.getByTestId("message-send-failed");
  await expect(failedRow).toBeVisible({ timeout: 30_000 });
  await expect(failedRow).toContainText("Failed to send");
  await expect(failedRow).toContainText("Resend");
  await expect(failedRow).toContainText("Delete");
  await captureScreenshot(page, testInfo, "20-failed-to-send");

  // The failed state survives a reload — Resend/Delete stay actionable.
  await page.reload();
  const reloadedRow = page.getByTestId("message-send-failed");
  await expect(reloadedRow).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("message-user-bubble").last()).toContainText(
    "this message will fail once",
  );

  // Resend delivers through the same nonce — no duplicate bubble.
  await page.unroute("**/rpc/threads/send");
  // The delivered resend reconciles the echo away instantly, which can detach
  // the row mid-click — dispatch the click instead of racing actionability.
  await reloadedRow.getByTestId("resend-failed").dispatchEvent("click");
  await expect(page.getByTestId("message-send-failed")).toHaveCount(0, { timeout: 30_000 });
  await expect(page.getByTestId("message-user-bubble")).toHaveCount(1);
});

test("deleting a failed send restores its text to the composer", async ({ page }, testInfo) => {
  const stamp = Date.now();
  await signup(page, `composer-delete-${stamp}@rakazo.test`, "password12", "Failed Delete");
  await completeOnboarding(page);

  const box = composer(page);
  // A synthesized 500 is deterministic: the request never reaches the network,
  // so the send is guaranteed to fail without an abort/transmission race.
  await page.route("**/rpc/threads/send", (route) =>
    route.fulfill({ status: 500, body: "send failed" }),
  );
  await box.fill("second failing message");
  await box.press("Enter");

  const failedRow = page.getByTestId("message-send-failed");
  await expect(failedRow).toBeVisible({ timeout: 30_000 });
  await failedRow.getByTestId("delete-failed").click();
  await page.unroute("**/rpc/threads/send");
  await expect(page.getByTestId("message-send-failed")).toHaveCount(0);
  // The deleted echo was the only user bubble; nothing durable remains.
  await expect(page.getByTestId("message-user-bubble")).toHaveCount(0);
  // Deleted text returns to the composer so nothing the user typed is lost.
  await expect(box).toHaveValue(/second failing message/);
});
