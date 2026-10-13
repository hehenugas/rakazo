import type { Actor } from "@rakazo/contracts";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { draftActionNonce, submitDraftAction, updateDraftAction } from "./draft-actions.js";

const sendThreadMessage = vi.hoisted(() => vi.fn());
vi.mock("./thread-target.js", () => ({ sendThreadMessage }));

const actor = { spaceId: "space-1", userId: "user-1" } as Actor;
const target = { kind: "bot", botId: "bot-1", threadId: "thread-1" } as never;

const emailFields = [
  { key: "to", label: "To", value: "client@example.test" },
  { key: "subject", label: "Subject", value: "Hello" },
  { key: "body", label: "Body", value: "Hi there", multiline: true },
];

function card(overrides: Record<string, unknown> = {}) {
  return {
    kind: "draft_action",
    draftId: "draft-1",
    provider: "gmail",
    action: "send_email",
    title: "Hello",
    fields: emailFields,
    status: "draft",
    ...overrides,
  };
}

function setup(block: Record<string, unknown>) {
  let blocks = [block];
  const prisma = {
    message: {
      findFirst: vi.fn(async () => ({ id: "message-1", blocks })),
      updateMany: vi.fn(
        async ({
          where,
          data,
        }: {
          where: { blocks: { equals: Record<string, unknown>[] } };
          data: { blocks: Record<string, unknown>[] };
        }) => {
          if (JSON.stringify(where.blocks.equals) !== JSON.stringify(blocks)) return { count: 0 };
          blocks = data.blocks;
          return { count: 1 };
        },
      ),
    },
  };
  const deps = { prisma, events: {}, jobs: {} } as never;
  return { prisma, deps, current: () => blocks[0] as { status: string; fields: unknown } };
}

const input = (fields = emailFields) => ({ messageId: "message-1", draftId: "draft-1", fields });

beforeEach(() => {
  sendThreadMessage.mockReset();
  sendThreadMessage.mockResolvedValue({});
});

describe("submitDraftAction", () => {
  it("freezes the approved fields and sends a server-built instruction with a stable nonce", async () => {
    const { deps, current } = setup(card());
    const edited = [...emailFields.slice(0, 2), { ...emailFields[2]!, value: "Edited body" }];

    await submitDraftAction(deps, actor, target, input(edited));

    expect(current()).toMatchObject({ status: "submitted", fields: edited });
    const [, , , sent] = sendThreadMessage.mock.calls[0]!;
    expect(sent.clientNonce).toBe(draftActionNonce("draft-1"));
    expect(sent.text).toContain("Execute this submitted draft action now.");
    expect(sent.text).toContain("Body (body): Edited body");
  });

  it("refuses an email draft with an invalid recipient and sends nothing", async () => {
    const { deps, current } = setup(card());
    const bad = [{ ...emailFields[0]!, value: "not-an-address" }, ...emailFields.slice(1)];

    await expect(submitDraftAction(deps, actor, target, input(bad))).rejects.toThrow(
      "Email draft needs attention: to.",
    );
    expect(sendThreadMessage).not.toHaveBeenCalled();
    expect(current().status).toBe("draft");
  });

  it("is idempotent: a second submit replays the same nonce with the frozen fields", async () => {
    const { deps } = setup(card({ status: "submitted" }));
    const tampered = [
      { ...emailFields[0]!, value: "attacker@example.test" },
      ...emailFields.slice(1),
    ];

    await submitDraftAction(deps, actor, target, input(tampered));

    const [, , , sent] = sendThreadMessage.mock.calls[0]!;
    expect(sent.clientNonce).toBe(draftActionNonce("draft-1"));
    expect(sent.text).toContain("client@example.test");
    expect(sent.text).not.toContain("attacker@example.test");
  });

  it("puts the card back to a draft when the run cannot start", async () => {
    const { deps, current } = setup(card());
    sendThreadMessage.mockRejectedValueOnce(new Error("no model"));

    await expect(submitDraftAction(deps, actor, target, input())).rejects.toThrow("no model");
    expect(current().status).toBe("draft");
  });

  it("does not submit a discarded draft", async () => {
    const { deps } = setup(card({ status: "discarded" }));
    await expect(submitDraftAction(deps, actor, target, input())).rejects.toThrow("discarded");
    expect(sendThreadMessage).not.toHaveBeenCalled();
  });

  it("skips email checks for other providers", async () => {
    const { deps } = setup(
      card({
        provider: "slack",
        action: "send_message",
        fields: [{ key: "text", label: "Message", value: "hi" }],
      }),
    );
    await submitDraftAction(
      deps,
      actor,
      target,
      input([{ key: "text", label: "Message", value: "hi" }]),
    );
    expect(sendThreadMessage).toHaveBeenCalledOnce();
  });
});

describe("updateDraftAction", () => {
  it("freezes submitted and discarded cards", async () => {
    for (const status of ["submitted", "discarded"]) {
      const { prisma } = setup(card({ status }));
      await expect(
        updateDraftAction(prisma as never, target, { ...input(), status: "draft" }),
      ).rejects.toThrow("already sent or discarded");
      expect(prisma.message.updateMany).not.toHaveBeenCalled();
    }
  });

  it("cannot mark a draft submitted without sending it", async () => {
    const { prisma, current } = setup(card());
    await expect(
      updateDraftAction(prisma as never, target, { ...input(), status: "submitted" }),
    ).rejects.toThrow("Send the draft to submit it.");
    expect(current().status).toBe("draft");
  });

  it("does not overwrite a card that changed after it was read", async () => {
    const { prisma, current } = setup(card());
    prisma.message.findFirst.mockImplementationOnce(async () => ({
      id: "message-1",
      blocks: [
        card({
          fields: [{ ...emailFields[0]!, value: "stale@example.test" }, ...emailFields.slice(1)],
        }),
      ],
    }));
    await expect(
      updateDraftAction(prisma as never, target, { ...input(), status: "draft" }),
    ).rejects.toThrow("changed");
    expect(current().status).toBe("draft");
  });

  it("still saves and discards a draft", async () => {
    const { prisma, current } = setup(card());
    await updateDraftAction(prisma as never, target, { ...input(), status: "discarded" });
    expect(current().status).toBe("discarded");
  });
});

describe("send-as options", () => {
  const options = ["me@example.test", "alias@example.test"];
  const withFrom = (value: string, fieldOptions?: string[]) => [
    { key: "from", label: "From", value, ...(fieldOptions ? { options: fieldOptions } : {}) },
    ...emailFields,
  ];

  it("sends from an allowed address and keeps the stored options on the frozen card", async () => {
    const { deps, current } = setup(card({ fields: withFrom("me@example.test", options) }));

    await submitDraftAction(deps, actor, target, input(withFrom("alias@example.test")));

    expect(current()).toMatchObject({ status: "submitted" });
    expect((current().fields as { key: string; options?: string[] }[])[0]).toEqual({
      key: "from",
      label: "From",
      value: "alias@example.test",
      options,
    });
    expect(sendThreadMessage.mock.calls[0]![3].text).toContain("From (from): alias@example.test");
  });

  it("refuses a sender outside the stored options, even if the client sends wider ones", async () => {
    const { deps, current } = setup(card({ fields: withFrom("me@example.test", options) }));

    await expect(
      submitDraftAction(
        deps,
        actor,
        target,
        input(withFrom("evil@example.test", [...options, "evil@example.test"])),
      ),
    ).rejects.toThrow("From must be one of its options.");
    expect(sendThreadMessage).not.toHaveBeenCalled();
    expect(current().status).toBe("draft");
  });

  it("does not let an edit add a field the card did not have", async () => {
    const { deps } = setup(card());
    await expect(
      submitDraftAction(deps, actor, target, input(withFrom("anyone@example.test", options))),
    ).rejects.toThrow("From is not part of this draft.");
    expect(sendThreadMessage).not.toHaveBeenCalled();
  });
});

describe("recovery", () => {
  it("sends once when the same draft is submitted twice at the same moment", async () => {
    const { deps, current } = setup(card());

    const results = await Promise.allSettled([
      submitDraftAction(deps, actor, target, input()),
      submitDraftAction(deps, actor, target, input()),
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(sendThreadMessage).toHaveBeenCalledOnce();
    expect(current().status).toBe("submitted");
  });

  it("recovers from a send that timed out: the card is editable again and a retry reuses the nonce", async () => {
    const { deps, current } = setup(card());
    sendThreadMessage.mockRejectedValueOnce(new Error("timed out"));

    await expect(submitDraftAction(deps, actor, target, input())).rejects.toThrow("timed out");
    expect(current().status).toBe("draft");

    await submitDraftAction(deps, actor, target, input());
    expect(current().status).toBe("submitted");
    const nonces = sendThreadMessage.mock.calls.map(([, , , sent]) => sent.clientNonce);
    expect(nonces).toEqual([draftActionNonce("draft-1"), draftActionNonce("draft-1")]);
  });

  it("refuses a discard that races with a send already in flight", async () => {
    const { deps, current, prisma } = setup(card());
    let discard: Promise<void> | undefined;
    sendThreadMessage.mockImplementationOnce(async () => {
      // Another tab discards while the run is being started: the card is already frozen.
      discard = updateDraftAction(prisma as never, target, { ...input(), status: "discarded" });
      await discard.catch(() => undefined);
      return {};
    });

    await submitDraftAction(deps, actor, target, input());

    await expect(discard).rejects.toThrow("already sent or discarded");
    expect(current().status).toBe("submitted");
  });
});
