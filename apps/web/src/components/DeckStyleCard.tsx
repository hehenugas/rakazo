import { useLingui } from "@lingui/react/macro";
import type { DeckStyle, MessageBlock } from "@rakazo/contracts";
import { DECK_STYLES } from "@rakazo/contracts";
import { useState } from "react";
import type { ArtifactTarget } from "../lib/artifact-open";
import { rpc } from "../lib/rpc";
import { deckSurfaceClass } from "./deck-surface";

type DeckStyleBlock = Extract<MessageBlock, { kind: "deck_style" }>;

/** The style choice for a new deck; picking one is what sets the deck's style. */
export function DeckStyleCard({
  block,
  target,
  messageId,
  onRefresh,
}: {
  block: DeckStyleBlock;
  target: ArtifactTarget;
  messageId: string;
  onRefresh: () => Promise<void>;
}) {
  const { t } = useLingui();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const label: Record<DeckStyle, string> = {
    clean: t`Clean`,
    editorial: t`Editorial`,
    dark: t`Dark`,
  };

  async function choose(style: DeckStyle) {
    if (busy || block.selected) return;
    setBusy(true);
    setError(null);
    try {
      await rpc.threads.chooseDeckStyle({ ...target, messageId, choiceId: block.choiceId, style });
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t`Could not choose a style`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div data-testid="deck-style-card" className="w-full max-w-[560px]">
      <div className="flex gap-2">
        {DECK_STYLES.filter((style) => !block.selected || style === block.selected).map((style) => (
          <button
            key={style}
            type="button"
            disabled={busy || Boolean(block.selected)}
            aria-pressed={block.selected === style}
            onClick={() => void choose(style)}
            className="w-36 rounded-xl border border-border bg-card p-1.5 text-start disabled:opacity-100 enabled:hover:border-foreground/40 aria-pressed:border-foreground"
          >
            <span
              className={`flex aspect-video flex-col justify-center gap-1 rounded-lg border border-border px-2.5 ${deckSurfaceClass(style)}`}
              aria-hidden="true"
            >
              <span className="h-1.5 w-3/4 rounded-full bg-current opacity-90" />
              <span className="h-1 w-1/2 rounded-full bg-current opacity-40" />
              <span className="h-1 w-2/3 rounded-full bg-current opacity-40" />
            </span>
            <span className="mt-1.5 block px-1 text-[12px] font-medium text-foreground">
              {label[style]}
            </span>
          </button>
        ))}
      </div>
      {error ? (
        <div role="alert" className="mt-2 text-[12px] text-destructive">
          {error}
        </div>
      ) : null}
    </div>
  );
}
