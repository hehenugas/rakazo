import { createHash } from "node:crypto";
import type { ArtifactStore } from "@rakazo/adapter-kit";
import type { DeckStyle, MessageBlock } from "@rakazo/contracts";
import { ARTIFACT_DESCRIPTION_MAX_LENGTH, ARTIFACT_NAME_MAX_LENGTH } from "@rakazo/contracts";
import type { Deck } from "@rakazo/core";
import {
  DECK_MIME,
  deckArtifactName,
  deckGoogleSlidesLosses,
  deckPreview,
  parseDeck,
} from "@rakazo/core";
import type { PrismaClient } from "@rakazo/db";
import { withResolvedArtifactVersion } from "@rakazo/db";
import { loadDeckImages } from "./presentation-images.js";

/**
 * Store a deck as a versioned artifact owned by the run's user. Saving the same title again
 * creates a new version of the same artifact (same name), exactly like any other artifact.
 * Returns the chat card for it.
 */
export async function saveDeckArtifact(
  deps: { prisma: PrismaClient; artifacts: ArtifactStore },
  input: {
    spaceId: string;
    userId: string;
    botId: string;
    groupId?: string;
    runId: string;
    operationId: string;
    deck: Deck;
  },
): Promise<{
  artifactId: string;
  version: number;
  block: Extract<MessageBlock, { kind: "deck" }>;
}> {
  // Refuse images the owner cannot use before anything is stored.
  await loadDeckImages(deps, { ...input, operationId: input.operationId }, input.deck);
  const name = deckArtifactName(input.deck.title).slice(0, ARTIFACT_NAME_MAX_LENGTH);
  const bytes = new TextEncoder().encode(JSON.stringify(input.deck));
  const context = {
    operationId: input.operationId,
    traceId: input.operationId,
    spaceId: input.spaceId,
    userId: input.userId,
    botId: input.botId,
    signal: new AbortController().signal,
  };
  const stored = await deps.artifacts.put({ name, mimeType: DECK_MIME, bytes }, context);
  const row = await withResolvedArtifactVersion(
    deps.prisma,
    {
      spaceId: input.spaceId,
      userId: input.userId,
      botId: input.botId,
      groupId: input.groupId,
      name,
    },
    (tx, { rootArtifactId, version }) =>
      tx.artifact.create({
        data: {
          spaceId: input.spaceId,
          userId: input.userId,
          botId: input.botId,
          groupId: input.groupId,
          runId: input.runId,
          name,
          description: `${input.deck.slides.length} slides`.slice(
            0,
            ARTIFACT_DESCRIPTION_MAX_LENGTH,
          ),
          mimeType: DECK_MIME,
          size: bytes.byteLength,
          hash: createHash("sha256").update(bytes).digest("hex"),
          storageKey: stored.id,
          rootArtifactId,
          version,
        },
      }),
  ).catch(async (error) => {
    await deps.artifacts.remove(stored.id, context).catch(() => undefined);
    throw error;
  });
  const losses = deckGoogleSlidesLosses(input.deck);
  return {
    artifactId: row.id,
    version: row.version,
    block: {
      kind: "deck",
      artifactId: row.id,
      title: input.deck.title,
      slideCount: input.deck.slides.length,
      style: input.deck.style ?? "clean",
      ...(losses.length > 0 ? { googleSlidesLosses: losses } : {}),
      slides: deckPreview(input.deck),
    },
  };
}

/**
 * The style a deck is saved with. It comes from what the user picked on the style card, never from
 * the model: the newest card in the thread decides, and a deck that already exists keeps its own
 * style until the user picks again.
 */
export async function resolveDeckStyle(
  deps: { prisma: PrismaClient; artifacts: ArtifactStore },
  scope: {
    spaceId: string;
    userId: string;
    botId: string;
    groupId?: string;
    threadId: string;
    title: string;
    operationId: string;
  },
): Promise<{ style: DeckStyle } | { error: string }> {
  const card = await deps.prisma.message.findFirst({
    where: {
      threadId: scope.threadId,
      role: "bot",
      blocks: { array_contains: [{ kind: "deck_style" }] },
    },
    orderBy: { seq: "desc" },
    select: { blocks: true },
  });
  const choice = (Array.isArray(card?.blocks) ? card.blocks : []).find(
    (block): block is { kind: "deck_style"; selected?: DeckStyle } =>
      Boolean(block) && typeof block === "object" && (block as { kind?: unknown }).kind === "deck_style",
  );
  if (choice?.selected) return { style: choice.selected };
  if (choice) {
    return { error: "The user has not chosen a style yet. Stop and wait for their choice." };
  }
  const name = deckArtifactName(scope.title).slice(0, ARTIFACT_NAME_MAX_LENGTH);
  const existing = await deps.prisma.artifact.findFirst({
    where: {
      spaceId: scope.spaceId,
      userId: scope.userId,
      botId: scope.botId,
      groupId: scope.groupId ?? null,
      name,
      mimeType: DECK_MIME,
    },
    orderBy: { version: "desc" },
    select: { storageKey: true },
  });
  if (existing) {
    const bytes = await deps.artifacts.get(existing.storageKey, {
      operationId: scope.operationId,
      traceId: scope.operationId,
      spaceId: scope.spaceId,
      userId: scope.userId,
      botId: scope.botId,
      signal: new AbortController().signal,
    });
    const parsed = parseDeck(JSON.parse(new TextDecoder().decode(bytes)));
    if ("deck" in parsed) return { style: parsed.deck.style ?? "clean" };
  }
  return { error: "Call presentation_style first so the user can choose a style for this deck." };
}
