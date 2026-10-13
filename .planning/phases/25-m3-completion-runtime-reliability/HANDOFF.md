# Phase 25 Handoff — M3 Completion & Runtime Reliability

## Current Status

DOING — 2026-10-12 (Claude Code, Sonnet 5.5). Local verification only. P25-01 and P25-04 are open; the rest are verified locally.

## Maintainer directive

All M4 phases were requested in one run; this is the documented exception to the M3 Phase 23 dependency. Phase 23 files are untouched and the M3 gate stays open.

## Branch / Worktree

`m4-execution` (local, not pushed).

## Changes

- `apps/api/src/project-control.ts`: project stop also sets `cancelRequested` on running cloud agents launched by that project's runs (`cancelProjectCloudAgents`); idempotent, actor-scoped.
- `packages/adapters/src/project-orchestration.ts`: `syncProjectCard` finds the card with a JSONB containment filter instead of a 200-message window (cards deeper than 200 messages never updated before).
- Format fixes: `apps/api/src/team-bots.test.ts`, `apps/web/src/lib/thread-events.ts`.
- Tests: `project-control.postgres.test.ts` (+1), `project-orchestration.postgres.test.ts` (+2: Team Computer queue, deep card), `packages/db/src/migration-upgrade.postgres.test.ts` (new, registered in `packages/testkit/src/cli/harness.ts`).

## Verification (local, throwaway Postgres 16 in Docker, commit `m4-execution` working tree)

- `pnpm exec vitest run` on the five related integration suites (job-reconciler, cloud-agent, project-control, project-orchestration, migration-upgrade): 5 files, 34 tests passed.
- Deep-card test failed before the change (card stayed `planned`) and passed after.
- `pnpm exec biome check .`: 0 errors (20 warnings and 4 infos, pre-existing). Correction recorded in the Phase 26 commit: the Phase 25 commit itself carried one lint error (a `console.info` in the deep-card test, added after the full lint run); it was removed in the next commit, so lint is clean from there on.
- `pnpm exec turbo check --continue`: 21 of 22 tasks pass. `@rakazo/mobile#check` fails only in `expo install --check` (installed Expo patch versions differ from `package.json`; local environment, unrelated to this work); `tsc --noEmit` for mobile exits 0.
- `pnpm test` (vitest, whole repo): 480 files passed, 3 failed; 5914 tests passed, 5 failed: `computer-idle` (3), `desktop-runtime` (1), `computer-replay` (1). These are the same host-dependent computer/process suites listed in the Phase 23 audit (`computer-idle` also failed on a clean baseline then). Not re-run on baseline in this phase.
- Full integration harness (`pnpm test:integration`) and web e2e were not re-run in this phase.

## Open

- P25-01: Electron smoke/e2e (CI virtual display), device/simulator, accessibility audits, green CI, maintainer approval. None can be produced here.
- P25-04: no new reconnect/cancel-race test beyond the existing Phase 22 coverage.
- Attention latency remains ≤ 30 s (reconciler interval); `intervalMs` exists on `createJobReconciler` but is not wired to config.

## Upstream surface

Edits are in `apps/api/src/project-control*.ts`, `packages/adapters/src/project-orchestration*.ts`, `packages/db/src/`, harness list; none of the 34 predicted conflict files. Low conflict risk.

## Next recommended task

Phase 26 (palette plugin search, routine context menu, bubble color, slash decision).

## Code-first parity hardening follow-up — 2026-10-13

- `apps/api/src/project-control.ts` now marks the Project and open child tasks cancelled in one transaction before stopping runs. The transaction locks the Project row, closing the race where a child could be added during cancellation.
- `packages/adapters/src/project-orchestration.ts` rechecks the locked Project before creating or retrying child runs. `packages/adapters/src/cloud-agent-service.ts` checks the source run and takes the same Project lock before creating a Cloud Agent intent/card.
- Cloud Agent ownership remains traced through `Message.runId` → Project task/run → `CloudAgent.messageId`; intent and card are committed together. The poller also cancels abandoned agents whose card is gone, so no schema change was needed.
- Verification for this follow-up: source review and TypeScript checks only. No unit, integration, E2E, CI, or device verification was run. Existing P25-01/P25-04 and Phase 23 gates remain open.
