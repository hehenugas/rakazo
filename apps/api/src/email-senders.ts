import { randomUUID } from "node:crypto";
import type { AdapterContext } from "@rakazo/adapter-kit";
import type { Actor } from "@rakazo/contracts";
import { emailProviderMatches } from "@rakazo/core";
import type { PrismaClient } from "@rakazo/db";
import { IsolationError } from "@rakazo/db";
import type { ConnectorRegistry } from "@rakazo/adapters";

export async function verifiedEmailSenders(
  deps: { prisma: PrismaClient; connectors: ConnectorRegistry },
  actor: Actor,
  connectionId: string,
  signal?: AbortSignal,
) {
  const connection = await deps.prisma.connection.findFirst({
    where: {
      id: connectionId,
      spaceId: actor.spaceId,
      userId: actor.userId,
      status: "connected",
    },
  });
  if (!connection) throw new IsolationError();
  if (!emailProviderMatches("gmail", connection.provider) || !connection.providerRef?.trim()) {
    return { supported: false, senders: [] };
  }
  const connector = deps.connectors.managed(connection.connectorId);
  if (!connector?.listVerifiedEmailSenders) {
    return { supported: false, senders: [] };
  }
  const operationId = `email-senders:${randomUUID()}`;
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
  const senders = await connector.listVerifiedEmailSenders(context);
  return senders === null ? { supported: false, senders: [] } : { supported: true, senders };
}
