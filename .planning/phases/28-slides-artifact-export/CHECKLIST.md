# Phase 28 Checklist — Slide Decks & Artifact Export

## Status

DOING — Claude Code (Sonnet 5.5), branch `m4-execution`, 2026-10-12. Verified locally; the `.pptx` has not been opened in PowerPoint, Keynote, or Google Slides.

## Tasks

- [x] P28-01 Pin the Grok slide-deck interaction and export semantics. (`REFERENCE-SOURCES.md`: one changelog line; everything else `unverified`, see SPEC.)
- [x] P28-02 Format-neutral deck model and version lifecycle in the existing artifact infrastructure. (`presentation.ts`, `presentation-artifacts.ts`; Postgres test: version 1 then 2 of the same artifact name, ownership columns set, no orphaned object on failure.)
- [x] P28-03 Preview, progress, failure/retry, accessible edit/download. (Web `DeckCard` with pending spinner, error alert and re-click retry; e2e `slide-deck.spec.ts` with screenshot. Editing is conversational: ask the Bot to revise and it saves a new version; there is no in-card slide editor.)
- [x] P28-04 `.pptx` generation with editable text and deterministic tests. (`presentation-pptx.test.ts`: zip structure, one slide per slide plus a cover, text in `<a:t>` runs with escaping, notes slides, no images, 60×12 deck; e2e downloads `launch-plan.pptx` and checks the `PK` signature. Independent check with a one-off Python script: all 30 XML parts well-formed, every relationship target exists, content types declare every slide. **Not** opened in PowerPoint/Keynote/Slides: none is available here.)
- [ ] P28-05 Google Slides. — NOT DONE (provider-dependent): needs a connected Google account and a create-presentation capability; nothing is shown. Unblock: a connector capability that creates a presentation and returns its link, with no public sharing.
- [x] P28-06 Edge-case tests. (1 slide, 60 slides, escaping, notes, tampered stored JSON, non-deck artifact, foreign artifact, ownership in the lookup, no orphan object on DB failure. Not covered: images/fonts (not supported by the deck model), storage quota (artifacts share the existing 10 MiB attachment-style limits only for uploads; decks are bounded by the 60×12 limits), real provider outage, mobile device viewing.)

## Phase Verification

- [ ] VERIFY-01 P28-05 open (provider-dependent).
- [ ] VERIFY-02 No CI; no real Office/Slides client.

## DONE

- [ ] Phase not DONE.
