import { createHash, randomUUID } from "node:crypto";
import { ORPCError } from "@orpc/server";
import type {
  AdapterContext,
  ArtifactStore,
  GoogleSlidesDeliveryResult,
} from "@rakazo/adapter-kit";
import { deckToGoogleSlidesMarkdown, PPTX_MIME, renderDeckPptx } from "@rakazo/adapters";
import type { Actor } from "@rakazo/contracts";
import type { Deck } from "@rakazo/core";
import { DECK_MIME, parseDeck } from "@rakazo/core";
import type { ConnectorRegistry } from "@rakazo/adapters";
import type { PrismaClient } from "@rakazo/db";
import { IsolationError } from "@rakazo/db";
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

/** Canonical provider slug used for connected-account capability checks. */
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

/** Legacy nonce format retained for callers that recorded it before structured delivery shipped. */
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

/** Deliver a stored deck through the selected provider account and persist its receipt. */
export async function deliverDeck(
  deps: {
    prisma: PrismaClient;
    artifacts: ArtifactStore;
    connectors?: ConnectorRegistry;
  },
  actor: Actor,
  _target: ThreadTarget,
  input: { artifactId: string; destination: "google_slides"; connectionId?: string },
  signal?: AbortSignal,
) {
  const { artifact, deck } = await loadDeck(deps, actor, input.artifactId);
  if (!input.connectionId) {
    throw new ORPCError("PRECONDITION_FAILED", {
      message: "Choose a connected Google Slides account before delivery.",
    });
  }
  const connection = await deps.prisma.connection.findFirst({
    where: {
      id: input.connectionId,
      spaceId: actor.spaceId,
      userId: actor.userId,
      status: "connected",
    },
  });
  if (!connection || normalizeProvider(connection.provider) !== "googleslides") {
    throw new ORPCError("PRECONDITION_FAILED", {
      message: "The selected Google Slides account is no longer connected.",
    });
  }
  const connector = deps.connectors?.managed(connection.connectorId);
  if (!connector?.supportsGoogleSlidesDelivery || !connector.createGoogleSlidesFromMarkdown) {
    return { status: "unsupported" as const, url: null };
  }
  const operationId = `deck-delivery:${randomUUID()}`;
  const context: AdapterContext = {
    operationId,
    traceId: operationId,
    spaceId: actor.spaceId,
    userId: actor.userId,
    signal: signal ?? new AbortController().signal,
    connectedConnections: [
      {
        id: connection.id,
        connectorId: connection.connectorId,
        externalId: connection.provider,
        displayName: connection.displayName,
        providerRef: connection.providerRef ?? undefined,
      },
    ],
  };
  if (!connection.providerRef?.trim() || !(await connector.supportsGoogleSlidesDelivery(context))) {
    return { status: "unsupported" as const, url: null };
  }
  const connectionSnapshot = createHash("sha256").update(connection.providerRef).digest("hex");
  const idempotencyKey = createHash("sha256")
    .update(
      `${actor.spaceId}:${actor.userId}:${artifact.id}:${artifact.version}:${connection.id}:${connectionSnapshot}`,
    )
    .digest("hex");
  let attempt = await deps.prisma.artifactDelivery.findFirst({ where: { idempotencyKey } });
  let shouldDeliver = false;
  if (!attempt) {
    try {
      attempt = await deps.prisma.artifactDelivery.create({
        data: {
          spaceId: actor.spaceId,
          userId: actor.userId,
          artifactId: artifact.id,
          version: artifact.version,
          connectionId: connection.id,
          provider: connection.provider,
          connectionSnapshot,
          idempotencyKey,
          status: "pending",
        },
      });
      shouldDeliver = true;
    } catch (error) {
      attempt = await deps.prisma.artifactDelivery.findFirst({ where: { idempotencyKey } });
      if (!attempt) throw error;
    }
  } else if (attempt.status === "failed") {
    const claimed = await deps.prisma.artifactDelivery.updateMany({
      where: { id: attempt.id, status: "failed", connectionSnapshot },
      data: { status: "pending", externalFileId: null, externalUrl: null },
    });
    attempt = await deps.prisma.artifactDelivery.findUnique({ where: { id: attempt.id } });
    shouldDeliver = claimed.count === 1;
  }
  if (!attempt) throw new IsolationError();
  if (attempt.connectionSnapshot !== connectionSnapshot) {
    return { status: "unknown" as const, url: null };
  }
  if (!shouldDeliver) return deliveryStatus(attempt);
  const currentConnection = await deps.prisma.connection.findFirst({
    where: {
      id: connection.id,
      spaceId: actor.spaceId,
      userId: actor.userId,
      status: "connected",
    },
    select: { providerRef: true },
  });
  if (
    !currentConnection ||
    createHash("sha256").update(currentConnection.providerRef ?? "").digest("hex") !==
      connectionSnapshot
  ) {
    const failed = await deps.prisma.artifactDelivery.update({
      where: { id: attempt.id },
      data: { status: "failed" },
    });
    return deliveryStatus(failed);
  }
  let result: GoogleSlidesDeliveryResult | null;
  try {
    result = await connector.createGoogleSlidesFromMarkdown(
      {
        title: deck.title,
        markdown: deckToGoogleSlidesMarkdown(deck),
      },
      context,
    );
  } catch {
    const unknown = await deps.prisma.artifactDelivery.update({
      where: { id: attempt.id },
      data: { status: "unknown" },
    });
    return deliveryStatus(unknown);
  }
  if (!result) {
    const unsupported = await deps.prisma.artifactDelivery.update({
      where: { id: attempt.id },
      data: { status: "unsupported" },
    });
    return deliveryStatus(unsupported);
  }
  const delivered = await deps.prisma.artifactDelivery.update({
    where: { id: attempt.id },
    data: {
      status: result.status,
      ...(result.status === "delivered"
        ? { externalFileId: result.receipt.fileId, externalUrl: result.receipt.url }
        : {}),
    },
  });
  return deliveryStatus(delivered);
}

export async function googleSlidesDeliveryConnections(
  deps: { prisma: PrismaClient; connectors: ConnectorRegistry },
  actor: Actor,
  signal?: AbortSignal,
) {
  const rows = await deps.prisma.connection.findMany({
    where: { spaceId: actor.spaceId, userId: actor.userId, status: "connected" },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
  const eligible = await Promise.all(
    rows
      .filter(
        (row) => normalizeProvider(row.provider) === "googleslides" && Boolean(row.providerRef),
      )
      .map(async (row) => {
        const connector = deps.connectors.managed(row.connectorId);
        if (!connector?.supportsGoogleSlidesDelivery) return null;
        const operationId = `deck-delivery-capability:${randomUUID()}`;
        const context: AdapterContext = {
          operationId,
          traceId: operationId,
          spaceId: actor.spaceId,
          userId: actor.userId,
          signal: signal ?? new AbortController().signal,
          connectedConnections: [
            {
              id: row.id,
              connectorId: row.connectorId,
              externalId: row.provider,
              displayName: row.displayName,
              providerRef: row.providerRef ?? undefined,
            },
          ],
        };
        try {
          return (await connector.supportsGoogleSlidesDelivery(context))
            ? { connectionId: row.id, displayName: row.displayName }
            : null;
        } catch {
          return null;
        }
      }),
  );
  return eligible.filter((item): item is NonNullable<typeof item> => item !== null);
}

export async function readDeckDeliveryStatus(
  deps: { prisma: PrismaClient; artifacts: ArtifactStore },
  actor: Actor,
  input: { artifactId: string; connectionId: string },
) {
  await loadDeck(deps, actor, input.artifactId);
  const connection = await deps.prisma.connection.findFirst({
    where: { id: input.connectionId, spaceId: actor.spaceId, userId: actor.userId },
    select: { providerRef: true },
  });
  if (!connection?.providerRef) return null;
  const connectionSnapshot = createHash("sha256").update(connection.providerRef).digest("hex");
  let row = await deps.prisma.artifactDelivery.findFirst({
    where: {
      artifactId: input.artifactId,
      connectionId: input.connectionId,
      connectionSnapshot,
      spaceId: actor.spaceId,
      userId: actor.userId,
    },
  });
  if (row?.status === "pending" && Date.now() - row.updatedAt.getTime() > 120_000) {
    await deps.prisma.artifactDelivery.updateMany({
      where: { id: row.id, status: "pending", updatedAt: row.updatedAt },
      data: { status: "unknown" },
    });
    row = await deps.prisma.artifactDelivery.findUnique({ where: { id: row.id } });
  }
  return row ? deliveryStatus(row) : null;
}

function normalizeProvider(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function deliveryStatus(row: { status: string; externalUrl: string | null }) {
  const status = ["pending", "delivered", "failed", "unknown", "unsupported"].includes(row.status)
    ? (row.status as "pending" | "delivered" | "failed" | "unknown" | "unsupported")
    : "unknown";
  return { status, url: status === "delivered" ? row.externalUrl : null };
}
