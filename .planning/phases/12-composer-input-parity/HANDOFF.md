# Phase 12 Handoff — Composer & Input Behavior Parity

## Current Status

DONE — composer behaviors inventoried, verified, and snapshotted (2026-10-05); reference-unpinned semantics recorded, not guessed.

## Owner

ZCode (GLM)

## Branch / Worktree

Local `main` (fork), pushed to `origin/main`.

## Work Log

### 2026-10-05 — Phase claimed (ZCode/GLM)

- Claimed P12-01…P12-20. Under decision P-006 the reference-pinned input behaviors (list-entry semantics, Tab nesting) stay `?` until authenticated captures; the phase focuses on verifying the existing composer behaviors, closing visual snapshot coverage, and recording deltas.

### 2026-10-05 — Planning created

- Scope covers input mechanics as well as visual composer parity.
- No product code changed.

## Blockers

Phase 10 input reference matrix must be complete.

## Next Recommended Task

After Phase 10, claim P12-01 and preserve current mentions/skills/attachments by adapting them into the reference interaction model rather than creating a parallel composer.

### 2026-10-05 — Composer parity verified and snapshotted (ZCode/GLM)

- Inventory (P12-01): the composer is a native textarea with a chip row (mentions/skill), mention/slash pickers, paste/drop attachments, voice memo entry, optimistic send, and delayed progress. Existing specs map 1:1 onto the checklist items — no parallel composer was created.
- New coverage (P12-19): `apps/web/e2e/parity/composer-states.spec.ts` adds seven committed element-level baselines — c1 empty, c2 text, c3 multiline, c4 mention chip, c5 pasted attachment, c6 voice recording, c7 running with stop. 7/7 green (twice).
- Verified unchanged (P12-02…P12-16): geometry (880×52, auto-growth), attachment/voice/send-stop controls, quote/reply, chips with IME-safe keys, optimistic send, delayed progress, in-flight sends — each backed by a green spec cited in the checklist.
- Race fix (commit `ab5b21b9`): the phase 12 CI run surfaced a residual panel deep-link race (a details-hub click landing after the storage key rendered but before the restore effect applied a stale `?panel=`). `setPanel` now consumes the deep-link latch itself, closing both interleavings; deep-link/composer/panel suites pass locally and the full pipeline is green in run `37398060496` (web e2e 205 passed / 0 failed).
- Recorded deltas (P12-20): list-entry/Tab-nesting semantics and reload persistence of drafts are not pinned by the public reference (decision P-006) and stay `?` in the parity matrix; nothing was invented. Native spellcheck stands (no override).

## Files / Modules Expected


