import { describe, expect, it } from "vitest";
import { parseTranscriptSegments, segmentsFromWords } from "./transcript-segments.js";

describe("parseTranscriptSegments", () => {
  it("accepts ordered timed segments", () => {
    expect(parseTranscriptSegments([{ start: 0, end: 1, text: " hi " }])).toEqual([
      { start: 0, end: 1, text: "hi" },
    ]);
  });

  it("drops all timing when any entry is malformed", () => {
    expect(
      parseTranscriptSegments([
        { start: 0, end: 1, text: "ok" },
        { start: 2, end: 1, text: "backwards" },
      ]),
    ).toEqual([]);
    expect(parseTranscriptSegments("nope")).toEqual([]);
    expect(parseTranscriptSegments([{ start: "0", end: 1, text: "x" }])).toEqual([]);
  });
});

describe("segmentsFromWords", () => {
  it("groups words and splits at sentence ends, skipping spacing and audio events", () => {
    const words = [
      { text: "Hello", start: 0, end: 0.3, type: "word" },
      { text: " ", start: 0.3, end: 0.35, type: "spacing" },
      { text: "there.", start: 0.35, end: 0.8, type: "word" },
      { text: "(laughs)", start: 0.8, end: 1, type: "audio_event" },
      { text: "Bye", start: 1.2, end: 1.5, type: "word" },
    ];
    expect(segmentsFromWords(words)).toEqual([
      { start: 0, end: 0.8, text: "Hello there." },
      { start: 1.2, end: 1.5, text: "Bye" },
    ]);
  });

  it("caps segment length", () => {
    const words = Array.from({ length: 10 }, (_, i) => ({
      text: `w${i}`,
      start: i,
      end: i + 0.5,
      type: "word",
    }));
    expect(segmentsFromWords(words)).toHaveLength(2);
  });

  it("returns nothing for missing or untimed words", () => {
    expect(segmentsFromWords(undefined)).toEqual([]);
    expect(segmentsFromWords([{ text: "x" }])).toEqual([]);
  });
});
