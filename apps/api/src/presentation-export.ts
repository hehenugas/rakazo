import { ORPCError } from "@orpc/server";
import type { ArtifactStore } from "@rakazo/adapter-kit";
import { PPTX_MIME, renderDeckPptx } from "@rakazo/adapters";
import type { Actor } from "@rakazo/contracts";
import { DECK_MIME, type Deck, parseDeck } from "@rakazo/core";
import type { PrismaClient } from "@rakazo/db";
import { getSpaceArtifactById } from "./artifacts.js";
import type { ThreadTarget } from "./thread-target.js";

/** An owned deck artifact, re-validated: a tampered row never reaches a renderer or the Bot. */
async function loadDeck(
  deps: { prisma: PrismaClient; artifacts: ArtifactStore },
  actor: Actor,
  artifactId: string,
) {
  // Ownership is the artifact lookup's (space and user).
  const artifact = await getSpaceArtifactById(deps, actor, { artifactId });
  if (artifact.mimeType !== DECK_MIME) {
    throw new ORPCError("BAD_REQUEST", { message: "This artifact is not a slide deck." });
  }
  let json: unknown;
  try {
    json = JSON.parse(Buffer.from(artifact.contentBase64, "base64").toString("utf8"));
  } catch {
    throw new ORPCError("BAD_REQUEST", { message: "The deck could not be read." });
  }
  const parsed = parseDeck(json);
  if ("error" in parsed) throw new ORPCError("BAD_REQUEST", { message: parsed.error });
  return { artifact, deck: parsed.deck };
}

/** Render an owned deck as a downloadable file. */
export async function exportDeck(
  deps: { prisma: PrismaClient; artifacts: ArtifactStore },
  actor: Actor,
  input: { artifactId: string; format: "pptx" },
) {
  const { artifact, deck } = await loadDeck(deps, actor, input.artifactId);
  const bytes = await renderDeckPptx(deck);
  return {
    name: `${artifact.name.replace(/\.deck\.json$/, "")}.${input.format}`,
    mimeType: PPTX_MIME,
    contentBase64: Buffer.from(bytes).toString("base64"),
  };
}

/** @deprecated Connection presence does not prove structured Slides delivery capability. */
export const GOOGLE_SLIDES_PROVIDER = "googleslides";

/** @deprecated Kept for compatibility; never used to expose an export action. */
export async function hasGoogleSlides(prisma: Pick<PrismaClient, "connection">, actor: Actor) {
  const row = await prisma.connection.findFirst({
    where: {
      spaceId: actor.spaceId,
      userId: actor.userId,
      status: "connected",
      provider: { equals: GOOGLE_SLIDES_PROVIDER, mode: "insensitive" },
    },
    select: { id: true },
  });
  return Boolean(row);
}

/** @deprecated Legacy nonce helper; direct structured delivery is not currently available. */
export const deckDeliveryNonce = (artifactId: string, version: number) =>
  `deck-delivery:google_slides:${artifactId}:${version}`;

/** @deprecated This legacy prompt is intentionally not called by any delivery path. */
export function deckDeliveryText(deck: Deck): string {
  return [
    `Title: ${deck.title}`,
    ...deck.slides.map((slide, index) =>
      [
        `Slide ${index + 1}: ${slide.title}`,
        ...slide.bullets.map((bullet) => `- ${bullet}`),
        ...(slide.notes ? [`Speaker notes: ${slide.notes}`] : []),
      ].join("\n"),
    ),
  ].join("\n\n");
}

/** No connector currently provides a structured Slides create/upload receipt. */
export async function deliverDeck(
  deps: {
    prisma: PrismaClient;
    artifacts: ArtifactStore;
  },
  actor: Actor,
  _target: ThreadTarget,
  input: { artifactId: string; destination: "google_slides" },
) {
  await loadDeck(deps, actor, input.artifactId);
  throw new ORPCError("PRECONDITION_FAILED", {
    message: "Google Slides delivery is unavailable for this connection.",
  });
}
