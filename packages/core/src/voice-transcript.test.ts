import { describe, expect, it } from "vitest";
import { activeTranscriptSegment, seekableSegments } from "./voice-transcript.js";

const segments = [
  { start: 0, end: 1, text: "hello" },
  { start: 1.5, end: 3, text: "world" },
];

describe("activeTranscriptSegment", () => {
  it("returns the segment covering the time", () => {
    expect(activeTranscriptSegment(segments, 0)).toBe(0);
    expect(activeTranscriptSegment(segments, 0.99)).toBe(0);
    expect(activeTranscriptSegment(segments, 2)).toBe(1);
  });

  it("is -1 in gaps and past the end", () => {
    expect(activeTranscriptSegment(segments, 1.2)).toBe(-1);
    expect(activeTranscriptSegment(segments, 5)).toBe(-1);
  });

  it("keeps the last segment active at its exact end", () => {
    expect(activeTranscriptSegment(segments, 3)).toBe(1);
  });

  it("handles no segments", () => {
    expect(activeTranscriptSegment([], 1)).toBe(-1);
  });
});

describe("seekableSegments", () => {
  it("is empty without timing so callers show plain text", () => {
    expect(seekableSegments(undefined)).toEqual([]);
    expect(seekableSegments({ text: "hi" })).toEqual([]);
    expect(seekableSegments({ text: "hi", segments: [] })).toEqual([]);
  });

  it("returns timed segments", () => {
    expect(seekableSegments({ text: "hello world", segments })).toEqual(segments);
  });
});
