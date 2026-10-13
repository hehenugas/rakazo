import type { ArtifactStore } from "@rakazo/adapter-kit";
import type { Actor } from "@rakazo/contracts";
import { DECK_MIME } from "@rakazo/core";
import type { PrismaClient } from "@rakazo/db";
import { describe, expect, it, vi } from "vitest";
import {
  deckDeliveryNonce,
  deckDeliveryText,
  deliverDeck,
  exportDeck,
  hasGoogleSlides,
} from "./presentation-export.js";

const sendThreadMessage = vi.hoisted(() => vi.fn());
vi.mock("./thread-target.js", () => ({ sendThreadMessage }));

const actor = { spaceId: "space-1", userId: "user-1" } as Actor;

function setup(options: { mimeType?: string; content?: string; found?: boolean } = {}) {
  const content =
    options.content ??
    JSON.stringify({ title: "Launch plan", slides: [{ title: "Why now", bullets: ["Ready"] }] });
  const findFirst = vi.fn(async () =>
    options.found === false
      ? null
      : {
          id: "artifact-1",
          botId: "bot-1",
          groupId: null,
          runId: null,
          storageKey: "key-1",
          name: "launch-plan.deck.json",
          description: null,
          mimeType: options.mimeType ?? DECK_MIME,
          size: content.length,
          version: 1,
          createdAt: new Date(),
        },
  );
  const prisma = { artifact: { findFirst } } as unknown as PrismaClient;
  const artifacts = {
    get: vi.fn(async () => new TextEncoder().encode(content)),
  } as unknown as ArtifactStore;
  return { deps: { prisma, artifacts }, findFirst };
}

describe("exportDeck", () => {
  it("renders an owned deck as a PowerPoint file named after it", async () => {
    const { deps, findFirst } = setup();
    const result = await exportDeck(deps, actor, { artifactId: "artifact-1", format: "pptx" });

    expect(result.name).toBe("launch-plan.pptx");
    expect(result.mimeType).toBe(
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    );
    // A .pptx is a zip: it starts with the "PK" signature.
    expect(Buffer.from(result.contentBase64, "base64").subarray(0, 2).toString()).toBe("PK");
    // Ownership is part of the lookup, so another user's deck cannot be found.
    expect(findFirst).toHaveBeenCalledWith({
      where: { id: "artifact-1", spaceId: "space-1", userId: "user-1" },
    });
  });

  it("refuses another user's artifact", async () => {
    const { deps } = setup({ found: false });
    await expect(
      exportDeck(deps, actor, { artifactId: "artifact-1", format: "pptx" }),
    ).rejects.toThrow();
  });

  it("refuses artifacts that are not decks and decks that were tampered with", async () => {
    await expect(
      exportDeck(setup({ mimeType: "text/html" }).deps, actor, {
        artifactId: "artifact-1",
        format: "pptx",
      }),
    ).rejects.toThrow("not a slide deck");
    await expect(
      exportDeck(setup({ content: "not json" }).deps, actor, {
        artifactId: "artifact-1",
        format: "pptx",
      }),
    ).rejects.toThrow("could not be read");
    await expect(
      exportDeck(setup({ content: JSON.stringify({ title: "", slides: [] }) }).deps, actor, {
        artifactId: "artifact-1",
        format: "pptx",
      }),
    ).rejects.toThrow("needs a title");
  });
});

describe("deliverDeck", () => {
  const target = { kind: "bot", botId: "bot-1", threadId: "thread-1" } as never;
  const input = { artifactId: "artifact-1", destination: "google_slides" as const };

  function withConnection(connected: boolean) {
    const { deps } = setup();
    const connection = { findFirst: vi.fn(async () => (connected ? { id: "c1" } : null)) };
    const prisma = Object.assign(deps.prisma, { connection }) as PrismaClient;
    return { deps: { ...deps, prisma, events: {} as never, jobs: {} as never }, connection };
  }

  it("asks the Bot to build the deck, once per version, with the stored slides", async () => {
    sendThreadMessage.mockReset();
    const { deps, connection } = withConnection(true);

    await deliverDeck(deps, actor, target, input);

    expect(connection.findFirst).toHaveBeenCalledWith({
      where: {
        spaceId: "space-1",
        userId: "user-1",
        status: "connected",
        provider: { equals: "googleslides", mode: "insensitive" },
      },
      select: { id: true },
    });
    const [, , , sent] = sendThreadMessage.mock.calls[0]!;
    expect(sent.clientNonce).toBe(deckDeliveryNonce("artifact-1", 1));
    expect(sent.text).toContain("Title: Launch plan");
    expect(sent.text).toContain("Slide 1: Why now");
    expect(sent.text).toContain("- Ready");
    expect(sent.text).toContain("do not share it");
  });

  it("does nothing without a Google Slides connection", async () => {
    sendThreadMessage.mockReset();
    const { deps } = withConnection(false);
    await expect(deliverDeck(deps, actor, target, input)).rejects.toThrow("Connect Google Slides");
    expect(sendThreadMessage).not.toHaveBeenCalled();
    expect(await hasGoogleSlides(deps.prisma, actor)).toBe(false);
  });

  it("refuses a deck the user does not own", async () => {
    sendThreadMessage.mockReset();
    const { deps } = setup({ found: false });
    await expect(
      deliverDeck({ ...deps, events: {} as never, jobs: {} as never }, actor, target, input),
    ).rejects.toThrow();
    expect(sendThreadMessage).not.toHaveBeenCalled();
  });

  it("carries speaker notes into the instruction", () => {
    const text = deckDeliveryText({
      title: "T",
      slides: [{ title: "A", bullets: [], notes: "Say hello" }],
    });
    expect(text).toContain("Speaker notes: Say hello");
  });
});
