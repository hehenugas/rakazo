import { describe, expect, it, vi } from "vitest";
import {
  createSlackUserGroupLookup,
  hasSlackUserGroupMention,
  neutralizeSlackBroadcasts,
  restrictSlackUserGroups,
  sanitizeSlackOutbound,
} from "./slack-mentions.js";

describe("neutralizeSlackBroadcasts", () => {
  it("turns here, channel and everyone into plain words that do not ping", () => {
    expect(neutralizeSlackBroadcasts("<!here> and <!channel> and <!everyone|everyone>")).toBe(
      "@here and @channel and @everyone",
    );
    expect(neutralizeSlackBroadcasts("<!CHANNEL>")).toBe("@channel");
  });

  it("leaves other tokens and plain text alone", () => {
    const text = "hi <@U123> see <#C123|general> <!date^1700000000^{date}|today> @here";
    expect(neutralizeSlackBroadcasts(text)).toBe(text);
  });
});

describe("restrictSlackUserGroups", () => {
  const allowed = new Set(["S123"]);

  it("keeps an authorized group mention", () => {
    expect(restrictSlackUserGroups("ping <!subteam^S123|@design> now", allowed)).toBe(
      "ping <!subteam^S123|@design> now",
    );
    expect(restrictSlackUserGroups("ping <!subteam^s123>", allowed)).toBe("ping <!subteam^s123>");
  });

  it("writes an unauthorized group as plain text, using its label when given", () => {
    expect(restrictSlackUserGroups("<!subteam^S999|@everyone-team> hi", allowed)).toBe(
      "@everyone-team hi",
    );
    expect(restrictSlackUserGroups("<!subteam^S999> hi", allowed)).toBe("@usergroup hi");
  });

  it("never treats a display label as an id", () => {
    expect(restrictSlackUserGroups("<!subteam^S999|S123>", allowed)).toBe("@S123");
    expect(restrictSlackUserGroups("@design-team", allowed)).toBe("@design-team");
  });

  it("detects group mentions", () => {
    expect(hasSlackUserGroupMention("a <!subteam^S1> b")).toBe(true);
    expect(hasSlackUserGroupMention("a <!channel> b")).toBe(false);
  });
});

describe("sanitizeSlackOutbound", () => {
  it("applies both rules in one pass", () => {
    expect(
      sanitizeSlackOutbound("<!channel> <!subteam^S123> <!subteam^S9>", new Set(["S123"])),
    ).toBe("@channel <!subteam^S123> @usergroup");
  });
});

describe("nested tokens", () => {
  it("cannot hide a broadcast or an unauthorized group inside another token's label", () => {
    expect(sanitizeSlackOutbound("hi <!here|<!channel>>", new Set())).toBe(
      "hi &lt;!here|@channel>",
    );
    // The outer token becomes literal text; the inner, authorized one is a real mention.
    expect(sanitizeSlackOutbound("<!subteam^S1|<!subteam^S2>>", new Set(["S2"]))).toBe(
      "&lt;!subteam^S1|<!subteam^S2>>",
    );
    const deep = `${"<!here|".repeat(20)}x${">".repeat(20)}`;
    expect(sanitizeSlackOutbound(deep, new Set())).not.toMatch(/<!(here|channel|everyone)/);
    expect(sanitizeSlackOutbound(deep, new Set())).not.toMatch(/<!/);
  });
});

describe("createSlackUserGroupLookup", () => {
  const reply = (body: unknown) => ({ json: async () => body });

  it("returns the workspace's active group ids and caches them", async () => {
    const fetch = vi.fn(async () =>
      reply({ ok: true, usergroups: [{ id: "S1" }, { id: "S2", date_delete: 1 }, { id: "s3" }] }),
    );
    const lookup = createSlackUserGroupLookup({ botToken: "xoxb-test", fetch });
    expect([...(await lookup())].sort()).toEqual(["S1", "S3"]);
    await lookup();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("https://slack.com/api/usergroups.list", {
      headers: { authorization: "Bearer xoxb-test" },
    });
  });

  it("refreshes after the cache lifetime", async () => {
    let time = 0;
    const fetch = vi.fn(async () => reply({ ok: true, usergroups: [{ id: "S1" }] }));
    const lookup = createSlackUserGroupLookup({
      botToken: "t",
      fetch,
      ttlMs: 1_000,
      now: () => time,
    });
    await lookup();
    time = 1_001;
    await lookup();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("fails closed on a missing scope, a bad reply, or a network error", async () => {
    for (const fetch of [
      vi.fn(async () => reply({ ok: false, error: "missing_scope" })),
      vi.fn(async () => reply("nope")),
      vi.fn(async () => {
        throw new Error("offline");
      }),
    ]) {
      const lookup = createSlackUserGroupLookup({ botToken: "t", fetch });
      expect((await lookup()).size).toBe(0);
    }
  });
});
