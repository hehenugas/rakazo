import { describe, expect, it } from "vitest";
import { DECK_LIMITS, deckArtifactName, deckPreview, parseDeck } from "./presentation.js";

describe("parseDeck", () => {
  it("cleans a valid deck", () => {
    const parsed = parseDeck({
      title: "  Launch  ",
      slides: [
        { title: "Why now", bullets: ["  Fast ", "", "Cheap"], notes: " say hi " },
        { title: "Next", bullets: [] },
      ],
    });
    expect(parsed).toEqual({
      deck: {
        title: "Launch",
        slides: [
          { title: "Why now", bullets: ["Fast", "Cheap"], notes: "say hi" },
          { title: "Next", bullets: [] },
        ],
      },
    });
  });

  it("explains what is wrong", () => {
    expect(parseDeck(null)).toHaveProperty("error");
    expect(parseDeck({ title: "", slides: [{ title: "a" }] })).toEqual({
      error: "The deck needs a title.",
    });
    expect(parseDeck({ title: "T", slides: [] })).toEqual({
      error: "The deck needs at least one slide.",
    });
    expect(parseDeck({ title: "T", slides: [{ bullets: ["x"] }] })).toEqual({
      error: "Slide 1 needs a title.",
    });
    expect(
      parseDeck({ title: "T", slides: [{ title: "S", bullets: new Array(13).fill("x") }] }),
    ).toEqual({ error: "Slide 1 can have at most 12 bullets." });
    expect(
      parseDeck({
        title: "T",
        slides: new Array(DECK_LIMITS.slides + 1).fill({ title: "S" }),
      }),
    ).toEqual({ error: "A deck can have at most 60 slides." });
  });

  it("keeps a slide without bullets and trims over-long text", () => {
    const parsed = parseDeck({
      title: "x".repeat(500),
      slides: [{ title: "S", bullets: ["y".repeat(900)] }],
    });
    if (!("deck" in parsed)) throw new Error("expected a deck");
    expect(parsed.deck.title).toHaveLength(DECK_LIMITS.title);
    expect(parsed.deck.slides[0]?.bullets[0]).toHaveLength(DECK_LIMITS.bullet);
  });
});

describe("parseDeck control characters", () => {
  it("strips characters that cannot appear in XML text", () => {
    const parsed = parseDeck({
      title: "Plan\u0000\u000B",
      slides: [{ title: "A\u0007B", bullets: ["x\u001Fy\tz"], notes: "n\u000Co" }],
    });
    expect(parsed).toEqual({
      deck: {
        title: "Plan",
        slides: [{ title: "AB", bullets: ["xy\tz"], notes: "no" }],
      },
    });
  });
});

describe("deck naming and preview", () => {
  it("maps a title to a stable artifact name", () => {
    expect(deckArtifactName("Q3 Launch: Plan!")).toBe("q3-launch-plan.deck.json");
    expect(deckArtifactName("!!!")).toBe("deck.deck.json");
    expect(deckArtifactName("Rencana Peluncuran")).toBe("rencana-peluncuran.deck.json");
  });

  it("limits the preview carried in a message block", () => {
    const slides = Array.from({ length: 20 }, (_, i) => ({
      title: `S${i}`,
      bullets: Array.from({ length: 6 }, () => "z".repeat(300)),
    }));
    const preview = deckPreview({ title: "T", slides });
    expect(preview).toHaveLength(12);
    expect(preview[0]?.bullets).toHaveLength(4);
    expect(preview[0]?.bullets[0]).toHaveLength(140);
  });
});
