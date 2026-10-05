# Phase 15 — Main Bot & Work-Flow Feel Parity

## Objective

Close the remaining interaction gap that cannot be solved with CSS: Main Bot coordination, Project/Task delegation, attention ordering, and stop behavior must feel like the pinned Grok Bot workflow.

This phase is intentionally product-behavior-adjacent because users experience these semantics directly through the UI.

## Scope

- Main Bot attention/proactivity presentation
- event-aware coordination instead of relying only on a fixed periodic check-in
- user message priority while Bots are busy
- delegated Bot/agent status in transcript and Projects
- Projects as plans that drive delegated work, not only static tracking
- stop/cancel cascading for work launched by the active Bot when the reference does so
- completion/blocker/decision surfacing
- notification/attention deduplication

## Constraints

- reuse Rakazo Routines, run, task, project, subagent, approval, and event primitives where possible
- preserve provider neutrality
- do not create a hidden bypass around approvals
- avoid noisy proactivity; reference behavior and user control win over maximum automation

## Acceptance Criteria

Common coordination journeys produce the same user-visible ordering, attention states, control placement, and stop/retry semantics as the pinned reference.

## DONE Gate

Main Bot and Project/Task journeys pass behavioral E2E, screenshot, notification-safety, and approval checks.
