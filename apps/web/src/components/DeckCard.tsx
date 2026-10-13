import { Trans, useLingui } from "@lingui/react/macro";
import type { MessageBlock } from "@rakazo/contracts";
import { Button, Spinner } from "@rakazo/ui-web";
import { Download } from "lucide-react";
import { useState } from "react";
import {
  type ArtifactTarget,
  decodeArtifactBase64,
  downloadArtifactBytes,
} from "../lib/artifact-open";
import { rpc } from "../lib/rpc";

type DeckBlock = Extract<MessageBlock, { kind: "deck" }>;

/** A slide deck in the chat: slide previews and a PowerPoint download. */
export function DeckCard({ block }: { block: DeckBlock; target: ArtifactTarget }) {
  const { t } = useLingui();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function download() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const file = await rpc.artifacts.exportDeck({ artifactId: block.artifactId, format: "pptx" });
      downloadArtifactBytes(file.name, file.mimeType, decodeArtifactBase64(file.contentBase64));
    } catch (err) {
      setError(err instanceof Error ? err.message : t`Export failed`);
    } finally {
      setBusy(false);
    }
  }

  const hidden = block.slideCount - block.slides.length;
  return (
    <div
      data-testid="deck-card"
      className="w-full max-w-[560px] rounded-[18px] border border-border bg-card px-4 py-4"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold text-foreground" dir="auto">
            {block.title}
          </div>
          <div className="mt-0.5 text-[11.5px] text-muted-foreground">
            {t`${block.slideCount} slides`}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" variant="outline" disabled={busy} onClick={() => void download()}>
            {busy ? <Spinner /> : <Download size={14} aria-hidden="true" />}
            <Trans>PowerPoint</Trans>
          </Button>
        </div>
      </div>

      <ul
        aria-label={block.title}
        className="mt-3 flex gap-2 overflow-x-auto pb-1"
        data-testid="deck-slides"
      >
        {block.slides.map((slide, index) => (
          <li
            key={index}
            className="aspect-video w-40 shrink-0 overflow-hidden rounded-lg border border-border bg-background px-2.5 py-2"
          >
            <div className="truncate text-[11px] font-semibold text-foreground" dir="auto">
              {slide.title}
            </div>
            <ul className="mt-1 space-y-0.5 text-[9.5px] leading-tight text-muted-foreground">
              {slide.bullets.slice(0, 3).map((bullet, bulletIndex) => (
                <li key={bulletIndex} className="truncate" dir="auto">
                  {bullet}
                </li>
              ))}
            </ul>
          </li>
        ))}
        {hidden > 0 ? (
          <li className="grid w-16 shrink-0 place-items-center text-[11px] text-muted-foreground">
            +{hidden}
          </li>
        ) : null}
      </ul>

      {error ? (
        <div role="alert" className="mt-3 text-[12px] text-destructive">
          {error}
        </div>
      ) : null}
    </div>
  );
}
