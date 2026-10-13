# Phase 28 — Slide Decks & Artifact Export

## Objective

Let a Bot build a slide deck as a real, versioned artifact with an in-chat preview and a PowerPoint download, reusing the existing artifact model, storage and ownership rules. Reference: v0.68.1 changelog line only ("Bots can build slide decks with you, showing sample slides to choose from, and deliver them as PowerPoint files or Google Slides"); semantics beyond that line are `unverified`.

## Maintainer directive

All M4 phases were requested in one run; documented exception to the M3 Phase 23 dependency.

## Design

- **Format-neutral deck (`@rakazo/core/presentation.ts`).** `Deck {title, slides[{title, bullets[], notes?}]}` with hard limits (60 slides, 12 bullets, text lengths) and `parseDeck` validation for model input and stored JSON alike. The deck is the source of truth; formats are renderers.
- **Storage = the existing artifact store.** `saveDeckArtifact` writes the deck JSON under a stable name (`<slug>.deck.json`, mime `application/vnd.rakazo.deck+json`) through `withResolvedArtifactVersion`, so saving the same title again is a new version of the same artifact, owned by the run's user like any artifact. No new table, no migration.
- **Agent tool `presentation_save`.** One tool creates and revises decks; the result is a `deck` message block (additive contract) carrying a short slide preview.
- **Export on the server (`artifacts.exportDeck`).** Looks the artifact up with the actor's space and user, re-validates the stored JSON, and renders a `.pptx` with `pptxgenjs` (MIT, exact version pinned in `packages/adapters`). Text stays editable text boxes; speaker notes are carried. Format is an enum (`pptx`) so more renderers slot in without UI changes.
- **UI.** Web `DeckCard`: title, slide count, a strip of slide previews, a PowerPoint download with pending and error states. Mobile: a native summary card with the first slide titles (no export on mobile). The Artifacts list labels these `DECK`.
- **Not offered.** Google Slides needs a connected Google account and an authorized create call, and no connector contract here provides it, so no control is shown. Sample-slide choice ("showing sample slides to choose from") is conversational: the Bot can propose slides and re-save a chosen version.
