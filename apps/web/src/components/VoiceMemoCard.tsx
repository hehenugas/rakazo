import { Trans } from "@lingui/react/macro";
import type { VoiceTranscript } from "@rakazo/contracts";
import { activeTranscriptSegment, seekableSegments } from "@rakazo/core";
import { LoaderCircle, Mic } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { rpc } from "../lib/rpc";

export function VoiceMemoCard({
  artifactId,
  mimeType,
  name,
  transcript,
}: {
  artifactId: string;
  mimeType: string;
  name: string;
  transcript?: VoiceTranscript;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const segments = seekableSegments(transcript);

  useEffect(() => {
    let cancelled = false;
    setSrc(null);
    setFailed(false);
    void rpc.artifacts
      .getById({ artifactId })
      .then((artifact) => {
        if (cancelled) return;
        setSrc(`data:${artifact.mimeType};base64,${artifact.contentBase64}`);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [artifactId]);

  function seek(start: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = start;
    void audio.play().catch(() => undefined);
  }

  return (
    <div
      data-testid="voice-memo-card"
      className="w-full max-w-[420px] rounded-[18px] border border-border bg-card px-4 py-3"
    >
      <div className="mb-2 flex items-center gap-2 text-[12.5px] text-muted-foreground">
        <Mic size={14} strokeWidth={1.8} aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate" dir="auto">
          {name || <Trans>Voice memo</Trans>}
        </span>
      </div>
      {src ? (
        <audio
          ref={audioRef}
          controls
          preload="metadata"
          className="h-9 w-full"
          src={src}
          onTimeUpdate={(event) =>
            segments.length > 0
              ? setActiveIndex(activeTranscriptSegment(segments, event.currentTarget.currentTime))
              : undefined
          }
          onEnded={() => setActiveIndex(-1)}
        >
          <track kind="captions" />
        </audio>
      ) : failed ? (
        <div className="text-[12px] text-destructive">
          <Trans>Could not load this voice memo.</Trans>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <LoaderCircle size={13} className="animate-spin" aria-hidden="true" />
          <Trans>Loading voice memo…</Trans>
        </div>
      )}
      {transcript?.text ? (
        <p
          data-testid="voice-memo-transcript"
          dir="auto"
          className="mt-2.5 text-[14px] leading-6 text-foreground"
        >
          {segments.length > 0 && src
            ? segments.map((segment, index) => (
                <span key={`${segment.start}-${index}`}>
                  {index > 0 ? " " : null}
                  <button
                    type="button"
                    data-testid="voice-memo-segment"
                    aria-current={index === activeIndex ? "true" : undefined}
                    onClick={() => seek(segment.start)}
                    className={`rounded px-0.5 text-start transition-colors hover:bg-accent ${
                      index === activeIndex ? "bg-accent font-medium" : ""
                    }`}
                  >
                    {segment.text}
                  </button>
                </span>
              ))
            : transcript.text}
        </p>
      ) : null}
      <span className="sr-only">{mimeType}</span>
    </div>
  );
}
