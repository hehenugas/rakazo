// @vitest-environment jsdom

import type { MessageBlock } from "@rakazo/contracts";
import type { ComponentProps, ReactNode } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DraftActionCard } from "./DraftActionCard";

const updateDraftAction = vi.fn().mockResolvedValue({ ok: true });
const send = vi.fn().mockResolvedValue({ runId: "run-1", taskId: null });

vi.mock("../lib/rpc", () => ({
  rpc: {
    threads: {
      updateDraftAction: (...args: unknown[]) => updateDraftAction(...(args as [])),
      send: (...args: unknown[]) => send(...(args as [])),
    },
  },
}));
vi.mock("@lingui/react/macro", () => {
  const t = (parts: TemplateStringsArray, ...values: unknown[]) =>
    parts.reduce((text, part, index) => `${text}${index > 0 ? values[index - 1] : ""}${part}`, "");
  return { useLingui: () => ({ t }), Trans: ({ children }: { children: ReactNode }) => children };
});
vi.mock("@rakazo/ui-web", () => ({
  Button: ({ children, ...props }: ComponentProps<"button">) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
  Input: (props: ComponentProps<"input">) => <input {...props} />,
  Textarea: (props: ComponentProps<"textarea">) => <textarea {...props} />,
}));

type DraftBlock = Extract<MessageBlock, { kind: "draft_action" }>;

const draftBlock: DraftBlock = {
  kind: "draft_action",
  draftId: "draft-1",
  provider: "gmail",
  action: "send_email",
  title: "Intro call follow-up",
  fields: [
    { key: "to", label: "To", value: "client@example.test" },
    { key: "body", label: "Body", value: "Thanks!", multiline: true },
  ],
  status: "draft",
};

describe("DraftActionCard", () => {
  let root: Root;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.clearAllMocks();
  });

  function render(block: DraftBlock = draftBlock) {
    act(() =>
      root.render(
        <DraftActionCard
          target={{ botId: "bot-1" }}
          messageId="message-1"
          block={block}
          onRefresh={vi.fn().mockResolvedValue(undefined)}
        />,
      ),
    );
  }

  function button(label: string): HTMLButtonElement {
    const button = [...container.querySelectorAll("button")].find(
      (candidate) => candidate.textContent === label,
    );
    expect(button, `button ${label}`).toBeDefined();
    return button!;
  }

  it("keeps fields read-only until Edit, then persists edits as a draft", async () => {
    render();
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.readOnly).toBe(true);

    await act(async () => button("Edit").click());
    expect((container.querySelector("input") as HTMLInputElement).readOnly).toBe(false);

    await act(async () => button("Save").click());
    expect(updateDraftAction).toHaveBeenCalledWith(
      expect.objectContaining({
        botId: "bot-1",
        messageId: "message-1",
        draftId: "draft-1",
        status: "draft",
        fields: draftBlock.fields,
      }),
    );
    expect(send).not.toHaveBeenCalled();
  });

  it("submits by persisting the submitted status, then sends the execution prompt", async () => {
    render();

    await act(async () => button("Send").click());

    expect(updateDraftAction).toHaveBeenCalledWith(
      expect.objectContaining({ draftId: "draft-1", status: "submitted" }),
    );
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        botId: "bot-1",
        text: expect.stringContaining("Execute this submitted draft action now."),
        clientNonce: expect.stringContaining("draft-action:draft-1:"),
      }),
    );
  });

  it("discards without sending a message", async () => {
    render();

    await act(async () => button("Discard").click());

    expect(updateDraftAction).toHaveBeenCalledWith(
      expect.objectContaining({ status: "discarded" }),
    );
    expect(send).not.toHaveBeenCalled();
  });

  it("locks a non-draft card: read-only fields and no action row", () => {
    render({ ...draftBlock, status: "submitted" });
    expect((container.querySelector("input") as HTMLInputElement).readOnly).toBe(true);
    expect([...container.querySelectorAll("button")].map((b) => b.textContent)).not.toContain(
      "Send",
    );
    expect([...container.querySelectorAll("button")].map((b) => b.textContent)).not.toContain(
      "Discard",
    );
  });
});
