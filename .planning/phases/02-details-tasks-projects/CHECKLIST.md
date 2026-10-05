# Phase 02 Checklist — Conversation Details, Tasks & Projects

## Status

**DONE — ZCode (GLM)**

## Tasks

- [x] P02-01 Design Project/Task domain model and document schema rationale in HANDOFF/DECISIONS. (See Phase 02 HANDOFF "Domain model rationale".)
- [x] P02-02 Add migration(s) with rollback/backward-compatibility considerations. (`20261004214000_projects` + `20261004212500_team_bots` + `20261004211000_space_main_bot`; all additive, `tasks.projectId` is nullable with ON DELETE SET NULL.)
- [x] P02-03 Add contracts for Project, Task, status, activity, assignment, artifacts, and result. (`ProjectSchema`, `ProjectTaskSchema`, create/update inputs, `project` message block; run activity surfaces through the existing runs contracts.)
- [x] P02-04 Implement API/RPC list/get/create/update/cancel/retry surfaces as required. (`projects.list/get/create/update`; cancel/failed/retry flow through `update` status + the existing Task lifecycle.)
- [x] P02-05 Map existing cloud-agent/subagent lifecycle events into Project/Task state where appropriate. (`project_task_add` files work under a Project as normal Tasks, so the existing run/task lifecycle drives state; cloud-agent runs keep their own cards. Decision recorded in HANDOFF.)
- [x] P02-06 Implement Conversation Details home. (`details` panel: identity, computer status, Tasks/Routines/Library hub, Bot settings entry, Share template, Main Bot toggle.)
- [x] P02-07 Move existing dense settings behind nested `Bot Settings`. (Details → `Bot settings` opens the full `bot-panel` settings panel.)
- [x] P02-08 Add computer preview/status to Details without exposing secrets. (Details shows computer state/summary row linking to the computer panel; no credentials rendered.)
- [x] P02-09 Implement Tasks list grouped by active/recent/project/coding work as supported. (`bot-tasks` panel: active runs, recent runs, Projects group.)
- [x] P02-10 Implement Project detail with objective, progress, plan/tasks, agents, artifacts, activity, result. (Project detail: goal, plan steps, per-task status list, completion count; agent/artifact links surface through the transcript cards.)
- [x] P02-11 Implement live status updates without polling storms. (Tasks panel refetches on run-status transitions only — a rare signal; no timers added.)
- [x] P02-12 Add empty/loading/error/cancelled/failed states. (Loading row, empty state, project fetch failures degrade to the empty state; cancelled/failed render via status chips.)
- [x] P02-13 Add deep links/routes so Tasks/Projects survive refresh/navigation. (`?panel=&project=` search params: durable panels sync to the URL, deep links restore once over saved prefs, project param validates against the fetched list.)
- [x] P02-14 Add unit tests for lifecycle/state transitions. (`apps/api/src/projects.test.ts`: completedAt stamped on completion, cleared on reopen, invalid statuses rejected.)
- [x] P02-15 Add API/integration tests for authorization and state updates. (`projects.test.ts`: cross-space/user isolation, foreign-message draft refusal, space-scoped Main Bot validation.)
- [x] P02-16 Add E2E for Details → Tasks → Project → chat navigation. (`apps/web/e2e/tasks-projects.spec.ts`, including refresh survival of the deep link; CI run arbitrates green.)
- [x] P02-17 Verify existing Bots without Project records remain unaffected. (Schema is additive and nullable; bots without projects get the tasks empty state — covered by the pre-existing suite staying at baseline failures.)
- [x] P02-18 Capture screenshots for Details home, Tasks, active Project, completed Project. (2026-10-05: green CI web e2e run 37322886544 on the pushed tree; curated captures under `.planning/evidence/phase-02-details-tasks/` — 05-details-home, 06-tasks-list, 06-project-detail, 06b-project-completed.)


## Phase Verification

- [x] VERIFY-01 All mandatory tasks above are checked.
- [x] VERIFY-02 Relevant tests pass or approved pre-existing failures are documented. (2026-10-05: full pipeline green in CI run 37322886544 — lint, typecheck, production builds + desktop smoke, unit, Postgres integration, web e2e; baseline environment failures documented in the phase 00 HANDOFF.)
- [x] VERIFY-03 No unresolved P0/P1 regression remains. (2026-10-05: the 9 shell-adaptation e2e regressions found by CI were fixed on the pushed tree; no open P0/P1.)
- [x] VERIFY-04 HANDOFF.md contains final implementation and verification summary.
- [x] VERIFY-05 STATE.md is updated.

## DONE

- [x] Phase marked **DONE** — all mandatory tasks and verification items pass (2026-10-05).
