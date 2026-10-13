import { describe, expect, it } from "vitest";
import { createConnectorStack } from "./composio-connector.js";
import { ComposioEmulator } from "./composio-emulator.js";

const context = {
  operationId: "test",
  traceId: "test",
  spaceId: "workspace",
  userId: "user-1",
  signal: new AbortController().signal,
};

const gmailContext = {
  ...context,
  connectedConnections: [
    {
      id: "connection-gmail",
      connectorId: "composio",
      externalId: "GMAIL",
      displayName: "Gmail",
    },
  ],
};

async function collectResults(
  emulator: ComposioEmulator,
  tool: string,
  args: Record<string, unknown>,
) {
  const events = [];
  for await (const event of emulator.execute(
    { tool, args, executionId: `exec-${tool}` },
    gmailContext,
  )) {
    events.push(event);
  }
  return events;
}

describe("ComposioEmulator", () => {
  it("remains registered when explicitly supplied without a live Composio key", () => {
    const emulator = new ComposioEmulator();
    const stack = createConnectorStack(false, emulator);

    expect(stack.connector.managed("composio")).toBe(emulator);
  });

  it("serves and searches a deterministic catalog", async () => {
    const emulator = new ComposioEmulator();

    // Six hosted-connector slugs plus the offline X capability pack (phase 07).
    await expect(emulator.catalog(context)).resolves.toHaveLength(7);
    await expect(emulator.catalog(context, "git")).resolves.toEqual([
      expect.objectContaining({ slug: "GITHUB", name: "GitHub", connected: false }),
    ]);
    await expect(emulator.catalog(context, "x")).resolves.toEqual([
      expect.objectContaining({ slug: "X", name: "X", connected: false }),
    ]);
  });

  it("isolates connection state by user and supports revoke", async () => {
    const emulator = new ComposioEmulator();
    await emulator.begin({ provider: "GMAIL", redirectUrl: "http://example.test" }, context);

    await expect(emulator.connectionReady(context, "GMAIL")).resolves.toBe(true);
    await expect(emulator.listConnectedSlugs(context.userId)).resolves.toEqual(["GMAIL"]);
    await expect(emulator.connectionReady({ ...context, userId: "user-2" }, "GMAIL")).resolves.toBe(
      false,
    );
    await expect(emulator.catalog(context, "gmail")).resolves.toEqual([
      expect.objectContaining({ slug: "GMAIL", connected: true }),
    ]);
    expect(emulator.mailboxFor(context.userId)?.messages.length).toBeGreaterThan(0);

    await emulator.revoke("GMAIL", context);
    await expect(emulator.connectionReady(context, "GMAIL")).resolves.toBe(false);
    expect(emulator.mailboxFor(context.userId)).toBeUndefined();
  });

  it("keeps the shared Gmail mailbox until the last connection is revoked", async () => {
    const emulator = new ComposioEmulator();
    const first = await emulator.begin(
      { provider: "GMAIL", redirectUrl: "http://example.test" },
      context,
    );
    const second = await emulator.begin(
      { provider: "GMAIL", redirectUrl: "http://example.test" },
      context,
    );
    expect(first.state).not.toEqual(second.state);
    expect(first.state.startsWith("GMAIL:")).toBe(true);
    expect(second.state.startsWith("GMAIL:")).toBe(true);

    await expect(emulator.connectionReady(context, "GMAIL")).resolves.toBe(true);
    expect(emulator.mailboxFor(context.userId)?.messages.length).toBeGreaterThan(0);

    await emulator.revoke(first.state, context);
    await expect(emulator.connectionReady(context, "GMAIL")).resolves.toBe(true);
    expect(emulator.mailboxFor(context.userId)).toBeDefined();

    await emulator.revoke(second.state, context);
    await expect(emulator.connectionReady(context, "GMAIL")).resolves.toBe(false);
    expect(emulator.mailboxFor(context.userId)).toBeUndefined();
  });

  it("accepts BCC-only Gmail send recipients", async () => {
    const emulator = new ComposioEmulator();
    await emulator.begin({ provider: "GMAIL", redirectUrl: "http://example.test" }, context);

    const events = await collectResults(emulator, "GMAIL_SEND_EMAIL", {
      bcc: ["hidden@example.test"],
      subject: "BCC only",
      body: "Sent with bcc only",
    });
    expect(events).toContainEqual(
      expect.objectContaining({
        type: "result",
        data: expect.objectContaining({
          successful: true,
          data: expect.objectContaining({
            messageId: expect.any(String),
          }),
        }),
      }),
    );
    const sent = emulator
      .mailboxFor(context.userId)
      ?.messages.find((message) => message.subject === "BCC only");
    expect(sent).toMatchObject({
      to: "hidden@example.test",
      messageText: "Sent with bcc only",
      labelIds: ["SENT"],
    });
  });

  it("discovers realistic Gmail tools and keeps thin actions for other apps", async () => {
    const emulator = new ComposioEmulator();
    const tools = await emulator.discoverTools({
      ...context,
      connectedConnections: [
        {
          id: "connection-gmail",
          connectorId: "composio",
          externalId: "GMAIL",
          displayName: "Gmail",
        },
        {
          id: "connection-slack",
          connectorId: "composio",
          externalId: "SLACK",
          displayName: "Slack",
        },
      ],
    });

    expect(tools.map((tool) => tool.name)).toEqual([
      "GMAIL_FETCH_EMAILS",
      "GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID",
      "GMAIL_FETCH_MESSAGE_BY_THREAD_ID",
      "GMAIL_SEND_EMAIL",
      "GMAIL_CREATE_EMAIL_DRAFT",
      "GMAIL_LIST_LABELS",
      "GMAIL_LIST_SEND_AS",
      "GMAIL_ADD_LABEL_TO_EMAIL",
      "SLACK_EMULATED_ACTION",
    ]);
    expect(tools.find((tool) => tool.name === "GMAIL_SEND_EMAIL")?.inputSchema).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        recipient_email: expect.any(Object),
        subject: expect.any(Object),
        body: expect.any(Object),
      }),
      required: ["subject"],
    });
  });

  it("round-trips Gmail fetch and send against in-memory mailbox state", async () => {
    const emulator = new ComposioEmulator();
    await emulator.begin({ provider: "GMAIL", redirectUrl: "http://example.test" }, context);

    const fetchEvents = await collectResults(emulator, "GMAIL_FETCH_EMAILS", {
      query: "from:teammate",
      max_results: 5,
    });
    expect(fetchEvents).toContainEqual(
      expect.objectContaining({
        type: "result",
        data: expect.objectContaining({
          successful: true,
          data: expect.objectContaining({
            messages: [
              expect.objectContaining({
                messageId: "18c5f5d1a2b3c4d6",
                subject: "Quarterly planning notes",
                snippet: expect.stringContaining("planning"),
              }),
            ],
            resultSizeEstimate: 1,
          }),
        }),
      }),
    );

    const sendEvents = await collectResults(emulator, "GMAIL_SEND_EMAIL", {
      recipient_email: "friend@example.test",
      subject: "Hello from emulator",
      body: "Deterministic send body",
    });
    expect(sendEvents).toContainEqual(
      expect.objectContaining({
        type: "result",
        data: expect.objectContaining({
          successful: true,
          data: expect.objectContaining({
            messageId: expect.any(String),
            threadId: expect.any(String),
            labelIds: ["SENT"],
          }),
        }),
      }),
    );

    const sent = emulator
      .mailboxFor(context.userId)
      ?.messages.find((message) => message.subject === "Hello from emulator");
    expect(sent).toMatchObject({
      to: "friend@example.test",
      messageText: "Deterministic send body",
      labelIds: ["SENT"],
    });

    const listed = await collectResults(emulator, "GMAIL_FETCH_EMAILS", {
      query: "subject:Hello",
      max_results: 10,
    });
    expect(listed[0]).toMatchObject({
      type: "result",
      data: {
        successful: true,
        data: {
          messages: [expect.objectContaining({ subject: "Hello from emulator" })],
          resultSizeEstimate: 1,
        },
      },
    });

    expect(emulator.executions.map((entry) => entry.tool)).toEqual([
      "GMAIL_FETCH_EMAILS",
      "GMAIL_SEND_EMAIL",
      "GMAIL_FETCH_EMAILS",
    ]);
  });

  it("exposes seeded GitHub release tools without live OAuth", async () => {
    const emulator = new ComposioEmulator();
    const connectedContext = {
      ...context,
      connectedConnections: [
        {
          id: "connection-github",
          connectorId: "composio",
          externalId: "GITHUB",
          displayName: "GitHub",
        },
      ],
    };

    const tools = await emulator.discoverTools(connectedContext);
    expect(tools.map((tool) => tool.name)).toEqual(["GITHUB_LIST_RELEASES", "GITHUB_GET_RELEASE"]);
    expect(tools.map((tool) => tool.name)).not.toContain("GITHUB_EMULATED_ACTION");

    const events = [];
    for await (const event of emulator.execute(
      {
        tool: "GITHUB_LIST_RELEASES",
        args: { owner: "elie222", repo: "rakazo" },
        executionId: "github-list-releases",
      },
      connectedContext,
    )) {
      events.push(event);
    }
    expect(events).toContainEqual(
      expect.objectContaining({
        type: "result",
        data: expect.objectContaining({
          ok: true,
          releases: expect.arrayContaining([
            expect.objectContaining({ tag: "v0.4.2" }),
            expect.objectContaining({ tag: "v0.4.1" }),
          ]),
        }),
      }),
    );
    expect(emulator.listGithubReleases()[0]?.tag).toBe("v0.4.2");
  });

  it("lists send-as addresses and sends only from a verified one", async () => {
    const emulator = new ComposioEmulator();
    await emulator.begin({ provider: "GMAIL", redirectUrl: "http://example.test" }, context);

    const [listed] = await collectResults(emulator, "GMAIL_LIST_SEND_AS", {});
    const sendAs = (
      listed as {
        data: { data: { sendAs: { sendAsEmail: string; verificationStatus: string }[] } };
      }
    ).data.data.sendAs;
    expect(sendAs.map((alias) => alias.sendAsEmail)).toContain("team@example.test");

    const send = (from_email: string) =>
      collectResults(emulator, "GMAIL_SEND_EMAIL", {
        recipient_email: "client@example.test",
        subject: "Hello",
        body: "Hi",
        from_email,
      });
    const [sent] = await send("TEAM@example.test");
    expect((sent as { data: { successful: boolean } }).data.successful).toBe(true);
    expect(
      emulator.mailboxFor(context.userId)?.messages.find((m) => m.subject === "Hello")?.sender,
    ).toBe("team@example.test");
    const [pending] = await send("pending@example.test");
    expect((pending as { data: { successful: boolean } }).data.successful).toBe(false);
    const [stranger] = await send("stranger@example.test");
    expect((stranger as { data: { successful: boolean } }).data.successful).toBe(false);
  });

  it("finds spam only when asked and restores a message by changing its labels", async () => {
    const emulator = new ComposioEmulator();
    await emulator.begin({ provider: "GMAIL", redirectUrl: "http://example.test" }, context);
    type Fetched = { data: { data: { messages: { messageId: string; labelIds: string[] }[] } } };

    const [normal] = await collectResults(emulator, "GMAIL_FETCH_EMAILS", { max_results: 50 });
    expect((normal as Fetched).data.data.messages.some((m) => m.labelIds.includes("SPAM"))).toBe(
      false,
    );

    const [spam] = await collectResults(emulator, "GMAIL_FETCH_EMAILS", {
      label_ids: ["SPAM"],
      include_spam_trash: true,
    });
    const found = (spam as Fetched).data.data.messages;
    expect(found).toHaveLength(1);

    const [moved] = await collectResults(emulator, "GMAIL_ADD_LABEL_TO_EMAIL", {
      message_id: found[0]!.messageId,
      add_label_ids: ["INBOX"],
      remove_label_ids: ["SPAM"],
    });
    expect((moved as { data: { data: { labelIds: string[] } } }).data.data.labelIds).toEqual([
      "INBOX",
    ]);
    const [after] = await collectResults(emulator, "GMAIL_FETCH_EMAILS", {
      label_ids: ["SPAM"],
      include_spam_trash: true,
    });
    expect((after as Fetched).data.data.messages).toHaveLength(0);

    const [bad] = await collectResults(emulator, "GMAIL_ADD_LABEL_TO_EMAIL", {
      message_id: found[0]!.messageId,
      add_label_ids: ["NOT_A_LABEL"],
    });
    expect((bad as { data: { successful: boolean } }).data.successful).toBe(false);
  });
});
