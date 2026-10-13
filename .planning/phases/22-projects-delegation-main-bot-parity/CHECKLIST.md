# Phase 22 Checklist — Projects, Delegation & Main Bot Experience Parity

## Status

DONE — Claude Code (Sonnet 5.5)

## Tasks

- [x] P22-01 Audit Project/Task schema and current cloud-agent/subagent primitives for an orchestration binding. (Audit: `project_task_add` only inserted a never-started Task; no run, no parent link, stop touched run-tasks only; status stored in three places (Project, Task, Run).)
- [x] P22-02 Define one source of truth linking Project to its orchestrator run/agent without duplicating status. (`Project.orchestratorRunId` (migration `20261011100000_project_orchestrator_run`) records the starting run. Child status is derived from the latest task run (`childStatus`/`deriveProjectStatus`, core, unit-tested); only explicit completed/cancelled are stored and sticky.)
- [x] P22-03 Let a Bot create/start a Project conversationally from a user objective. (Existing `project_create` tool now records the orchestrator run; e2e creates a project by chat (`create project titled …`).)
- [x] P22-04 Generate/store an initial plan through the orchestrator rather than requiring the user to manually populate plan rows. (The orchestrator supplies the plan in `project_create` (stored on the Project); nothing requires the user to fill plan rows. Plan generation quality depends on the connected model; offline tests use the scripted runtime's fixed plan.)
- [x] P22-05 Allow the Project orchestrator to launch/associate child Tasks/delegated agents. (`project_task_add` starts the child immediately as its own `project_task` run, on the bot's thread or a named assignee's thread (caps: 50 tasks, 10 active). `project_status` lets the orchestrator read child state.)
- [x] P22-06 Surface child/delegated progress in Project detail and conversation without duplicate contradictory states. (Project detail (web/mobile) shows derived per-task status and assignee and polls while open; the transcript card carries `progress {done,total}` kept current by the reconciler (`1 of 1 done` e2e).)
- [x] P22-07 Represent waiting-for-user, blocked, failed, completed, and cancelled states consistently. (One derived vocabulary across Project/Task/card: planned, running, waiting, completed, failed, cancelled.)
- [x] P22-08 Keep consequential child actions behind existing approval policy. (Child work is an ordinary run through the same executor; e2e sets a require-approval rule, the child pauses (project `waiting`), Allow once lets it finish.)
- [x] P22-09 Implement Stop from the parent Project/Bot as a cascade to owned active child work when safe/appropriate. (`threads.stop` on a bot also stops the open Projects it owns (`stopProjectsOwnedByBot`); `projects.stop` + web/mobile Stop control. Only runs whose task belongs to the project are cancelled, using run-scoped `stopThreadRuns({onlyRunIds})` incl. sandbox teardown.)
- [x] P22-10 Do not cancel unrelated Bots/runs merely because they share a computer or Space. (Run-scoped stop; integration test (stops project runs across bots, leaves unrelated runs on the same bots) and e2e (unrelated Helper run survives).)
- [x] P22-11 Add retry/reopen/restart semantics for failed/blocked Project work. (`projects.retry` requeues failed/cancelled/unstarted children as new runs and reopens the project; Retry control on web and mobile; integration + e2e (API) covered.)
- [x] P22-12 Add event hooks for Project completion, failure, blocker, and waiting-for-user. (Event hooks are a leader-elected reconciler pass (`reconcileProjects`, runs with the existing job reconciler, default 30 s) rather than inline hooks, so run-finalization code is untouched. Status reads are derived live, so only attention/cards lag up to ~30 s.)
- [x] P22-13 Feed meaningful Project/delegation events into Main Bot attention. (Waiting/failed/completed project events post one message in the Main Bot's thread (unread), unless the subject already lives in that thread.)
- [x] P22-14 Keep periodic Main Bot check-in as fallback/configurable Routine, not sole coordination source. (Audit: the opt-in `Main Bot check-in` routine is unchanged and remains the periodic fallback.)
- [x] P22-15 Deduplicate repeated Main Bot notices for the same underlying event. (Attention messages use `attn:<project>:<state>:<run>` as the thread `clientNonce` (unique per thread), so repeated passes, concurrent leaders, and reloads cannot duplicate; integration test runs three passes and gets one message.)
- [x] P22-16 Preserve user-message priority while active/delegated work continues. (`project_task` runs never take user steering and never hold the queue: both user-send paths exclude them (a child waiting for an answer still takes the user's reply). A same-bot child on a Team Computer can still serialize behind the per-bot computer lease.)
- [x] P22-17 Add integration tests for parent/child ownership and cancellation boundaries. (`project-orchestration.postgres.test.ts` (7) and `project-control.postgres.test.ts` (3): ownership, caps, stop boundaries, retry, attention dedupe, completion gating; both added to the integration harness.)
- [x] P22-18 Add E2E: ask Bot for Project → plan → child work → progress → completion. (`project-orchestration.spec.ts` test 1: chat creates the project, chat delegates a task to Helper, derived status and assignee, `1 of 1 done` card.)
- [x] P22-19 Add E2E: child blocker → Main Bot surfaces attention → user responds → work continues. (Test 2: child asks → project waiting → Main Bot message (exactly one) → answer in Helper's chat → project completes.)
- [x] P22-20 Add E2E: Stop parent → owned children stop; unrelated work remains. (Test 3: stopping the owning bot cancels the delegated child while an unrelated Helper run keeps running; retry reopens it.)
- [x] P22-21 Verify reload/reconnect does not duplicate Project/Main Bot events. (Idempotent server-side reconciliation + nonce dedupe (integration test); the client only reads state, so reload/reconnect cannot create events.)
- [x] P22-22 Add mobile read/manage parity for Project status and attention where currently supported. (Mobile project detail: derived status, assignee, 5 s refresh while open, Stop (native Alert confirm) and Retry. Attention arrives as a Main Bot message. The in-thread project card on mobile does not yet show progress.)

## Phase Verification

- [x] VERIFY-01 Project is demonstrably orchestration, not only CRUD tracking. (Chat-created project → delegated child run → derived progress/completion, e2e green.)
- [x] VERIFY-02 Parent/child status and stop ownership tests pass. (Integration + e2e green.)
- [x] VERIFY-03 Main Bot receives event-driven attention with deduplication. (Integration + e2e green.)
- [x] VERIFY-04 Approval and isolation boundaries pass. (Other users cannot stop a project, and attention never posts into another member's Main Bot thread — both integration-tested; a delegated child's approval flow is e2e-tested.)
- [x] VERIFY-05 HANDOFF.md and STATE.md are updated.

## DONE

- [x] Phase marked DONE only after all verification items pass.
