# Master SCR — Grok Bot Parity Expansion

## Change Summary

Fork Rakazo and evolve it into a Grok Bot-like product while retaining Rakazo's open-source, self-hostable, provider-neutral architecture.

The implementation is intentionally phased so multiple coding agents can work with explicit ownership, verification, and handoff boundaries.

## Functional Change Areas

### A. Desktop Information Architecture

Replace the current Rakazo-centric shell with a Grok-like shell:

- top-level Search action
- top-level New Chat action
- coworker-style Bot roster
- activity/attention preview per Bot
- Hidden Bots section
- `Connect apps` footer
- simplified conversation header
- Conversation Details side panel
- centered chat/composer column on wide screens

### B. Conversation Details

Introduce a details home with:

- computer preview/status
- Bot profile summary
- current activity
- Tasks
- Routines
- Library
- Bot Settings
- Share
- Main Bot control

Existing dense settings remain available behind `Bot Settings`.

### C. Tasks and Projects

Create first-class user-visible orchestration on top of Rakazo's existing cloud-agent/subagent primitives.

A Project should expose:

- objective
- generated plan
- task list
- statuses
- delegated agents
- artifacts
- activity stream
- final result
- cancellation/retry semantics

### D. Routines

Retain Rakazo's routine engine and event triggers, but reframe the UX as a Bot-level automation/workflow surface.

No node-canvas builder is required.

### E. Library

Create Bot-scoped Library views for:

- files
- links
- pages/artifacts
- media where available

Support chronological grouping and deep links back to conversation context.

### F. Heterogeneous Transcript

Standardize interactive timeline cards for:

- approvals/questions
- tool activity summaries
- artifacts
- routine creation/update
- draft actions
- delegated work
- project/task status
- computer takeover
- voice memos
- calls
- final results

### G. Draft Actions

Create a provider-neutral `draft_action` model for editable outbound actions such as email and Slack messages.

The card must support:

- editable fields
- provider/action metadata
- preview
- approval state
- execute/send
- discard
- audit trace

### H. Sharing and Team Bots

Add:

- Bot template snapshots
- private/team/public link modes as allowed by deployment policy
- copy-from-template flow
- Team Bot shared configuration
- per-user private Team Bot conversations
- shared/team memory namespace
- private user memory/notes namespace
- owner/editor/member permissions
- actor-scoped connectors
- messaging mappings for DMs vs shared channels

### I. Main Bot

Allow one Main Bot per Space.

Main Bot responsibilities may include:

- proactive check-ins
- surfacing blocked/important work
- coordinating other Bots
- summarizing active tasks
- routing work to specialist Bots

### J. Connect Apps / Marketplace

Evolve the existing integrations UI into a user-facing `Connect apps` experience.

Keep provider-neutral internals while allowing curated capability packs, including X.

### K. Voice Memo

Add sendable/receivable voice memo messages with:

- audio artifact
- duration
- transcript
- playback
- optional word-timed transcript when supported
- mobile recording UX

## Architecture Guardrails

- Keep existing approval framework.
- Do not duplicate Auto Review.
- Do not duplicate teach-by-demonstration.
- Do not introduce secrets into template snapshots.
- Do not silently expose personal connector credentials to shared Team Bot execution.
- Do not break existing personal Bots during migration.
- Prefer new contracts and adapter boundaries over branching provider-specific core logic.
- Preserve deterministic/offline tests where Rakazo already expects them.

## Release Strategy

The work is divided into phases 00–09 in `ROADMAP.md`.

Each phase has a hard DONE gate. Later phases must not assume a prior phase is complete unless that phase is marked DONE in `STATE.md` and its checklist is fully checked.
