import { describe, expect, it, vi } from "vitest";

vi.mock("./api", () => ({ captureApiRequestContext: vi.fn(), rpc: vi.fn() }));
vi.mock("./i18n", () => ({ t: (key: string) => key }));
vi.mock("expo-file-system", () => ({ File: class {} }));

import { MEMO_MIME, type MemoDeps, sendVoiceMemo } from "./voice-memo";

const memo = { contentBase64: "QUJD", durationMs: 4_000 };

function deps(overrides: Partial<MemoDeps> = {}) {
  const calls: string[] = [];
  const value: MemoDeps = {
    transcribe: vi.fn(async () => ({ text: " Hello there ", segments: [] })),
    createArtifact: vi.fn(async () => {
      calls.push("create");
      return { id: "artifact-1" };
    }),
    send: vi.fn(async () => {
      calls.push("send");
    }),
    newNonce: () => "nonce-1",
    now: () => 1_700_000_000_000,
    ...overrides,
  };
  return { value, calls };
}

describe("sendVoiceMemo", () => {
  it("uploads the audio with its transcript, then sends the transcript as the message", async () => {
    const { value, calls } = deps();

    await sendVoiceMemo(value, { botId: "bot-1" }, memo, { transcribe: true });

    expect(calls).toEqual(["create", "send"]);
    expect(value.createArtifact).toHaveBeenCalledWith(
      { botId: "bot-1" },
      {
        name: "voice-memo-1700000000000.m4a",
        mimeType: MEMO_MIME,
        contentBase64: "QUJD",
        transcript: { text: " Hello there ", segments: [] },
      },
    );
    expect(value.send).toHaveBeenCalledWith(
      { botId: "bot-1" },
      { clientNonce: "nonce-1", text: "Hello there", artifactIds: ["artifact-1"] },
    );
  });

  it("sends audio only, labelled, when transcription is off or unavailable", async () => {
    const off = deps();
    await sendVoiceMemo(off.value, { groupId: "group-1" }, memo, { transcribe: false });
    expect(off.value.transcribe).not.toHaveBeenCalled();
    expect(off.value.send).toHaveBeenCalledWith(
      { groupId: "group-1" },
      { clientNonce: "nonce-1", text: "Voice memo", artifactIds: ["artifact-1"] },
    );

    const empty = deps({ transcribe: vi.fn(async () => null) });
    await sendVoiceMemo(empty.value, { botId: "bot-1" }, memo, { transcribe: true });
    expect(vi.mocked(empty.value.createArtifact).mock.calls[0]![1]).not.toHaveProperty(
      "transcript",
    );
  });

  it("does not lose the memo when transcription fails", async () => {
    const { value, calls } = deps({
      transcribe: vi.fn(async () => {
        throw new Error("provider down");
      }),
    });
    await sendVoiceMemo(value, { botId: "bot-1" }, memo, { transcribe: true });
    expect(calls).toEqual(["create", "send"]);
  });

  it("does not send a message when the upload fails", async () => {
    const { value } = deps({
      createArtifact: vi.fn(async () => {
        throw new Error("too large");
      }),
    });
    await expect(
      sendVoiceMemo(value, { botId: "bot-1" }, memo, { transcribe: false }),
    ).rejects.toThrow("too large");
    expect(value.send).not.toHaveBeenCalled();
  });

  it("carries the reply target", async () => {
    const { value } = deps();
    await sendVoiceMemo(value, { botId: "bot-1" }, memo, {
      transcribe: false,
      reply: { messageId: "message-9", quote: "earlier" },
    });
    expect(vi.mocked(value.send).mock.calls[0]![1]).toMatchObject({
      replyToMessageId: "message-9",
      replyQuote: "earlier",
    });
  });
});
