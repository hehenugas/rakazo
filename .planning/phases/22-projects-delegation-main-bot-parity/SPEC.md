# Phase 22 — Projects, Delegation & Main Bot Experience Parity

## Objective

Make Projects and delegated work behave like active Bot orchestration rather than a manually maintained tracker, and make Main Bot attention follow meaningful events rather than only a fixed timer.

## Project Mental Model

When a user asks a Bot to start a Project, the Project represents an orchestrator/Cloud Agent that:

1. interprets the objective
2. produces a plan
3. starts/coordinates child work
4. exposes progress and blockers
5. returns completion/result state
6. can be stopped with predictable cascade semantics

Rakazo may implement this using its provider-neutral cloud-agent/subagent primitives rather than xAI/Cursor internals.

## Main Bot Mental Model

Main Bot should surface events that need attention: completed delegated work, blockers, waiting-for-user items, important failures, and useful next actions. A periodic check-in may remain as fallback, but should not be the only proactivity mechanism.

## DONE Gate

Project and Main Bot journeys demonstrate real orchestration, deterministic ownership, safe approvals, correct stop/cancel propagation, and useful event-driven attention.
