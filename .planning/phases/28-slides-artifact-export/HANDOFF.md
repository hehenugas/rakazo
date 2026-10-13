# Phase 28 Handoff — Slide Decks & Artifact Export

## Current Status

DOING — 2026-10-12 (Claude Code, Sonnet 5.5). Create, preview and PowerPoint export work locally; Google Slides not offered.

## Branch

`m4-execution` (local, not pushed).

## Changes

- Core: `packages/core/src/presentation.ts` (+test); `blocksToAgentHistoryText` knows `deck`.
- Contracts: `deck` block (additive) and `artifacts.exportDeck`.
- Adapters: `presentation-artifacts.ts`, `presentation-pptx.ts` (+tests), tool `presentation_save`, executor handler, activity label, scripted runtime case; **new dependency `pptxgenjs@4.0.1`** (MIT, published 2025-06-26; brings `jszip`, `image-size`, and the empty placeholder package `https@1.0.0`). The lockfile also dropped two unrelated `transitivePeerDependencies` lines (`bufferutil`, `utf-8-validate`) during re-resolution.
- API: `presentation-export.ts` (+test), router handler.
- Web: `DeckCard.tsx`, Shell block render, `DECK` label in the Artifacts list.
- Mobile: deck summary card; the card renderer was also fixed so draft, project and voice-memo cards render without an accompanying ask-with-actions block (they were nested inside that branch). Three locale strings added (`{count} slides`).

## New visible copy (AGENTS.md copy rule)

- "PowerPoint" (button): names the download target; an icon alone would not say which format.
- "{n} slides": says what the card holds.
- "Export failed": shown only when the download fails.
- "DECK": file-type chip in the Artifacts list, same role as "PDF"/"HTML".
- Not extracted into `messages.po` (Phase 26 D-26-5); mobile strings are added to the three catalogs because a unit test requires it.

## Verification (local, `m4-execution` working tree)

- Unit: `presentation.test.ts` (5), `presentation-pptx.test.ts` (5), `presentation-export.test.ts` (3); Postgres: `presentation-artifacts.postgres.test.ts` (3, registered in the integration harness).
- Web e2e (harness): `slide-deck.spec.ts` 2/2 (card preview, `.pptx` download with `PK` signature, second request versions the same artifact).
- Typecheck: all packages except `@rakazo/mobile#check`'s `expo install --check` step; mobile `tsc --noEmit` clean; mobile unit suite 402/402 including the i18n coverage test.
- Lint 0 errors; unit failures are the 4 known host-dependent tests.
- Not verified: opening the file in PowerPoint, Keynote or Google Slides.

## Known limits

- Plain layout (cover + title/bullets); no images, charts, themes or fonts beyond Calibri; no in-card editing.
- Deck preview in the Artifacts viewer is not implemented (the chat card is the preview).
- Mobile has no export.
- `exportDeck` renders on demand; there is no cache.

## Upstream surface

`events.ts`/`rpc.ts` (additive), `executor.ts` (one import + one handler block), `router.ts` (one handler), `pnpm-lock.yaml`, `packages/adapters/package.json`, mobile locales (3 conflict-prone files). Prefer re-running `pnpm install` after an upstream merge over hand-resolving the lockfile.

## Next recommended task

Phase 29 (mobile voice and project cards).

## Code-first parity hardening follow-up — 2026-10-13

- `apps/web/src/components/DeckCard.tsx` no longer shows a Google Slides button based only on a connection row or treats a queued Bot instruction as a delivered presentation.
- `apps/api/src/presentation-export.ts` keeps the owned-artifact check and returns an explicit unsupported response because no structured Google Slides create/upload capability exists. PowerPoint export is unchanged. The old prompt helper remains deprecated and has no delivery caller.
- Verification for this follow-up: source review and TypeScript checks only. No screenshot, browser, provider, unit, E2E, or device verification was run. Google Slides remains unsupported and Phase 28 stays DOING.
