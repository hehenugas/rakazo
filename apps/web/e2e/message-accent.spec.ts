import { expect, test } from "@playwright/test";
import { captureScreenshot, completeOnboarding, openUserSettings, signup } from "./helpers";

test("1:1 user messages take the Bot's color until Accent to Black is on", async ({
  page,
}, testInfo) => {
  await signup(page, `accent-${Date.now()}@rakazo.test`, "password12", "Accent QA");
  await completeOnboarding(page, testInfo);

  const composer = page.getByRole("combobox", { name: /^Message/ });
  await composer.fill("Hello from the accent test");
  await composer.press("Enter");
  const bubble = page.getByTestId("message-user-bubble").filter({ hasText: "Hello from" });
  await expect(bubble).toBeVisible();
  await expect(bubble).toHaveAttribute("data-accent", "bot");
  const neutral = await page.evaluate(() => {
    const probe = document.createElement("div");
    probe.className = "bg-chat-user";
    document.body.append(probe);
    const color = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return color;
  });
  const accented = await bubble.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(accented).not.toBe(neutral);
  await captureScreenshot(page, testInfo, "message-accent-bot-color");

  const settings = await openUserSettings(page);
  const toggle = settings.getByTestId("accent-to-black-toggle");
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  await settings.getByRole("button", { name: "Close user settings" }).click();

  await expect(bubble).not.toHaveAttribute("data-accent", "bot");
  expect(await bubble.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
    neutral,
  );
  await captureScreenshot(page, testInfo, "message-accent-to-black");

  // The choice survives a reload.
  await page.reload();
  await expect(
    page.getByTestId("message-user-bubble").filter({ hasText: "Hello from" }),
  ).not.toHaveAttribute("data-accent", "bot");
});
