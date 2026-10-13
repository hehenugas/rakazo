import type { VoiceTranscribeResult } from "@rakazo/adapter-kit";

type Segments = NonNullable<VoiceTranscribeResult["segments"]>;

const MAX_WORDS_PER_SEGMENT = 8;
const SENTENCE_END = /[.!?。！？]$/;

/** Keep only well-formed segments; any malformed entry drops timing so text stays authoritative. */
export function parseTranscriptSegments(value: unknown): Segments {
  if (!Array.isArray(value)) return [];
  const segments: Segments = [];
  for (const item of value) {
    const { start, end, text } = (item ?? {}) as Record<string, unknown>;
    if (
      typeof start !== "number" ||
      typeof end !== "number" ||
      typeof text !== "string" ||
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      start < 0 ||
      end < start ||
      !text.trim()
    ) {
      return [];
    }
    segments.push({ start, end, text: text.trim() });
  }
  return segments;
}

/** Group word timings (seconds) into short readable segments that split at sentence ends. */
export function segmentsFromWords(value: unknown): Segments {
  if (!Array.isArray(value)) return [];
  const words: Segments = [];
  for (const item of value) {
    const { start, end, text, type } = (item ?? {}) as Record<string, unknown>;
    if (type !== undefined && type !== "word") continue;
    if (typeof text !== "string" || !text.trim()) continue;
    words.push({ start: start as number, end: end as number, text: text.trim() });
  }
  if (words.length === 0) return [];
  const segments: Segments = [];
  let group: Segments = [];
  const flush = () => {
    const first = group[0];
    const last = group[group.length - 1];
    if (!first || !last) return;
    segments.push({
      start: first.start,
      end: last.end,
      text: group.map((word) => word.text).join(" "),
    });
    group = [];
  };
  for (const word of words) {
    group.push(word);
    if (group.length >= MAX_WORDS_PER_SEGMENT || SENTENCE_END.test(word.text)) flush();
  }
  flush();
  return parseTranscriptSegments(segments);
}
