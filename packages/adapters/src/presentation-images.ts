import type { ArtifactStore } from "@rakazo/adapter-kit";
import { DECK_IMAGE_MAX_BYTES, DECK_IMAGE_MIME_TYPES } from "@rakazo/contracts";
import type { Deck } from "@rakazo/core";
import { deckImageArtifactIds } from "@rakazo/core";
import type { PrismaClient } from "@rakazo/db";

export type DeckImageBytes = { bytes: Uint8Array; mimeType: "image/png" | "image/jpeg" };

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function matchesMimeType(bytes: Uint8Array, mimeType: DeckImageBytes["mimeType"]) {
  return mimeType === "image/png"
    ? PNG_SIGNATURE.every((value, index) => bytes[index] === value)
    : bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

/**
 * The raster images a deck refers to, read from artifact storage on behalf of one owner. An image
 * that is missing, belongs to someone else, is oversized, or is not really a PNG/JPEG is refused,
 * so a tampered deck can never pull another user's file or untrusted markup into a renderer.
 */
export async function loadDeckImages(
  deps: { prisma: Pick<PrismaClient, "artifact">; artifacts: ArtifactStore },
  scope: { spaceId: string; userId: string; operationId: string },
  deck: Deck,
): Promise<Map<string, DeckImageBytes>> {
  const images = new Map<string, DeckImageBytes>();
  for (const artifactId of deckImageArtifactIds(deck)) {
    const row = await deps.prisma.artifact.findFirst({
      where: { id: artifactId, spaceId: scope.spaceId, userId: scope.userId },
      select: { id: true, botId: true, groupId: true, mimeType: true, size: true, storageKey: true },
    });
    const mimeType = (DECK_IMAGE_MIME_TYPES as readonly string[]).includes(row?.mimeType ?? "")
      ? (row!.mimeType as DeckImageBytes["mimeType"])
      : null;
    if (!row || !mimeType) {
      throw new Error("Slide images must be your own PNG or JPEG image artifacts.");
    }
    if (row.size > DECK_IMAGE_MAX_BYTES) {
      throw new Error("A slide image is larger than 4 MB.");
    }
    const bytes = await deps.artifacts.get(row.storageKey, {
      operationId: scope.operationId,
      traceId: scope.operationId,
      spaceId: scope.spaceId,
      userId: scope.userId,
      botId: row.botId ?? row.groupId ?? row.id,
      signal: new AbortController().signal,
    });
    if (bytes.byteLength > DECK_IMAGE_MAX_BYTES || !matchesMimeType(bytes, mimeType)) {
      throw new Error("A slide image could not be read as a PNG or JPEG.");
    }
    images.set(artifactId, { bytes, mimeType });
  }
  return images;
}
