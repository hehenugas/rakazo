import { describe, expect, it } from "vitest";
import {
  botBubbleColors,
  contrastRatio,
  GROK_COLOR_LIST,
  resolvePersonaColorDef,
} from "./bot-avatar-colors.js";

describe("persona avatar colors", () => {
  it("keeps Amber Gold on dark eyes instead of a brightness heuristic", () => {
    expect(resolvePersonaColorDef("preview", "#EAB308").eyeColor).toBe("#141414");
    expect(resolvePersonaColorDef("preview", "#8B5CF6").eyeColor).toBe("#FFFFFF");
  });
});

describe("botBubbleColors", () => {
  it("keeps body text at WCAG AA contrast for every Bot color in both appearances", () => {
    for (const color of GROK_COLOR_LIST) {
      for (const appearance of ["light", "dark"] as const) {
        const { background, foreground } = botBubbleColors(color, appearance);
        expect(
          contrastRatio(background, foreground),
          `${color.id} ${appearance}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("uses the light variant in light mode and the dark variant in dark mode", () => {
    const violet = GROK_COLOR_LIST.find((color) => color.id === "violet")!;
    expect(botBubbleColors(violet, "light").background).toBe(violet.light);
    expect(botBubbleColors(violet, "dark").background).toBe(violet.dark);
  });

  it("works for a custom hex color", () => {
    const custom = resolvePersonaColorDef("bot", "#123456");
    const { background, foreground } = botBubbleColors(custom, "light");
    expect(contrastRatio(background, foreground)).toBeGreaterThanOrEqual(4.5);
  });
});
