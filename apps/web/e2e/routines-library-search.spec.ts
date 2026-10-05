import { expect, type Page, test } from "@playwright/test";
import { captureScreenshot, completeOnboarding, rpc, signup } from "./helpers";

async function saveRoutine(page: Page, procedure: "routines/create" | "routines/update") {
  const saved = page.waitForResponse(
    (response) => response.url().includes(`/rpc/${procedure}`) && response.ok(),
  );
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await saved;
  await expect(page.getByRole("button", { name: "Save", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Back" }).click();
}

test("Routines create, edit, and test-run through Conversation Details", async ({
  page,
}, testInfo) => {
  const stamp = Date.now();
  await signup(page, `routines-details-${stamp}@rakazo.test`, "password12", "Routines");
  await completeOnboarding(page);

  await page.getByTestId("bot-settings-trigger").click();
  await expect(page.getByTestId("conversation-details")).toBeVisible();
  await page.getByTestId("conversation-details-routines").click();
  const routines = page.getByTestId("bot-routines");
  await expect(routines).toBeVisible();
  await expect(routines.getByText("No routines yet")).toBeVisible();

  await routines.getByTestId("routine-create-button").click();
  await page.locator("label:has-text('Name') input").fill("Daily digest");
  await page.getByRole("button", { name: "Add trigger" }).click();
  await page.getByRole("menuitem", { name: "On a schedule" }).hover();
  await page.getByRole("menuitem", { name: "Every day", exact: true }).click();
  await saveRoutine(page, "routines/create");
  const row = routines.getByRole("button", { name: /Daily digest/ });
  await expect(row).toBeVisible();
  await captureScreenshot(page, testInfo, "07-routines-through-details");

  await row.click();
  await page.locator("label:has-text('Name') input").fill("Daily digest v2");
  await saveRoutine(page, "routines/update");
  await expect(routines.getByRole("button", { name: /Daily digest v2/ })).toBeVisible();

  await routines.getByRole("button", { name: /Daily digest v2/ }).click();
  await page.getByRole("button", { name: "Test run" }).click();
  await expect(page.getByText("Running…")).toBeVisible({ timeout: 15_000 });
});

test("Library groups artifacts and Search groups results in Grok order", async ({
  page,
}, testInfo) => {
  const stamp = Date.now();
  await signup(page, `library-search-${stamp}@rakazo.test`, "password12", "Library");
  await completeOnboarding(page);

  const botId = new URL(page.url()).pathname.split("/").pop() as string;
  await rpc(page, "artifacts/create", {
    botId,
    name: "runbook.pdf",
    mimeType: "application/pdf",
    contentBase64: Buffer.from("runbook").toString("base64"),
  });

  await page.getByTestId("bot-settings-trigger").click();
  await page.getByTestId("conversation-details-library").click();
  const library = page.getByTestId("bot-library");
  await expect(library.getByText("Today")).toBeVisible();
  await expect(library.getByText("runbook.pdf")).toBeVisible();
  await captureScreenshot(page, testInfo, "08-library-today-bucket");

  await library.getByRole("button", { name: /runbook\.pdf/ }).click();
  await expect(page).toHaveURL(/\/app\/artifacts\//);
  // The artifact page leaves the app shell; go back before driving the sidebar.
  await page.goBack();
  await expect(page.getByTestId("sidebar-search-trigger")).toBeVisible();

  const searchTrigger = page.getByTestId("sidebar-search-trigger");
  await searchTrigger.click();
  await page.getByTestId("sidebar-search").locator("input").fill("Chief");
  const results = page.getByTestId("bot-search-results");
  await expect(results.getByText("Bots")).toBeVisible({ timeout: 10_000 });
  await expect(results.getByText("Chief").first()).toBeVisible();
  await captureScreenshot(page, testInfo, "09-search-grouped-order");
});
