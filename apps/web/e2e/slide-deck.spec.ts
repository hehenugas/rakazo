import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { captureScreenshot, completeOnboarding, signup } from "./helpers";

test("a Bot builds a slide deck that previews in chat and downloads as PowerPoint", async ({
  page,
}, testInfo) => {
  await signup(page, `slides-${Date.now()}@rakazo.test`, "password12", "Slides QA");
  await completeOnboarding(page);

  const composer = page.getByPlaceholder(/Message/);
  await composer.fill("please build a slide deck about the launch");
  await page.keyboard.press("Enter");

  const card = page.getByTestId("deck-card");
  await expect(card).toBeVisible({ timeout: 30_000 });
  await expect(card.getByText("Launch plan")).toBeVisible();
  await expect(card.getByText("3 slides")).toBeVisible();
  const slides = card.getByTestId("deck-slides").locator(":scope > li");
  await expect(slides).toHaveCount(3);
  await expect(slides.nth(0)).toContainText("Why now");
  await expect(slides.nth(0)).toContainText("Market is ready");
  await captureScreenshot(page, testInfo, "slide-deck-card");

  const downloaded = page.waitForEvent("download");
  await card.getByRole("button", { name: "PowerPoint" }).click();
  const download = await downloaded;
  expect(download.suggestedFilename()).toBe("launch-plan.pptx");
  const bytes = await readFile(await download.path());
  // A .pptx is a zip archive.
  expect(bytes.subarray(0, 2).toString()).toBe("PK");
  expect(bytes.length).toBeGreaterThan(10_000);
  await expect(card.getByRole("alert")).toHaveCount(0);
});

test("asking again for the same deck adds a version instead of a second artifact", async ({
  page,
}) => {
  await signup(page, `slides-versions-${Date.now()}@rakazo.test`, "password12", "Slides QA");
  await completeOnboarding(page);

  const composer = page.getByPlaceholder(/Message/);
  for (const round of [1, 2]) {
    await composer.fill(`please build a slide deck about the launch (round ${round})`);
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("deck-card")).toHaveCount(round, { timeout: 30_000 });
  }

  const artifacts = await page.evaluate(async () => {
    const response = await fetch("/rpc/artifacts/listSpace", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ json: {} }),
    });
    return (await response.json()) as { json: { items: { name: string; versionCount: number }[] } };
  });
  const decks = artifacts.json.items.filter((item) => item.name === "launch-plan.deck.json");
  expect(decks).toHaveLength(1);
  expect(decks[0]?.versionCount).toBe(2);
});
