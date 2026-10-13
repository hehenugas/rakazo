import { inflateRawSync } from "node:zlib";
import type { Deck } from "@rakazo/core";
import { describe, expect, it } from "vitest";
import { PPTX_MIME, renderDeckPptx } from "./presentation-pptx.js";

/** Minimal zip reader (central directory + deflate) so the test needs no archive dependency. */
function unzip(bytes: Uint8Array): Map<string, string> {
  const buffer = Buffer.from(bytes);
  let end = buffer.length - 22;
  while (end >= 0 && buffer.readUInt32LE(end) !== 0x06054b50) end -= 1;
  if (end < 0) throw new Error("not a zip file");
  const count = buffer.readUInt16LE(end + 10);
  let offset = buffer.readUInt32LE(end + 16);
  const files = new Map<string, string>();
  for (let i = 0; i < count; i += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) throw new Error("bad central directory");
    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.toString("utf8", offset + 46, offset + 46 + nameLength);
    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const start = localOffset + 30 + localNameLength + localExtraLength;
    const data = buffer.subarray(start, start + compressedSize);
    files.set(name, (method === 8 ? inflateRawSync(data) : data).toString("utf8"));
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return files;
}

const textsOf = (xml: string) =>
  [...xml.matchAll(/<a:t>([^<]*)<\/a:t>/g)].map((match) => match[1]!);

const deck: Deck = {
  title: "Launch plan",
  slides: [
    { title: "Why now", bullets: ["Market is ready", "R&D <done>"], notes: "Open with the story" },
    { title: "Next steps", bullets: [] },
  ],
};

describe("renderDeckPptx", () => {
  it("produces a PowerPoint package with one slide per deck slide plus a cover", async () => {
    const files = unzip(await renderDeckPptx(deck));
    expect(files.has("[Content_Types].xml")).toBe(true);
    expect(files.has("ppt/presentation.xml")).toBe(true);
    const slides = [...files.keys()].filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name));
    expect(slides).toHaveLength(deck.slides.length + 1);
    expect(files.get("[Content_Types].xml")).toContain(
      "application/vnd.openxmlformats-officedocument.presentationml.slide+xml",
    );
    expect(PPTX_MIME).toBe(
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    );
  });

  it("keeps titles and bullets as editable text, with markup escaped", async () => {
    const files = unzip(await renderDeckPptx(deck));
    expect(textsOf(files.get("ppt/slides/slide1.xml")!)).toEqual(["Launch plan"]);
    const second = textsOf(files.get("ppt/slides/slide2.xml")!);
    expect(second).toContain("Why now");
    expect(second).toContain("Market is ready");
    expect(second).toContain("R&amp;D &lt;done&gt;");
    expect(files.get("ppt/slides/slide2.xml")).not.toContain("R&D <done>");
    // No slide is a picture of text.
    expect([...files.keys()].some((name) => /^ppt\/media\/.+/.test(name))).toBe(false);
    expect(files.get("ppt/slides/slide2.xml")).not.toContain("<p:pic>");
  });

  it("carries speaker notes", async () => {
    const files = unzip(await renderDeckPptx(deck));
    const notes = [...files.entries()].filter(([name]) => name.startsWith("ppt/notesSlides/"));
    expect(notes.some(([, xml]) => xml.includes("Open with the story"))).toBe(true);
  });

  it("handles a single slide and a full-size deck", async () => {
    const single = unzip(
      await renderDeckPptx({ title: "One", slides: [{ title: "Only", bullets: ["a"] }] }),
    );
    expect(
      [...single.keys()].filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name)),
    ).toHaveLength(2);

    const many: Deck = {
      title: "Big",
      slides: Array.from({ length: 60 }, (_, i) => ({
        title: `Slide ${i + 1}`,
        bullets: Array.from({ length: 12 }, (_, j) => `Point ${j + 1} ${"x".repeat(200)}`),
      })),
    };
    const files = unzip(await renderDeckPptx(many));
    expect(
      [...files.keys()].filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name)),
    ).toHaveLength(61);
  });

  it("is deterministic in structure for the same deck", async () => {
    const a = unzip(await renderDeckPptx(deck));
    const b = unzip(await renderDeckPptx(deck));
    expect([...a.keys()].sort()).toEqual([...b.keys()].sort());
    expect(textsOf(a.get("ppt/slides/slide2.xml")!)).toEqual(
      textsOf(b.get("ppt/slides/slide2.xml")!),
    );
  });
});
