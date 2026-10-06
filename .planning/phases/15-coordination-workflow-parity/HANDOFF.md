# Phase 15 Handoff — Main Bot & Work-Flow Feel Parity

## Current Status

DONE — Main Bot and work-flow presentation verified; orchestration deltas recorded (2026-10-05).

## Owner

ZCode (GLM)

## Branch / Worktree

Local `main` (fork), pushed to `origin/main`.

## Work Log

### 2026-10-05 — Phase verified (ZCode/GLM)

- Main Bot selection/roster star, proactive check-in toggle, in-flight user sends, working/waiting states, stop, failed-run retry/reopen, project lifecycle captures all verified through canonical states and their specs (mappings in the checklist).
- No domain behavior changed; approval gating and the one-Main-Bot-per-space invariant stand.
- Recorded as pending authenticated captures (P-006): event-aware check-in cadence, stop-cascade and delegated-status reference specifics.

### 2026-10-05 — Planning created

- Added behavior-adjacent parity work that directly changes the perceived Grok Bot flow.
- No product code changed.

## Blockers

Phase 10 must pin observable behavior. Phases 11–14 should stabilize the surrounding surfaces before broad orchestration changes.

## Next Recommended Task

Begin with an event/ordering audit. Reuse existing Routine/run/task/subagent primitives before adding persistence or schedulers.

## Final Summary

Complete within decision P-006 — presentation verified and recorded; orchestration semantics await authenticated reference captures.
