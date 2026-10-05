# Phase 11 Handoff — Shell, Roster & Navigation Parity

## Current Status

DONE — shell parity implemented and verified (2026-10-05); reference-fidelity items that need authenticated Grok captures are recorded, not guessed.

## Owner

ZCode (GLM)

## Branch / Worktree

Local `main` (fork), pushed to `origin/main`.

## Work Log

### 2026-10-05 — Planning created

- Scope narrowed to exact shell/roster/navigation parity.
- No product code changed.

### 2026-10-05 — Shell parity implemented (ZCode/GLM)

- Reference decision P-006 recorded (`.planning/DECISIONS.md`): M2 proceeds from the pinned public reference set + recorded delta observations until authenticated captures are supplied; the capture procedure lives at `.planning/evidence/phase-10-reference/reference/SOURCE.md`.
- Implemented the recorded shell deltas (P11-02/P11-03): the wide Search and New chat pill buttons are now two compact 40px round icon controls with the same testids, aria-labels, toggle/popover behavior, and token-driven hover/pressed states. This is the only product-visual change of the phase.
- Canonical baselines re-generated with `--update-snapshots=all` (the harness now forwards the mode) and the canonical spec passes 18/18; `shell-parity.spec.ts` passes 4/4 after the redesign. Evidence copies refreshed under `.planning/evidence/phase-10-reference/`.
- Verified without changes (P11-04…P11-15): sidebar width/paddings and collapse, roster row geometry and unread presentation, Hidden Bots, header identity/computer affordance, centering, keyboard shortcuts — covered by the measured geometry and green e2e listed in the checklist.
- Deltas recorded (P11-20): avatar shape set and featured app-logo cluster treatment remain documented pending-reference items (P-006) — no logo or mascot artwork was invented.

## Files / Modules Expected

- `apps/web/src/pages/Shell.tsx` — sidebar Search/New chat compact round controls.
- `apps/web/e2e/parity/canonical-states.spec.ts-snapshots/` — re-baselined shell states.
- `.planning/evidence/phase-10-reference/` — refreshed evidence copies + `reference/SOURCE.md`.
- `.planning/DECISIONS.md` — decision P-006.

## Verification Run

| Suite | Command | Result |
|---|---|---|
| Canonical states | `pnpm test:e2e -- --spec=apps/web/e2e/parity/canonical-states.spec.ts` | 18/18 against re-baselined references (2026-10-05) |
| Shell parity | `pnpm test:e2e -- --spec=apps/web/e2e/shell-parity.spec.ts` | 4/4 |
| Typecheck | `pnpm --filter @rakazo/web exec tsc --noEmit` | clean |
| Lint | `pnpm exec biome check` on touched paths | clean |

## Decisions Made During Phase

- Decision P-006: with no authenticated Grok captures available to the session, parity work proceeds from the pinned public reference set and the SPEC's recorded delta observations; anything neither source pins stays `?` in the matrix and is not implemented from memory.

## Blockers

- None blocking this phase. Avatar-shape and featured-logo-cluster fidelity wait for authenticated reference captures (maintainer action, procedure in `reference/SOURCE.md`).

## Discovered Follow-ups

- When captures land, diff reference-vs-fork for the sidebar top row and footer, and revisit the roster-row spacing against measured Grok values.

## Next Recommended Task

1. Maintainer supplies authenticated Grok captures; diff reference-vs-fork with `scripts/visual-diff.mjs` and address the avatar-shape and featured-logo-cluster rows.
2. Start Phase 12 (Composer & Input Behavior Parity) — its measured targets (composer 880×52 centered) are already recorded.

## Final Summary

Complete within the pinned-reference scope of decision P-006 — the recorded actionable shell deltas are implemented and verified (canonical 18/18, shell-parity 4/4); avatar-shape and logo-cluster fidelity are documented pending authenticated reference captures.
