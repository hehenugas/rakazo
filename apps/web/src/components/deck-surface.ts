import type { DeckStyle } from "@rakazo/contracts";

/** The semantic-token surface a deck style renders on, shared by every in-app deck preview. */
export function deckSurfaceClass(style: DeckStyle | undefined): string {
  return style === "dark"
    ? "bg-foreground text-background"
    : style === "editorial"
      ? "bg-muted/50 text-foreground"
      : "bg-card text-foreground";
}
