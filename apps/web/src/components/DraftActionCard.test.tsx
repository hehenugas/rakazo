// @vitest-environment jsdom

import type { MessageBlock } from "@rakazo/contracts";
import type { ComponentProps, ReactNode } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DraftActionCard } from "./DraftActionCard";

const updateDraftAction = vi.fn().mockResolvedValue({ ok: true });
const submitDraftAction = vi.fn().mockResolvedValue({ ok: true });

vi.mock("../lib/rpc", () => ({
  rpc: {
    threads: {
      updateDraftAction: (...args: unknown[]) => updateDraftAction(...(args as [])),
      submitDraftAction: (...args: unknown[]) => submitDraftAction(...(args as [])),
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
  NativeSelect: (props: ComponentProps<"select">) => <select {...props} />,
  NativeSelectOption: (props: ComponentProps<"option">) => <option {...props} />,
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
    { key: "subject", label: "Subject", value: "Intro call" },
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
    expect(submitDraftAction).not.toHaveBeenCalled();
  });

  it("submits through the server, which freezes and sends the approved fields", async () => {
    render();

    await act(async () => button("Send").click());

    expect(submitDraftAction).toHaveBeenCalledTimes(1);
    expect(submitDraftAction).toHaveBeenCalledWith({
      botId: "bot-1",
      messageId: "message-1",
      draftId: "draft-1",
      fields: draftBlock.fields,
    });
    expect(updateDraftAction).not.toHaveBeenCalled();
  });

  it("blocks Send and names the problem when an email draft is incomplete", async () => {
    render({
      ...draftBlock,
      fields: [
        { key: "to", label: "To", value: "not-an-address" },
        { key: "subject", label: "Subject", value: "" },
        { key: "body", label: "Body", value: "Hi", multiline: true },
      ],
    });

    expect(button("Send").disabled).toBe(true);
    expect(container.textContent).toContain("Invalid address");
    expect(container.textContent).toContain("Required");
    await act(async () => button("Send").click());
    expect(submitDraftAction).not.toHaveBeenCalled();
  });

  it("previews formatting as elements, never raw HTML", () => {
    render({
      ...draftBlock,
      fields: [
        { key: "to", label: "To", value: "client@example.test" },
        { key: "subject", label: "Subject", value: "Intro call" },
        {
          key: "body",
          label: "Body",
          value: "# Plan\n\nSee **notes** <img src=x onerror=alert(1)>\n\n- one\n- two",
          multiline: true,
        },
      ],
    });
    const preview = container.querySelector('[data-testid="draft-email-preview"]')!;
    expect(preview.querySelector("strong")?.textContent).toBe("notes");
    expect(preview.querySelectorAll("li")).toHaveLength(2);
    expect(preview.querySelector("img")).toBeNull();
    expect(preview.textContent).toContain("<img src=x onerror=alert(1)>");
  });

  it("discards without sending a message", async () => {
    render();

    await act(async () => button("Discard").click());

    expect(updateDraftAction).toHaveBeenCalledWith(
      expect.objectContaining({ status: "discarded" }),
    );
    expect(submitDraftAction).not.toHaveBeenCalled();
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

  it("offers a sender picker only when the card carries allowed addresses", async () => {
    render();
    expect(container.querySelector("select")).toBeNull();

    act(() => root.unmount());
    root = createRoot(container);
    render({
      ...draftBlock,
      fields: [
        {
          key: "from",
          label: "From",
          value: "me@example.test",
          options: ["me@example.test", "alias@example.test"],
        },
        ...draftBlock.fields,
      ],
    });
    const select = container.querySelector("select") as HTMLSelectElement;
    expect([...select.options].map((option) => option.value)).toEqual([
      "me@example.test",
      "alias@example.test",
    ]);
    expect(select.disabled).toBe(true);

    await act(async () => button("Edit").click());
    expect((container.querySelector("select") as HTMLSelectElement).disabled).toBe(false);
  });
});
