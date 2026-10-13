import { Trans, useLingui } from "@lingui/react/macro";
import type {
  ConnectionPresentationDelivery,
  MessageBlock,
  PresentationDeliveryStatus,
} from "@rakazo/contracts";
import { Button, NativeSelect, NativeSelectOption, Spinner } from "@rakazo/ui-web";
import { Download, Send } from "lucide-react";
import { useEffect, useState } from "react";
import {
  type ArtifactTarget,
  decodeArtifactBase64,
  downloadArtifactBytes,
} from "../lib/artifact-open";
import { rpc } from "../lib/rpc";

type DeckBlock = Extract<MessageBlock, { kind: "deck" }>;

/** A slide deck in the chat: preview, PowerPoint export, and configured Slides delivery. */
export function DeckCard({ block, target }: { block: DeckBlock; target: ArtifactTarget }) {
  const { t } = useLingui();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deliveryBusy, setDeliveryBusy] = useState(false);
  const [deliveryOptions, setDeliveryOptions] = useState<ConnectionPresentationDelivery[] | null>(
    null,
  );
  const [connectionId, setConnectionId] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState<PresentationDeliveryStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    void rpc.connections
      .presentationDelivery()
      .then((rows) => {
        if (cancelled) return;
        setDeliveryOptions(rows);
        setConnectionId((current) =>
          rows.some((row) => row.connectionId === current)
            ? current
            : rows.length === 1
              ? rows[0]!.connectionId
              : "",
        );
      })
      .catch(() => {
        if (!cancelled) setDeliveryOptions([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!connectionId) {
      setDeliveryStatus(null);
      return;
    }
    let cancelled = false;
    setDeliveryStatus(null);
    void rpc.artifacts
      .deckDeliveryStatus({ artifactId: block.artifactId, connectionId })
      .then((status) => {
        if (!cancelled) setDeliveryStatus(status);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [block.artifactId, connectionId]);

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

  async function deliverToSlides() {
    if (deliveryBusy || !connectionId) return;
    setDeliveryBusy(true);
    setError(null);
    try {
      const status = await rpc.threads.deliverDeck({
        ...target,
        artifactId: block.artifactId,
        destination: "google_slides",
        connectionId,
      });
      setDeliveryStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : t`Could not send to Google Slides`);
    } finally {
      setDeliveryBusy(false);
    }
  }

  const deliveryStatusText = (status: PresentationDeliveryStatus["status"]) => {
    switch (status) {
      case "pending":
        return t`Pending`;
      case "delivered":
        return t`Delivered`;
      case "failed":
        return t`Delivery failed`;
      case "unknown":
        return t`Outcome unknown`;
      case "unsupported":
        return t`Unsupported`;
    }
  };

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
          {deliveryOptions && deliveryOptions.length > 0 ? (
            <Button
              size="sm"
              variant="outline"
              disabled={
                deliveryBusy ||
                !connectionId ||
                deliveryStatus?.status === "pending" ||
                deliveryStatus?.status === "delivered" ||
                deliveryStatus?.status === "unknown"
              }
              onClick={() => void deliverToSlides()}
            >
              {deliveryBusy ? <Spinner /> : <Send size={14} aria-hidden="true" />}
              <Trans>Google Slides</Trans>
            </Button>
          ) : null}
          <Button size="sm" variant="outline" disabled={busy} onClick={() => void download()}>
            {busy ? <Spinner /> : <Download size={14} aria-hidden="true" />}
            <Trans>PowerPoint</Trans>
          </Button>
        </div>
      </div>

      {deliveryOptions && deliveryOptions.length > 1 ? (
        <div className="mt-3">
          <label
            htmlFor={`deck-slides-account-${block.artifactId}`}
            className="mb-1 block text-[11.5px] font-medium text-muted-foreground"
          >
            <Trans>Account</Trans>
          </label>
          <NativeSelect
            id={`deck-slides-account-${block.artifactId}`}
            value={connectionId}
            disabled={deliveryBusy}
            onChange={(event) => setConnectionId(event.target.value)}
          >
            <NativeSelectOption value="" disabled>
              <Trans>Account</Trans>
            </NativeSelectOption>
            {deliveryOptions.map((option) => (
              <NativeSelectOption key={option.connectionId} value={option.connectionId}>
                {option.displayName}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      ) : null}

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
            {slide.layout === "quote" ? (
              <p className="mt-1 line-clamp-2 text-[9.5px] italic leading-tight text-muted-foreground" dir="auto">
                {slide.quote}
              </p>
            ) : slide.layout === "two_column" ? (
              <div className="mt-1 grid grid-cols-2 gap-1 text-[8.5px] leading-tight text-muted-foreground">
                {[slide.leftColumn, slide.rightColumn].map((column, columnIndex) => (
                  <div key={columnIndex} className="min-w-0">
                    {column?.heading ? <div className="truncate font-medium">{column.heading}</div> : null}
                    {column?.bullets.slice(0, 1).map((bullet, bulletIndex) => (
                      <div key={bulletIndex} className="truncate" dir="auto">
                        {bullet}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : slide.layout === "chart" && slide.chart ? (
              <div className="mt-2 min-w-0 text-[8.5px] leading-tight text-muted-foreground">
                <div className="mb-1 truncate font-medium">
                  {slide.chart.title ?? (
                    slide.chart.type === "bar" ? <Trans>Bar chart</Trans> :
                      slide.chart.type === "line" ? <Trans>Line chart</Trans> : <Trans>Pie chart</Trans>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {slide.chart.categories.slice(0, 3).map((category, categoryIndex) => (
                    <div key={`${categoryIndex}:${category}`} className="min-w-0 truncate">
                      <span className="font-medium">{category}</span>
                      {slide.chart!.series.slice(0, 2).map((series) => (
                        <span key={series.name} className="ms-1">
                          {series.values[categoryIndex]}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <ul className="mt-1 space-y-0.5 text-[9.5px] leading-tight text-muted-foreground">
                {slide.bullets.slice(0, 3).map((bullet, bulletIndex) => (
                  <li key={bulletIndex} className="truncate" dir="auto">
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
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
      {deliveryStatus ? (
        <div className="mt-3 flex items-center justify-between gap-3 text-[12px] text-muted-foreground">
          <span>{deliveryStatusText(deliveryStatus.status)}</span>
          {deliveryStatus.status === "delivered" && deliveryStatus.url ? (
            <a
              href={deliveryStatus.url}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              <Trans>Open</Trans>
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
