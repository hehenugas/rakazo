# Phase 02 Checklist — Conversation Details, Tasks & Projects

## Status

**TODO**

## Tasks

- [ ] P02-01 Design Project/Task domain model and document schema rationale in HANDOFF/DECISIONS.
- [ ] P02-02 Add migration(s) with rollback/backward-compatibility considerations.
- [ ] P02-03 Add contracts for Project, Task, status, activity, assignment, artifacts, and result.
- [ ] P02-04 Implement API/RPC list/get/create/update/cancel/retry surfaces as required.
- [ ] P02-05 Map existing cloud-agent/subagent lifecycle events into Project/Task state where appropriate.
- [ ] P02-06 Implement Conversation Details home.
- [ ] P02-07 Move existing dense settings behind nested `Bot Settings`.
- [ ] P02-08 Add computer preview/status to Details without exposing secrets.
- [ ] P02-09 Implement Tasks list grouped by active/recent/project/coding work as supported.
- [ ] P02-10 Implement Project detail with objective, progress, plan/tasks, agents, artifacts, activity, result.
- [ ] P02-11 Implement live status updates without polling storms.
- [ ] P02-12 Add empty/loading/error/cancelled/failed states.
- [ ] P02-13 Add deep links/routes so Tasks/Projects survive refresh/navigation.
- [ ] P02-14 Add unit tests for lifecycle/state transitions.
- [ ] P02-15 Add API/integration tests for authorization and state updates.
- [ ] P02-16 Add E2E for Details → Tasks → Project → chat navigation.
- [ ] P02-17 Verify existing Bots without Project records remain unaffected.
- [ ] P02-18 Capture screenshots for Details home, Tasks, active Project, completed Project.


## Phase Verification

- [ ] VERIFY-01 All mandatory tasks above are checked.
- [ ] VERIFY-02 Relevant tests pass or approved pre-existing failures are documented.
- [ ] VERIFY-03 No unresolved P0/P1 regression remains.
- [ ] VERIFY-04 HANDOFF.md contains final implementation and verification summary.
- [ ] VERIFY-05 STATE.md is updated.

## DONE

- [ ] Phase marked **DONE** only after all verification items pass.
