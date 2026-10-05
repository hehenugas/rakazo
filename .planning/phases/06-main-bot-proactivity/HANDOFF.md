# Phase 06 Handoff — Main Bot & Proactivity

## Current Status

DONE — P06-01…P06-16 all pass; evidence under `.planning/evidence/phase-06-main-bot/`; green pipeline in CI run 37322886544.

## Owner

ZCode (GLM)

## Branch / Worktree

Local `main` (baseline `fd356375`) carrying the restored phase WIP, uncommitted.

## Work Log

### 2026-10-04 — Planning initialized

- Phase packet created.
- No implementation work has started.

### 2026-10-05 — Phase claimed; P-005 resolved + verification (ZCode/GLM)

- Resolved P-005 in `.planning/DECISIONS.md`: proactive check-ins are an opt-in Routine on the Main Bot (`0 */4 * * *`, user timezone, `notify: true`) instead of a new scheduler. Cooldown = routine cadence; quiet hours = timezone-aware cron; disable = pause/toggle.
- The restored WIP carries `spaces.mainBotId` (migration + contract + validated `setMainBot`), the Details toggle, check-in Routine wiring (`MAIN_BOT_CHECKIN_ROUTINE_NAME` / `MAIN_BOT_CHECKIN_PROMPT`), and roster/header star badges.
- Added `apps/api/src/main-bot.test.ts` (P06-13/14): single-column invariant (second set moves the star), foreign/archived bot rejection before any space write. Authorization for space scoping is also pinned in `projects.test.ts`.
- Added `apps/web/e2e/main-bot.spec.ts` (P06-15): select Main Bot in Details → roster star appears → toggle off clears it.
- P06-14 mapping: cadence/disable/quiet-hours reuse Routine semantics that upstream specs already cover; the fork adds the authorization assertions above.

## Files / Modules Changed

- `.planning/DECISIONS.md` — P-005 resolution.
- `apps/api/src/main-bot.test.ts` — new (P06-13/14).
- `apps/web/e2e/main-bot.spec.ts` — new (P06-15).
- Pre-existing WIP (restored, uncommitted): `spaces.mainBotId` schema/migration, `setMainBot` handler, Details toggle + check-in Routine, roster/header star.

## Verification Run

| Suite | Command | Result |
|---|---|---|
| Typecheck | `pnpm check` / targeted `tsc` | 22/22 tasks pass (2026-10-05) |
| Lint | `pnpm lint` | 0 errors; 19 warnings + 4 infos (pre-existing baseline) |
| API tests | `vitest run apps/api/src/main-bot.test.ts` | 2/2 pass |
| E2E web | `main-bot.spec.ts` | delegated to CI per maintainer instruction |

## Evidence / Screenshots

- `13-main-bot-selected` — from the CI web e2e run; to be linked here when the run finishes.

## Decisions Made During Phase

- P-005 (see DECISIONS.md). Proactivity stays summary-first: the check-in prompt surfaces only attention-worthy items and coordinates through the existing peer/delegation tools, so every proactive action keeps the standard approval gates.

## Blockers

- None — resolved by green CI run 37322886544.

## Discovered Follow-ups

- A per-space "quiet hours" preset (vs editing the cron) could be a small UX addition later; the current control is the Routine editor.

## Next Recommended Task

1. Push, let CI arbitrate the e2e specs, link screenshots, check P06-16 + VERIFY items.
2. Claim Phase 07 (Connect Apps, X & Voice Memo): the WIP carries voice memo components and the audio attachment pipeline — verify against P07 tasks.

### 2026-10-05 — CI green; phase closed (ZCode/GLM)

- Main Bot flows green in CI run 37322886544 (web e2e 182/182).
- Capture matrix completed: roster star on selection and the proactive check-ins toggle in its on state. Curated under `.planning/evidence/phase-06-main-bot/`.

## Final Summary

Complete — all mandatory tasks and verification items pass; evidence under `.planning/evidence/phase-06-main-bot/`.
