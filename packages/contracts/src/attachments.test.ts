import { describe, expect, it } from "vitest";
import { isAllowedAttachmentMimeType, MessageBlock, validateThreadsSendInput } from "./index.js";

describe("attachment contracts", () => {
  it("parses image and file message blocks", () => {
    expect(
      MessageBlock.parse({
        kind: "image",
        artifactId: "art_1",
        mimeType: "image/png",
        name: "shot.png",
      }),
    ).toMatchObject({ kind: "image", name: "shot.png" });
    expect(
      MessageBlock.parse({
        kind: "file",
        artifactId: "art_2",
        mimeType: "application/pdf",
        name: "brief.pdf",
        size: 1234,
      }),
    ).toMatchObject({ kind: "file", size: 1234 });
  });

  it("parses voice_memo blocks and accepts only known audio mime types", () => {
    expect(
      MessageBlock.parse({
        kind: "voice_memo",
        artifactId: "art_3",
        mimeType: "audio/webm",
        name: "memo.webm",
        size: 2048,
      }),
    ).toMatchObject({ kind: "voice_memo", size: 2048 });
    for (const mimeType of ["audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg", "audio/wav"]) {
      expect(isAllowedAttachmentMimeType(mimeType)).toBe(true);
    }
    expect(isAllowedAttachmentMimeType("video/mp4")).toBe(false);
  });

  it("requires text or attachments for threads.send", () => {
    expect(validateThreadsSendInput({ text: "hello" })).toBe(true);
    expect(validateThreadsSendInput({ artifactIds: ["art_1"] })).toBe(true);
    expect(validateThreadsSendInput({})).toBe(false);
    expect(validateThreadsSendInput({ artifactIds: ["a", "b", "c", "d", "e"] })).toBe(true);
  });
});
