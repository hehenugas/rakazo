// @vitest-environment jsdom

import type { MessageBlock } from "@rakazo/contracts";
import type { ComponentProps, ReactNode } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DeckCard } from "./DeckCard";

const listConnections = vi.fn();
const deliverDeck = vi.fn().mockResolvedValue({ ok: true });

vi.mock("../lib/rpc", () => ({
  rpc: {
    connections: { list: (...args: unknown[]) => listConnections(...(args as [])) },
    threads: { deliverDeck: (...args: unknown[]) => deliverDeck(...(args as [])) },
    artifacts: { exportDeck: vi.fn() },
  },
}));
vi.mock("../lib/artifact-open", () => ({
  decodeArtifactBase64: vi.fn(),
  downloadArtifactBytes: vi.fn(),
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
  Spinner: () => <span />,
}));

type DeckBlock = Extract<MessageBlock, { kind: "deck" }>;
const block: DeckBlock = {
  kind: "deck",
  artifactId: "artifact-1",
  title: "Launch plan",
  slideCount: 1,
  slides: [{ title: "Why now", bullets: ["Ready"] }],
};

describe("DeckCard", () => {
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

  async function render() {
    await act(async () =>
      root.render(<DeckCard block={block} target={{ botId: "bot-1" } as never} />),
    );
  }

  const labels = () => [...container.querySelectorAll("button")].map((b) => b.textContent);

  it("shows only the PowerPoint download without a Google Slides connection", async () => {
    listConnections.mockResolvedValue([
      { id: "c1", provider: "GMAIL", status: "connected" },
      { id: "c2", provider: "GOOGLESLIDES", status: "revoked" },
    ]);
    await render();
    expect(labels()).toEqual(["PowerPoint"]);
  });

  it("offers Google Slides when connected, and sends the deck once", async () => {
    listConnections.mockResolvedValue([
      { id: "c2", provider: "GOOGLESLIDES", status: "connected" },
    ]);
    await render();
    expect(labels()).toEqual(["Google Slides", "PowerPoint"]);

    const button = [...container.querySelectorAll("button")][0]!;
    await act(async () => button.click());
    expect(deliverDeck).toHaveBeenCalledWith({
      botId: "bot-1",
      artifactId: "artifact-1",
      destination: "google_slides",
    });
    expect(button.disabled).toBe(true);
    await act(async () => button.click());
    expect(deliverDeck).toHaveBeenCalledTimes(1);
  });

  it("shows the server's reason when delivery fails, and allows a retry", async () => {
    listConnections.mockResolvedValue([
      { id: "c2", provider: "googleslides", status: "connected" },
    ]);
    deliverDeck.mockRejectedValueOnce(new Error("Connect Google Slides first."));
    await render();
    await act(async () => [...container.querySelectorAll("button")][0]!.click());
    expect(container.textContent).toContain("Connect Google Slides first.");
    expect([...container.querySelectorAll("button")][0]!.disabled).toBe(false);
  });

  it("still renders when the connection list cannot be loaded", async () => {
    listConnections.mockRejectedValue(new Error("offline"));
    await render();
    expect(labels()).toEqual(["PowerPoint"]);
  });
});
