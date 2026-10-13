import { createHash } from "node:crypto";
import type { ArtifactStore } from "@rakazo/adapter-kit";
import type { MessageBlock } from "@rakazo/contracts";
import { ARTIFACT_DESCRIPTION_MAX_LENGTH, ARTIFACT_NAME_MAX_LENGTH } from "@rakazo/contracts";
import type { Deck } from "@rakazo/core";
import { DECK_MIME, deckArtifactName, deckPreview } from "@rakazo/core";
import type { PrismaClient } from "@rakazo/db";
import { withResolvedArtifactVersion } from "@rakazo/db";

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
  return {
    artifactId: row.id,
    version: row.version,
    block: {
      kind: "deck",
      artifactId: row.id,
      title: input.deck.title,
      slideCount: input.deck.slides.length,
      style: input.deck.style ?? "clean",
      slides: deckPreview(input.deck),
    },
  };
}
