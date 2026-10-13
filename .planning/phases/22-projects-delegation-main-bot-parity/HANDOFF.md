# Phase 22 Handoff — Projects, Delegation & Main Bot Experience Parity

## Current Status

DONE — 2026-10-11 (Claude Code, Sonnet 5.5). Verified locally only; CI has not run on this work.

## Owner

Claude Code (Sonnet 5.5).

## Branch / Worktree

`main` working tree (uncommitted).

## Work Log

### 2026-10-11 — Implementation

- Source of truth: `Project.orchestratorRunId` plus child status derived from each task's latest run (`packages/core/src/project-status.ts`). Only explicit completed/cancelled are stored and sticky.
- Orchestration: `project_task_add` starts the child as its own `project_task` run (own thread or a named assignee's); `project_status` reads progress; the child's prompt carries the project's objective. Caps: 50 tasks, 10 active.
- Reconciler: `reconcileProjects` runs inside the existing leader-elected job reconciler (API in-memory mode and worker). It persists derived status, keeps the transcript card (`progress {done,total}`) current, and posts one attention message to the Main Bot's thread for waiting/failed/completed. The message `clientNonce` is `attn:<project>:<state>:<run>`, so replays are no-ops.
- Stop/retry: `projects.stop`, `projects.retry`; `threads.stop` on a bot also stops projects it owns via run-scoped `stopThreadRuns({onlyRunIds})`.
- User priority: `project_task` runs never take user steering and never hold the send queue (db `sendUserMessage` and the API send path).
- UI: web project detail (derived status, assignee, Stop/Retry, 5 s refresh while open) and card progress; mobile project detail (same, native Stop confirm).

## Files / Modules

- DB/contracts: `schema.prisma` + migration `20261011100000_project_orchestrator_run`; `contracts` (`ProjectTaskSchema.botId/botName`, `ProjectIdInput`, `projects.stop/retry`, `project` block `progress`, `project_task` trigger).
- Core: `project-status.ts`, `run-state.ts`, index export.
- Adapters: `project-orchestration.ts` (start, retry, reconcile, summaries), `executor.ts` (tools, child prompt context), `builtin-tools.ts`, `job-reconciler.ts`, `scripted-runtime.ts`.
- API: `project-control.ts`, `router.ts` (derived DTO, stop/retry, stop cascade), `thread-target.ts` (`StoppableThread`, run-scoped stop, send path), `app.ts`; worker `index.ts`.
- Web: `Shell.tsx`; mobile: `project.tsx`, locales.

## Tests Run (local)

- Unit: `project-status` (9), updated `apps/api/src/projects.test.ts`.
- Integration (throwaway Postgres): `project-orchestration.postgres.test.ts` (8) and `project-control.postgres.test.ts` (3) — ownership, caps, stop boundaries, retry, attention dedupe and ownership, completion gating. Both are registered in the integration harness.
- Web e2e (`project-orchestration.spec.ts`, 4 tests, green on two consecutive runs): chat-created project → delegated child → derived status → `1 of 1 done` card; blocker → one Main Bot message → answer → completion; stop owner stops only delegated work; delegated approval waits then completes.

## Decisions

- Event hooks are reconciler-based (default 30 s) instead of inline in run finalization, to keep the finalize/pause paths untouched and upstream-mergeable. Status reads are live-derived, so only cards and attention lag.
- No LLM wrap-up run on completion; completion is derived and announced. Per-project results live in the assignees' threads.
- Attention goes to the Main Bot's thread only, only for the same member's project, and not when the subject already lives there.

## Unresolved / Discovered follow-ups

- Same-bot children on a Team Computer can still serialize behind the per-bot execution lease; delegating to another bot avoids it.
- `syncProjectCard` scans the project bot's last 200 messages per open project each reconcile pass; fine at small scale, a stored card message id would remove it.
- The mobile thread's project card does not show `progress`.
- `project_update` still posts a new card per call (pre-existing); cards stay in sync but may repeat.
- Cloud Agents are not part of the stop cascade (no Project link to them).

## Next Recommended Task

Phase 23: audit, verify what can be verified locally, and hand the CI/Electron/device items and the maintainer approval to the maintainer.
