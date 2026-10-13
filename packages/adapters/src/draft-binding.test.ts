import { describe, expect, it, vi } from "vitest";
import { approvedEmailBindingError, loadApprovedEmailDraft } from "./draft-binding.js";

const approved = {
  from: "",
  to: ["client@example.test"],
  cc: [],
  bcc: [],
  subject: "Hello",
  body: "Hi there",
};

describe("approvedEmailBindingError", () => {
  const matching = { recipient_email: "client@example.test", subject: "Hello", body: "Hi there" };

  it("does nothing without an approved draft or for non-email tools", () => {
    expect(
      approvedEmailBindingError(null, "GMAIL_SEND_EMAIL", "gmail", { subject: "x" }),
    ).toBeNull();
    expect(approvedEmailBindingError(approved, "SLACK_SEND_MESSAGE", "slack", {})).toBeNull();
    expect(approvedEmailBindingError(approved, "GMAIL_FETCH_EMAILS", "gmail", {})).toBeNull();
    expect(approvedEmailBindingError(approved, "GMAIL_CREATE_EMAIL_DRAFT", "gmail", {})).toBeNull();
    // Looking up the send-as addresses sends nothing.
    expect(approvedEmailBindingError(approved, "GMAIL_LIST_SEND_AS", "gmail", {})).toBeNull();
  });

  it("sends from the chosen send-as address, and refuses another", () => {
    const withSender = { ...approved, from: "team@example.test" };
    expect(
      approvedEmailBindingError(withSender, "GMAIL_SEND_EMAIL", "gmail", {
        ...matching,
        from_email: "team@example.test",
      }),
    ).toBeNull();
    expect(
      approvedEmailBindingError(withSender, "GMAIL_SEND_EMAIL", "gmail", {
        ...matching,
        from_email: "me@example.test",
      }),
    ).toContain("from");
  });

  it("lets the approved email through", () => {
    expect(approvedEmailBindingError(approved, "GMAIL_SEND_EMAIL", "gmail", matching)).toBeNull();
  });

  it("refuses a changed email and names the fields", () => {
    const error = approvedEmailBindingError(approved, "GMAIL_SEND_EMAIL", "gmail", {
      ...matching,
      recipient_email: "someone-else@example.test",
      body: "Different",
    });
    expect(error).toContain("exactly as the user approved");
    expect(error).toContain("to, body");
  });

  it("covers replies and forwards, and unverifiable argument shapes", () => {
    expect(approvedEmailBindingError(approved, "GMAIL_REPLY_TO_THREAD", "gmail", {})).toContain(
      "not verifiable",
    );
  });
});

describe("loadApprovedEmailDraft", () => {
  function prismaWith(source: unknown, card: unknown) {
    return {
      message: {
        findFirst: vi.fn().mockResolvedValueOnce(source).mockResolvedValueOnce(card),
      },
    } as never;
  }
  const submittedCard = {
    blocks: [
      {
        kind: "draft_action",
        draftId: "draft-1",
        provider: "gmail",
        action: "send_email",
        title: "Hello",
        fields: [
          { key: "to", label: "To", value: "client@example.test" },
          { key: "subject", label: "Subject", value: "Hello" },
          { key: "body", label: "Body", value: "Hi there" },
        ],
        status: "submitted",
      },
    ],
  };
  const run = { threadId: "thread-1", sourceMessageId: "message-2" };

  it("returns the approved email for a run started by submitting that draft", async () => {
    const result = await loadApprovedEmailDraft(
      prismaWith({ clientNonce: "draft-action:draft-1" }, submittedCard),
      run,
    );
    expect(result).toEqual(approved);
  });

  it("returns null for ordinary runs, other nonces, and drafts that are not submitted", async () => {
    expect(
      await loadApprovedEmailDraft(prismaWith(null, null), { ...run, sourceMessageId: null }),
    ).toBeNull();
    expect(await loadApprovedEmailDraft(prismaWith({ clientNonce: "abc" }, null), run)).toBeNull();
    const stillDraft = { blocks: [{ ...submittedCard.blocks[0], status: "draft" }] };
    expect(
      await loadApprovedEmailDraft(
        prismaWith({ clientNonce: "draft-action:draft-1" }, stillDraft),
        run,
      ),
    ).toBeNull();
  });
});
