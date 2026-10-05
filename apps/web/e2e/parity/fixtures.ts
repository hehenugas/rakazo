import { writeFile } from "node:fs/promises";
import { expect, type Page, type TestInfo } from "@playwright/test";
import { completeOnboarding, rpc, signup } from "../helpers";

/**
 * M2 parity contract viewports. Every canonical-state capture uses one of
 * these fixed sizes so phase 11-16 diffs compare like against like.
 */
export const PARITY_VIEWPORT = { width: 1440, height: 900 } as const;
export const PARITY_NARROW_VIEWPORT = { width: 1024, height: 768 } as const;
export const PARITY_MOBILE_VIEWPORT = { width: 390, height: 844 } as const;

/**
 * Avatar values pinned per fixture bot so identity pixels (color + mascot
 * shape) are identical on every run. Unpinned avatars derive from the bot id,
 * which changes per database.
 */
export const PARITY_AVATARS = {
  chief: "#10B981::shape_0",
  research: "#6366F1::shape_1",
  inbox: "#F97316::shape_2",
} as const;

/** Deterministic scripted-runtime prompts and their stable replies. */
export const PARITY_PROMPTS = {
  note: "write a file in your home called parity-note.txt that says parity-ok",
  email: "please draft an email to the client about the intro call",
} as const;

/** Sign up, land in the onboarded chat, and pin its avatar pixels. */
export async function openParityWorkspace(page: Page, email: string, name: string) {
  await signup(page, email, "password12", name);
  await completeOnboarding(page);
  const botId = new URL(page.url()).pathname.split("/").filter(Boolean).at(-1) as string;
  await rpc(page, "bots/update", { botId, color: PARITY_AVATARS.chief });
  await page.setViewportSize(PARITY_VIEWPORT);
  await page.reload();
  await expect(page.getByTestId("composer-bar")).toBeVisible();
  return botId;
}

/** Create a fixture bot with pinned identity for roster/roster-state captures. */
export async function seedParityBot(page: Page, name: string, title: string, color: string) {
  return rpc<{ id: string; name: string; color: string }>(page, "bots/create", {
    name,
    title,
    description: `${title} for the parity matrix.`,
    color,
  });
}

/** Persist an attachment to disk so it survives in test-results artifacts. */
export async function attachJson(testInfo: TestInfo, name: string, data: unknown): Promise<void> {
  const path = testInfo.outputPath(name);
  await writeFile(path, JSON.stringify(data, null, 2));
  await testInfo.attach(name, { contentType: "application/json", path });
}

/**
 * Viewport screenshot for a canonical state. Viewport-only (not fullPage) so
 * the frame itself is part of the contract; animations and caret are disabled
 * for determinism.
 */
export async function captureParityState(page: Page, testInfo: TestInfo, stateId: string) {
  const screenshotPath = testInfo.outputPath(`${stateId}.png`);
  await page.screenshot({
    animations: "disabled",
    caret: "hide",
    path: screenshotPath,
  });
  await testInfo.attach(stateId, { contentType: "image/png", path: screenshotPath });
}

/**
 * Locators that carry run-volatile content (timestamps) for screenshot masks.
 * Structural UI must never be added here — see the phase 10 mask policy.
 */
export function parityMaskLocators(page: Page) {
  return [page.locator("time"), page.getByTestId("roster-time")];
}

/** Measurement probe: computed geometry + typography of the shell contract. */
export async function measureShellGeometry(page: Page) {
  return page.evaluate(() => {
    const pick = (selector: string, properties: string[]) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const out: Record<string, unknown> = {
        rect: {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        },
      };
      for (const property of properties) out[property] = style.getPropertyValue(property);
      return out;
    };
    const text = (selector: string) =>
      pick(selector, ["font-size", "font-weight", "line-height", "letter-spacing", "color"]);
    const box = (selector: string) =>
      pick(selector, [
        "border-radius",
        "border-width",
        "border-color",
        "background-color",
        "box-shadow",
        "padding",
        "gap",
      ]);
    const row = document.querySelector<HTMLElement>("[data-roster-bot-name]")?.closest("button");
    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      sidebar: box("aside"),
      rosterRow: row
        ? {
            rect: (() => {
              const r = row.getBoundingClientRect();
              return {
                x: Math.round(r.x),
                y: Math.round(r.y),
                width: Math.round(r.width),
                height: Math.round(r.height),
              };
            })(),
          }
        : null,
      rosterName: text("[data-roster-bot-name]"),
      header: box("main > div"),
      headerIdentity: text('[data-testid="bot-settings-trigger"]'),
      transcript: box('[data-testid="transcript"]'),
      composer: box('[data-testid="composer-bar"]'),
      sidePanel: box('[data-testid="side-panel"]'),
      primaryButton: box('[data-testid="side-panel"] button'),
      dialog: box('[role="dialog"]'),
    };
  });
}
