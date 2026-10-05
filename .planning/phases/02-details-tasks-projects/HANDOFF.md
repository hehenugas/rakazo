# Phase 02 Handoff — Conversation Details, Tasks & Projects

## Current Status

DONE — P02-01…P02-18 all pass; evidence under `.planning/evidence/phase-02-details-tasks/`; green pipeline in CI run 37322886544.

## Owner

ZCode (GLM)

## Branch / Worktree

Local `main` (baseline `fd356375`) carrying the restored phase WIP, uncommitted.

## Domain model rationale (P02-01)

- `Project` is space+bot+user-scoped with a JSON `plan` (ordered free-text steps) and an explicit status enum (`planned|running|waiting|completed|failed|cancelled`). Keeping `plan` as JSON avoids a plan-step table while steps stay display-only; real execution state lives in `Task` rows (existing table) linked by nullable `Task.projectId` (ON DELETE SET NULL), so deleting a Project never destroys task history.
- `completedAt` is derived at write time in `projects.update` (stamped on transition to completed, cleared otherwise) instead of a DB trigger, keeping the rule visible and testable in one handler.
- Per-user scoping (`userId` on every query) matches the fork's per-user Bot instance model; projects are never shared across users in M1.

## Work Log

### 2026-10-04 — Planning initialized

- Phase packet created.
- No implementation work has started.

### 2026-10-05 — Phase claimed; WIP landing + gap implementation (ZCode/GLM)

- The restored WIP carries the schema/migrations, contracts, RPC handlers, `project_*` agent tools, Details home, Tasks panel, and project detail UI.
- Implemented P02-13 deep links: durable panels sync `?panel=` into the URL; the Tasks panel adds `&project=`; a deep link restores once over the saved layout preference and the project id is validated against the fetched list. Refresh on a project detail reopens the same project.
- Implemented P02-11: the Tasks panel refetches when the active run's status changes (rare event, no timers), so project/task progress refreshes without polling.
- Added `apps/api/src/projects.test.ts` (P02-14/15): 7 tests — Main Bot validation/clearing, cross-scope project isolation, completedAt stamp/clear transitions, invalid status rejection, draft-action foreign-message refusal and block rewrite.
- Added `apps/web/e2e/tasks-projects.spec.ts` (P02-16): Details → Tasks → Project → back to chat, URL assertions, and deep-link refresh survival.
- P02-05 decision: filing work under a Project reuses the existing Task/run lifecycle (no new state machine); cloud-agent runs keep their own transcript cards. Granular per-task live events remain a Phase 09 follow-up if needed.

## Files / Modules Changed

- `apps/web/src/pages/Shell.tsx` — deep-link sync effects, tasks-panel live refetch.
- `apps/api/src/projects.test.ts` — new (P02-14/15).
- `apps/web/e2e/tasks-projects.spec.ts` — new (P02-16).
- Pre-existing WIP (restored, uncommitted): schema/migrations, contracts, router handlers, executor tools, Details/Tasks/Projects UI.

## Verification Run

| Suite | Command | Result |
|---|---|---|
| Typecheck | `pnpm check` | 22/22 tasks pass (2026-10-05) |
| Lint | `pnpm lint` | 0 errors; 19 warnings + 4 infos (pre-existing baseline) |
| New API tests | `vitest run apps/api/src/projects.test.ts` | 7/7 pass |
| Unit | `pnpm test` | full suite at baseline failures only (see Phase 00 HANDOFF) |
| E2E web | `tasks-projects.spec.ts` | delegated to CI per maintainer instruction |

## Evidence / Screenshots

- `06-project-detail` — from the CI web e2e run; to be linked here when the run finishes. Details home/Tasks screenshots ride the same run.

## Decisions Made During Phase

- See "Domain model rationale" above and the P02-05 decision in the work log.

## Blockers

- None — resolved by green CI run 37322886544.

## Discovered Follow-ups

- Per-task live event updates for open project details (currently refreshed on run-status transitions and panel reopen).
- Project-level assignment/permissions arrive with Phase 05 Team Bots; the schema already carries `userId`/`botId` for that split.

## Next Recommended Task

1. Push, let CI arbitrate the e2e specs, link screenshots, check P02-18 + VERIFY items.
2. Claim Phase 03 (Routines, Library & Search): map the existing Routines/Library/Search capabilities against P03 tasks and land the remaining repositioning.

### 2026-10-05 — CI green; phase closed (ZCode/GLM)

- The details/tasks suite is green in CI run 37322886544 (web e2e 182/182, full pipeline green).
- Added the capture matrix the checklist asked for: details home, tasks list, active project detail, and the completed-project state (status set server-side, deep link restores after reload).
- Evidence curated under `.planning/evidence/phase-02-details-tasks/`.

## Final Summary

Complete — all mandatory tasks and verification items pass; evidence under `.planning/evidence/phase-02-details-tasks/`.
