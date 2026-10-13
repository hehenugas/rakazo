import type { DeckImage } from "@rakazo/contracts";
import { DECK_IMAGE_MIME_TYPES } from "@rakazo/contracts";
import { useEffect, useState } from "react";
import { decodeArtifactBase64 } from "../lib/artifact-open";
import { rpc } from "../lib/rpc";

/** An owned PNG/JPEG artifact on a slide, loaded through the owner's artifact access only. */
export function DeckSlideImage({ image, className }: { image: DeckImage; className?: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    setUrl(null);
    void rpc.artifacts
      .getById({ artifactId: image.artifactId })
      .then((artifact) => {
        if (cancelled || !(DECK_IMAGE_MIME_TYPES as readonly string[]).includes(artifact.mimeType)) {
          return;
        }
        const bytes = decodeArtifactBase64(artifact.contentBase64);
        objectUrl = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: artifact.mimeType }));
        setUrl(objectUrl);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [image.artifactId]);

  return url ? (
    <img src={url} alt={image.alt} className={className} />
  ) : (
    <div role="img" aria-label={image.alt} className={`bg-muted ${className ?? ""}`} />
  );
}
