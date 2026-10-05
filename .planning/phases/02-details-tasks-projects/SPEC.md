# Phase 02 — Conversation Details, Tasks & Projects

## Objective

Replace settings-first Bot management with a Conversation Details hub and make agent orchestration visible as Tasks/Projects.

## Conversation Details Home

The first details surface should expose:

- Bot identity/profile summary
- current activity
- computer preview/status
- Tasks
- Routines
- Library
- Bot Settings
- Share
- Main Bot entry/control placeholder

Dense technical configuration remains behind Bot Settings.

## Tasks / Projects

Create a durable product model on top of existing cloud-agent/subagent primitives.

A Project should be able to expose:

- objective
- plan
- ordered/related tasks
- task status
- assigned/delegated agent
- artifacts
- activity/events
- final result
- cancel/retry state

Do not make every transient tool call a Project.

## Compatibility

Existing Bots and conversations must continue working. Project data should be additive and migration-safe.

## Acceptance Criteria

A user can open Conversation Details, inspect Tasks, open a Project, see live progress and artifacts, and return to chat without losing state.

## DONE Gate

Domain migration, API contracts, web UI, live updates, tests, and backward compatibility all pass.
