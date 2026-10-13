import type { AdapterContext, ManagedConnectorProvider } from "@rakazo/adapter-kit";
import type { MessageBlock } from "@rakazo/contracts";
import { featuredConnectorProvidersMatch } from "@rakazo/core";

const key = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "");

/**
 * Authorization card for an app the agent asked for by plain name. Null when no managed
 * catalog knows the app, so the caller can still ask the user without a dead card.
 */
export async function resolveAppConnectBlock(
  providers: readonly ManagedConnectorProvider[],
  app: string,
  context: AdapterContext,
): Promise<Extract<MessageBlock, { kind: "app_connect" }> | null> {
  const wanted = key(app);
  if (!wanted) return null;
  for (const provider of providers) {
    const items = await provider.catalog(context, app).catch(() => []);
    const entry =
      items.find((item) => key(item.slug) === wanted || key(item.name) === wanted) ??
      items.find(
        (item) =>
          featuredConnectorProvidersMatch(item.slug, app) ||
          featuredConnectorProvidersMatch(item.name, app),
      ) ??
      items.find((item) => key(item.name).includes(wanted));
    if (!entry) continue;
    return {
      kind: "app_connect",
      connectorId: entry.connectorId ?? "composio",
      provider: entry.slug,
      name: entry.name,
      description: "",
      logo: entry.logo ?? null,
      status: entry.connected ? "connected" : "pending",
    };
  }
  return null;
}
