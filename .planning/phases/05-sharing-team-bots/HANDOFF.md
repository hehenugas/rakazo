# Phase 05 Handoff — Sharing & Team Bots

## Current Status

DOING — P05-01…P05-22 implemented/decided and code-verified; P05-23 (screenshots) pending CI artifacts.

## Owner

ZCode (GLM)

## Branch / Worktree

Local `main` (baseline `fd356375`) carrying the restored phase WIP, uncommitted.

## Work Log

### 2026-10-04 — Planning initialized

- Phase packet created.
- No implementation work has started.

### 2026-10-05 — Phase claimed; decisions resolved + gap implementation (ZCode/GLM)

- Resolved pending decisions in `.planning/DECISIONS.md`: P-001 (TeamBot definition + per-user Bot instances), P-002 (per-user dedicated computer), P-003 (no automatic team-memory writes in M1).
- The restored WIP carries the TeamBot/TeamBotMember schema + additive migrations, contracts, RPC (list/create/open with member scoping and P2002 race fallback), Details Share (template download), picker integration, and `CreateTeamBotForm`.
- Added `apps/api/src/team-bots.test.ts` (P05-20/21): member-scoped list assertion, foreign-membership open refusal, and an exact-key template redaction test proving no credentials/history/computer state leak into `export.template`.
- Added `apps/web/e2e/team-bots.spec.ts` (P05-22): create Team Bot via the picker → private instance opens → picker lists the shared definition. Two-actor thread separation is proven at the API level; a two-browser e2e requires the space invite flow (follow-up).
- P05-15 decision: `CreateTeamBotForm` is a compact 3-field card (name/title/description); deeper identity/instruction setup belongs to per-instance Bot Settings, so sequential cards would add ceremony without removing load.

## Files / Modules Changed

- `.planning/DECISIONS.md` — P-001/P-002/P-003 resolutions.
- `apps/api/src/team-bots.test.ts` — new (P05-20/21).
- `apps/web/e2e/team-bots.spec.ts` — new (P05-22).
- Pre-existing WIP (restored, uncommitted): TeamBot schema/migrations, contracts, RPC handlers, Share UI, picker integration, `CreateTeamBotForm`.

## Verification Run

| Suite | Command | Result |
|---|---|---|
| Typecheck | `pnpm check` / targeted `tsc` | 22/22 tasks pass (2026-10-05) |
| Lint | `pnpm lint` | 0 errors; 19 warnings + 4 infos (pre-existing baseline) |
| API tests | `vitest run apps/api/src/team-bots.test.ts` | 3/3 pass |
| E2E web | `team-bots.spec.ts` | delegated to CI per maintainer instruction |

## Evidence / Screenshots

- `12-team-bot-instance` — from the CI web e2e run; to be linked here when the run finishes.

## Decisions Made During Phase

- See `.planning/DECISIONS.md` P-001/P-002/P-003 and the P05-15 note above. P05-05/08: M1 template flow is export-snapshot + create-from-manifest; a publish/revoke registry and dedicated import UI are post-M1.

## Blockers

- P05-23 needs the CI web e2e artifacts after this work is pushed.

## Discovered Follow-ups

- Two-browser Team Bot e2e once a space invite/member flow is exercisable in e2e helpers.
- Shared connector scoping and a team memory namespace (P-003 policy work) for post-M1.

## Next Recommended Task

1. Push, let CI arbitrate the e2e specs, link screenshots, check P05-23 + VERIFY items.
2. Claim Phase 06 (Main Bot & Proactivity): the WIP carries `Space.mainBotId`, the roster star, and the proactive check-in prompt — verify against P06 tasks.

## Final Summary

Not complete — pending CI artifacts for P05-23.
