import type { ConnectionCatalogItem } from "@rakazo/contracts";

const MAX_PLUGIN_RESULTS = 6;

/** Plugins whose name or slug contains the search text; nothing until the user types. */
export function pluginMatches(
  items: ConnectionCatalogItem[],
  search: string,
  limit = MAX_PLUGIN_RESULTS,
): ConnectionCatalogItem[] {
  const needle = search.trim().toLowerCase();
  if (!needle) return [];
  return items
    .filter((item) => `${item.name} ${item.slug}`.toLowerCase().includes(needle))
    .slice(0, limit);
}
