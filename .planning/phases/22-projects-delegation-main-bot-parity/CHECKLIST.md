# Phase 22 Checklist — Projects, Delegation & Main Bot Experience Parity

## Status

TODO — unclaimed

## Tasks

- [ ] P22-01 Audit Project/Task schema and current cloud-agent/subagent primitives for an orchestration binding.
- [ ] P22-02 Define one source of truth linking Project to its orchestrator run/agent without duplicating status.
- [ ] P22-03 Let a Bot create/start a Project conversationally from a user objective.
- [ ] P22-04 Generate/store an initial plan through the orchestrator rather than requiring the user to manually populate plan rows.
- [ ] P22-05 Allow the Project orchestrator to launch/associate child Tasks/delegated agents.
- [ ] P22-06 Surface child/delegated progress in Project detail and conversation without duplicate contradictory states.
- [ ] P22-07 Represent waiting-for-user, blocked, failed, completed, and cancelled states consistently.
- [ ] P22-08 Keep consequential child actions behind existing approval policy.
- [ ] P22-09 Implement Stop from the parent Project/Bot as a cascade to owned active child work when safe/appropriate.
- [ ] P22-10 Do not cancel unrelated Bots/runs merely because they share a computer or Space.
- [ ] P22-11 Add retry/reopen/restart semantics for failed/blocked Project work.
- [ ] P22-12 Add event hooks for Project completion, failure, blocker, and waiting-for-user.
- [ ] P22-13 Feed meaningful Project/delegation events into Main Bot attention.
- [ ] P22-14 Keep periodic Main Bot check-in as fallback/configurable Routine, not sole coordination source.
- [ ] P22-15 Deduplicate repeated Main Bot notices for the same underlying event.
- [ ] P22-16 Preserve user-message priority while active/delegated work continues.
- [ ] P22-17 Add integration tests for parent/child ownership and cancellation boundaries.
- [ ] P22-18 Add E2E: ask Bot for Project → plan → child work → progress → completion.
- [ ] P22-19 Add E2E: child blocker → Main Bot surfaces attention → user responds → work continues.
- [ ] P22-20 Add E2E: Stop parent → owned children stop; unrelated work remains.
- [ ] P22-21 Verify reload/reconnect does not duplicate Project/Main Bot events.
- [ ] P22-22 Add mobile read/manage parity for Project status and attention where currently supported.

## Phase Verification

- [ ] VERIFY-01 Project is demonstrably orchestration, not only CRUD tracking.
- [ ] VERIFY-02 Parent/child status and stop ownership tests pass.
- [ ] VERIFY-03 Main Bot receives event-driven attention with deduplication.
- [ ] VERIFY-04 Approval and isolation boundaries pass.
- [ ] VERIFY-05 HANDOFF.md and STATE.md are updated.

## DONE

- [ ] Phase marked DONE only after all verification items pass.
