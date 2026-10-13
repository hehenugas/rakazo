# Phase 25 — M3 Completion & Runtime Reliability

## Objective

Close the verified orchestration gaps from `M4-REQUIREMENTS.md` (M4-ORCH-001…005) without replacing the Project engine, and record honestly which M3 Phase 23 gates cannot be closed from this environment.

## Maintainer directive

All M4 phases were requested in one run; this stands as the documented exception to the Phase 23 dependency. Phase 23 files are not edited.

## Design notes

- **Stop cascade (ORCH-001).** Cloud agents outlive the run that launched them, so ownership is derived through the card message that run published (`CloudAgent.messageId` → `Message.runId` → `Run.task.projectId`). Stop sets the same durable `cancelRequested` intent as `cloud_agent_cancel`; the poller owns the remote call. No schema change.
- **Team Computer children (ORCH-002).** Existing behavior is a queue, not a failure: a busy lease requeues the run with bounded backoff (≤10 s) and retries forever (`requeueComputerRun`, `computerRetryDelay`). The orchestrator tool descriptions tell it not to wait on children, so a parent cannot hold the lease while waiting. No scheduler change was needed; the behavior is now covered by an integration test.
- **Card sync (ORCH-004).** The fixed 200-message scan silently stopped updating a card pushed deeper than that. The pass now asks the database for messages containing the project's block (JSONB containment). Defaults unchanged; `createJobReconciler` already accepts `intervalMs`.
