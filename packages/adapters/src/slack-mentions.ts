/**
 * Outbound Slack mention policy. A Team Bot may mention a user group so its members are notified,
 * but `@here`, `@channel` and `@everyone` must never ping anyone, and a group may only be mentioned
 * when Slack itself reports it as a real group of the workspace. Group names are never turned into
 * ids; a mention that is not authorized degrades to plain text, which Slack does not notify.
 */

const BROADCAST = /<!(here|channel|everyone)(?:\|[^<>]*)?>/gi;
const USER_GROUP = /<!subteam\^([A-Z0-9]{2,32})(?:\|([^<>]*))?>/gi;

/** `<!here>`, `<!channel>` and `<!everyone>` become the literal words, which do not ping. */
export function neutralizeSlackBroadcasts(text: string): string {
  return text.replace(BROADCAST, (_match, kind: string) => `@${kind.toLowerCase()}`);
}

/** Keep `<!subteam^ID>` only for authorized ids; otherwise write the group's label as text. */
export function restrictSlackUserGroups(text: string, allowedIds: ReadonlySet<string>): string {
  return text.replace(USER_GROUP, (match, id: string, label: string | undefined) => {
    if (allowedIds.has(id.toUpperCase())) return match;
    const name = label?.replace(/^@/, "").trim();
    return `@${name || "usergroup"}`;
  });
}

export function hasSlackUserGroupMention(text: string): boolean {
  USER_GROUP.lastIndex = 0;
  return USER_GROUP.test(text);
}

/**
 * Apply both rules until the text stops changing, so a token nested inside another token's label
 * (`<!here|<!channel>>`) cannot survive the first pass.
 */
export function sanitizeSlackOutbound(text: string, authorizedUserGroupIds: ReadonlySet<string>) {
  // A special token inside another token's label would make the outer one unrecognizable to the
  // rules below while Slack may still act on it, so the outer token is written as literal text.
  let current = text;
  while (/<![^<>]*<!/.test(current)) current = current.replace(/<!([^<>]*)<!/g, "&lt;!$1<!");
  for (let pass = 0; pass < 8; pass += 1) {
    const next = restrictSlackUserGroups(
      neutralizeSlackBroadcasts(current),
      authorizedUserGroupIds,
    );
    if (next === current) return next;
    current = next;
  }
  // Still changing after eight passes means deliberate nesting: drop every special token.
  return current.replace(/<!/g, "&lt;!");
}

type FetchLike = (
  url: string,
  init: { headers: Record<string, string> },
) => Promise<{
  json(): Promise<unknown>;
}>;

/**
 * Ids of the workspace's active user groups, asked of Slack (`usergroups.list`) and cached.
 * Any failure (missing scope, network, malformed reply) yields an empty set, so the safe outcome
 * is that no group mention goes out.
 */
export function createSlackUserGroupLookup(options: {
  botToken: string;
  fetch?: FetchLike;
  ttlMs?: number;
  now?: () => number;
}): () => Promise<ReadonlySet<string>> {
  const doFetch: FetchLike = options.fetch ?? ((url, init) => fetch(url, init));
  const now = options.now ?? Date.now;
  const ttlMs = options.ttlMs ?? 300_000;
  let cached: { ids: ReadonlySet<string>; expiresAt: number } | undefined;
  return async () => {
    if (cached && cached.expiresAt > now()) return cached.ids;
    let ids: ReadonlySet<string> = new Set();
    let lifetime = 30_000;
    try {
      const response = await doFetch("https://slack.com/api/usergroups.list", {
        headers: { authorization: `Bearer ${options.botToken}` },
      });
      const body = (await response.json()) as {
        ok?: boolean;
        usergroups?: { id?: unknown; date_delete?: unknown }[];
      };
      if (body.ok === true && Array.isArray(body.usergroups)) {
        ids = new Set(
          body.usergroups
            .filter((group) => typeof group.id === "string" && !group.date_delete)
            .map((group) => String(group.id).toUpperCase()),
        );
        lifetime = ttlMs;
      }
    } catch {
      // Fail closed below.
    }
    cached = { ids, expiresAt: now() + lifetime };
    return ids;
  };
}
