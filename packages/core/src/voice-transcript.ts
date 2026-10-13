import type { VoiceTranscript } from "@rakazo/contracts";

type Segment = NonNullable<VoiceTranscript["segments"]>[number];

/**
 * Index of the segment playing at `time` seconds, or -1 before the first segment and in
 * silent gaps after one ends. Segments are expected ordered; a malformed list yields -1.
 */
export function activeTranscriptSegment(segments: readonly Segment[], time: number): number {
  let found = -1;
  for (let index = 0; index < segments.length; index++) {
    const segment = segments[index];
    if (!segment || segment.start > time) break;
    if (time < segment.end || (index === segments.length - 1 && time <= segment.end)) found = index;
  }
  return found;
}

/** Segments only when they carry usable timing; otherwise the UI shows plain text. */
export function seekableSegments(transcript: VoiceTranscript | undefined): Segment[] {
  const segments = transcript?.segments;
  return segments && segments.length > 0 ? [...segments] : [];
}
