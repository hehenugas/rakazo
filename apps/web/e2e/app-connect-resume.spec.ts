import { expect, test } from "@playwright/test";
import { captureScreenshot, completeOnboarding, signup } from "./helpers";

test("a bot that needs an app asks for sign-in and resumes once it connects", async ({
  page,
}, testInfo) => {
  await signup(page, `app-resume-${Date.now()}@rakazo.test`, "password12", "Resume");
  await completeOnboarding(page);

  const composer = page.getByPlaceholder(/Message/);
  await composer.fill("This needs sign-in: please sign in to Slack to continue");
  await page.keyboard.press("Enter");

  const card = page.getByRole("group", { name: "Slack connection" }).last();
  await expect(page.getByText("Connect Slack to continue")).toBeVisible({ timeout: 30_000 });
  await expect(card.getByRole("button", { name: "Authorize" })).toBeVisible();
  await captureScreenshot(page, testInfo, "60-app-connect-waiting");

  await card.getByRole("button", { name: "Authorize" }).click();
  await expect(card.getByText("Connected", { exact: true })).toBeVisible();

  // No further action: the paused run continues on its own.
  await expect(page.getByText(/Selected choice connected/).first()).toBeVisible({
    timeout: 30_000,
  });
  await captureScreenshot(page, testInfo, "61-app-connect-resumed");
});
