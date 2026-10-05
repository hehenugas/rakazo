import { Trans } from "@lingui/react/macro";
import { LoaderCircle, Mic } from "lucide-react";
import { useEffect, useState } from "react";
import { rpc } from "../lib/rpc";

export function VoiceMemoCard({
  artifactId,
  mimeType,
  name,
}: {
  artifactId: string;
  mimeType: string;
  name: string;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

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
        <audio controls preload="metadata" className="h-9 w-full" src={src}>
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
      <span className="sr-only">{mimeType}</span>
    </div>
  );
}
