# Phase 20 Handoff — Composer & Message Delivery Experience Parity

## Current Status

DONE — all 22 tasks and 5 verification items pass (2026-10-06).

## Owner

ZCode (GLM)

## Branch / Worktree

Local `main` (fork).

## Work Log

### 2026-10-06 — Phase implemented and verified (ZCode/GLM)

**List editing (`packages/core/src/composer-list.ts` + test, wired in Shell)**
- Pinned semantics (changelog v0.62.0): "-"/"1." start lists by typing; Shift+Enter continues a list item (incrementing numbers), terminates it on an empty item; Tab nests / Shift+Tab outdents list lines; plain Enter still sends; IME composition short-circuits everything; mention-picker keys resolve first. Pure functions, 8 unit tests.

**Add to prompt (changelog v0.62.0)**
- The selection pill now offers Quote and Add to prompt; Cmd/Ctrl+L works from the selectionchange key handler. Add to prompt inserts a markdown quote block at the composer caret without arming a reply (Composer receives the insert as a nonce-keyed request, mirroring the scroll-request pattern).

**Optimistic delivery (changelog v0.57.0/v0.62.0)**
- `applyOptimisticSend`/`dropReconciledOptimisticMessages` in `thread-events.ts`: the user bubble shows immediately; the durable copy reconciles by text whether it arrives via refresh or SSE.
- Slow-send progress bar arms only after the two-second threshold (COMP-004); fast sends show nothing.
- Failed sends are durable, actionable bubble state: "Failed to send" with Resend/Delete on the bubble itself (no global banner). Resend replays the original clientNonce (server-side idempotency, no duplicates); Delete removes the echo and hands the text back to the composer.
- Persistence: `failed-send-storage.ts` mirrors failed sends to localStorage per user; after a reload the echo is re-applied so Resend/Delete stays actionable; the commit-time prune drops a failure only when the durable copy proves the server has it (abort race).

**E2E (`composer-delivery.spec.ts`, 4 tests)**
- List semantics end-to-end (Shift+Enter/Tab/Enter-sends), Add to prompt, failed → Resend incl. reload persistence, failed → Delete. message-quote.spec gained durable-echo waits (`data-optimistic` marker) so selection never races the optimistic→durable swap.

## Files / Modules Changed

- `packages/core/src/composer-list.ts` + test; `packages/core/src/index.ts`
- `apps/web/src/pages/Shell.tsx` (composer key handling, pill, optimistic pipeline, transcript render)
- `apps/web/src/lib/thread-events.ts`; `apps/web/src/lib/failed-send-storage.ts` (new)
- `apps/web/e2e/composer-delivery.spec.ts` (new); `apps/web/e2e/message-quote.spec.ts` (durable waits)

## Verification Run

| Suite | Result |
|---|---|
| turbo check (core/contracts/api/web/adapters) | 15/15 (mobile check fails on an Expo patch-version registry drift — environmental, code typechecks clean; see follow-ups) |
| Unit: core + web (65 files) | 451 passed; 1 pre-existing environment failure (`desktop-runtime`, verified on the clean tree) |
| E2E (local harness) | composer-delivery 4/4, message-quote 6/6, draft-action 1/1 |

## Decisions Made During Phase

- List editing is pure text transformation over the existing textarea — no editor framework, no contentEditable — keeping IME, pickers, spellcheck, and a11y behavior byte-identical outside list contexts.
- The optimistic echo reconciles by text (message payloads carry no client id), and failed sends prune only on durable-twin proof — the abort-race (a "failed" send the server actually processed) self-heals instead of offering a duplicate Resend.
- Failed-send persistence is per-user localStorage with a 50-entry cap, mirroring the seen-run-error storage convention.

## Blockers

None.

## Discovered Follow-ups

- Mobile failed-send cards (Resend/Delete) remain banner+preserved-draft on mobile — the mobile surface for COMP-005 lands with the phase 23 mobile sweep per REL-002.
- `apps/mobile` `pnpm check` fails on an Expo patch-version registry drift (`expo install --check` wants ~57.0.27 minors); `expo install --fix` is incompatible with pnpm workspaces — needs a lockfile-refreshing dependency bump outside this phase.
- The failure-injection e2e initially raced request transmission with `route.abort()`; `route.fulfill(500)` is the deterministic pattern for forcing RPC failures in this suite.

## Next Recommended Task

Execute Phase 21 (Transcript, Voice, Approvals & Connect Apps Parity): start with the summary-first approval card (v0.56.0 pinning: one-sentence summary, command/reasoning behind "View the full request"), then voice transcript with word-sync + click-to-seek (requires extending the transcription adapter to carry segment timing), then the Connect apps "Search plugins" terminology + featured-logo treatment.

## Final Summary

DONE — the composer now teaches the learned Grok habits: list typing with Shift+Enter/Tab semantics and Enter-still-sends, Add to prompt beside Quote, immediate delivery with delayed progress chrome, and failed sends as durable actionable bubble state (Resend/Delete) that even survives reloads — all verified by unit and e2e suites.
