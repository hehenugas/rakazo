# Phase 25 Checklist — M3 Completion & Runtime Reliability

## Status

DOING — Claude Code (Sonnet 5.5), branch `m4-execution`, 2026-10-12. Local verification only; no CI.

## Tasks

- [ ] P25-01 Resolve Phase 23 pending items. — Partial: local lint, typecheck, unit and integration results re-recorded in `HANDOFF.md`. BLOCKED/open: Electron (CI virtual display), device/simulator, accessibility audits, maintainer review, green CI.
- [x] P25-02 Reproduce same-Team-Computer child serialization and choose a safe design. (Integration test: a second run for the same bot on a Team Computer gets `ComputerBusyError`, stays `queued`, project not `failed`, and acquires the lease after release. Design: keep the lease + bounded-backoff requeue; no new scheduler.)
- [x] P25-03 Stop cascade across task, run, subagent, cloud agent, owned descendants only. (`project-control.postgres.test.ts`: cloud agent launched by a project run gets `cancelRequested`, an agent launched by unrelated work does not, second stop is a no-op; existing tests cover cross-bot, cross-user and unrelated-run boundaries. Cancel races are not separately tested.)
- [ ] P25-04 Canonical project/run/transcript consistency and reconnect tests. — Partial: card/status reconciliation, dedupe and approval-pending were already covered by Phase 22; new test covers a card deeper than the old scan window. No new reconnect test.
- [x] P25-05 Measure latency/reconciliation; optimize only with before/after evidence. (Before: with 400 newer messages the card stayed `planned` (test failed). After: card found and updated, 10/10 suite passes. Attention latency stays bounded by the 30 s reconciler interval, which is an existing `intervalMs` option; not changed.)
- [x] P25-06 Inherited CI blockers; migration upgrade. (`biome check .` now exits clean — the two formatting errors were fixed. `packages/db/src/migration-upgrade.postgres.test.ts` seeds a pre-M3 schema and upgrades through all fork migrations; added to the integration harness. Pre-existing unit/integration/e2e failures are listed in `HANDOFF.md`, not claimed fixed.)
- [x] P25-07 Recheck upstream. (`git merge-tree` re-run in Phase 24: 34 conflicting paths; Phase 25 touches none of the hot files except tests in `apps/api`.)

## Phase Verification

- [ ] VERIFY-01 All mandatory tasks checked — P25-01 and P25-04 are open.
- [ ] VERIFY-02 Full CI green — not available here.

## DONE

- [ ] Phase not DONE.
