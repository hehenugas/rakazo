# Requirements — M3 Grok Bot Experience Parity

## Milestone Goal

Close the gap between “Rakazo has an equivalent feature” and “a Grok Bot user can use Rakazo with the same learned mental model and flow.”

M3 prioritizes journey parity over pixel parity.

## Acceptance Vocabulary

- **MUST** — required to close M3.
- **SHOULD** — expected unless a documented security/platform/provider-neutral constraint prevents it.
- **MAY** — Rakazo-specific capability that can remain as progressive disclosure.
- A requirement is not complete until its user-visible journey and relevant lifecycle/security invariants are verified.

## Experience Contract

### EXP-001 — No relearning for primary journeys

A Grok Bot user MUST find equivalent primary capabilities in the same conceptual place and complete them through materially equivalent steps.

**Phases:** 17–23.

### EXP-002 — Pixel identity is not required

M3 MUST NOT require exact pixel comparison, exact font rendering, exact color values, or a Grok screenshot-diff threshold for completion. Deterministic screenshots remain regression/hierarchy evidence.

**Phases:** 17, 23.

## Routines & Scheduling

### ROUT-001 — Conversation-first scheduling

A user MUST be able to ask a Bot in ordinary conversation to repeat a task on a schedule without opening a cron editor.

**Phase:** 18.

### ROUT-002 — Details management home

Bot details → Routines MUST be the management home for existing routines.

**Phase:** 18.

### ROUT-003 — Human schedule choices

Ordinary schedule UI MUST prioritize Once, Daily, Weekdays, Weekly, Monthly, and Yearly. Raw cron/arbitrary interval MAY remain under Advanced.

**Phase:** 18.

### ROUT-004 — Next run clarity

Creation confirmation and Routine management SHOULD show timezone and next run when schedulable.

**Phase:** 18.

### ROUT-005 — Routine controls

Users MUST be able to enable/pause, Test run on desktop, edit instruction/schedule on desktop, inspect recent history, and delete.

**Phase:** 18.

### ROUT-006 — Team Bot routines are personal

A routine created with a Team Bot MUST belong to the actor who created it, execute as them, report in their private conversation, and not become shared Team Bot configuration.

**Phases:** 18, 19.

### ROUT-007 — Mobile routine management

Mobile MUST expose schedule, next run, instruction, run history, Active/pause, and delete. Advanced editing/testing MAY remain desktop-only when matching the current reference.

**Phase:** 18.

## Team Bots

### TEAM-001 — Owner-only draft/setup

A new Team Bot MUST remain inaccessible to teammates until explicitly published.

**Phase:** 19.

### TEAM-002 — Publish lifecycle

Team Bot lifecycle MUST distinguish preparation, Publish, available-to-team, and Unpublish states.

**Phase:** 19.

### TEAM-003 — Publish from an existing Bot

Where applicable, Share → Publish to Team MUST allow Copy Bot or Start fresh semantics while keeping the source personal Bot private.

**Phase:** 19.

### TEAM-004 — Shared setup, private conversation

Shared Team Bot configuration MUST be separated from actor-private conversation, memory/notes, and routines.

**Phase:** 19.

### TEAM-005 — Owner authorization

Only an authorized owner/manager role defined by the current public reference MAY change shared Team Bot setup or publish state.

**Phase:** 19.

### TEAM-006 — Safe setup transfer

Publishing/copying MUST NOT expose raw personal credentials, unrelated private history, or private files/memory not explicitly selected by a safe supported flow.

**Phase:** 19.

## Composer & Delivery

### COMP-001 — Learned list editing

The composer MUST support current documented Grok list-entry behavior: dash/numbered list start, Shift+Enter continuation/newline, Tab nesting/outdent behavior where applicable, and safe Enter-to-send semantics.

**Phase:** 20.

### COMP-002 — IME and mention safety

List/keyboard behavior MUST NOT break IME composition, mention picker, skill chips, attachments, replies, or accessibility.

**Phase:** 20.

### COMP-003 — Add to prompt

Selected transcript text MUST support the current documented Add to prompt interaction separately from Reply/Quote.

**Phase:** 20.

### COMP-004 — Immediate send feedback

A submitted message MUST appear sent immediately; slow-delivery progress SHOULD appear only after the documented delay rather than flashing for fast sends.

**Phase:** 20.

### COMP-005 — Failed-send recovery

A failed outgoing message MUST expose Failed to send with Resend and Delete semantics, with safe ordering/idempotency across reconnect/reload.

**Phase:** 20.

### COMP-006 — In-flight user priority

Users MUST remain able to message/steer while a Bot is working without losing or reordering their input incorrectly.

**Phases:** 20, 22.

## Transcript, Voice, Approvals & Apps

### VOICE-001 — Voice memo transcript

Voice memo playback MUST show transcript text when transcription is available.

**Phase:** 21.

### VOICE-002 — Synchronized seek

When word/segment timing is available, playback SHOULD highlight the current transcript portion and allow clicking it to seek.

**Phase:** 21.

### APPR-001 — Summary-first approval

Consequential approval UI MUST present a concise action summary first and keep full command/request details behind progressive disclosure.

**Phase:** 21.

### APPR-002 — Security remains authoritative

Experience parity MUST NOT weaken Auto Review, approval, secret, or actor-isolation boundaries.

**Phases:** 19, 21, 22, 23.

### APP-001 — Plugin-centric discovery

Connect apps remains the primary entry point and the discovery/search terminology SHOULD follow the current plugin-centric reference.

**Phase:** 21.

### APP-002 — Sign-in continuation

When a Bot requested a plugin connection, completing sign-in SHOULD resume the interrupted task automatically when context remains valid.

**Phase:** 21.

### APP-003 — Safe login handoff

Bots MUST use a secure form/secret mechanism for credentials instead of asking users to paste passwords into chat.

**Phase:** 21.

## Projects, Delegation & Main Bot

### PROJ-001 — Project is orchestration

A Project MUST represent active orchestrated work: objective → plan → delegated/child work → progress/blocker → terminal result, rather than only CRUD task tracking.

**Phase:** 22.

### PROJ-002 — Provider-neutral orchestrator

The Project mental model SHOULD match Grok while implementation reuses Rakazo cloud-agent/subagent/provider-neutral primitives.

**Phase:** 22.

### PROJ-003 — Single status truth

Project, child task, run, and transcript state MUST NOT create contradictory duplicate sources of truth.

**Phase:** 22.

### PROJ-004 — Safe stop cascade

Stopping parent work MUST stop owned active child work where appropriate and MUST NOT cancel unrelated work.

**Phase:** 22.

### MAIN-001 — Event-aware Main Bot

Main Bot SHOULD surface meaningful completion, blocker, failure, waiting-for-user, and next-action events without depending solely on a fixed periodic timer.

**Phase:** 22.

### MAIN-002 — Attention deduplication

Repeated events MUST NOT create duplicate proactive interruptions for the same underlying state.

**Phase:** 22.

## Cross-Platform Release

### REL-001 — Web/Electron journey parity

All M3 primary journeys MUST pass on supported web/Electron surfaces.

**Phase:** 23.

### REL-002 — Mobile capability parity

Mobile MUST match the documented capability split using native interaction patterns rather than compressed desktop UI.

**Phase:** 23.

### REL-003 — Zero P0/P1 journey deltas

M3 MUST NOT close with a known P0 or P1 journey parity delta.

**Phase:** 23.

### REL-004 — Full verification

Relevant unit, integration, migration, E2E, accessibility, security, performance, reconnect/realtime, and platform checks MUST pass or have an explicitly approved pre-existing exception.

**Phase:** 23.

## Out of Scope

M3 does not require:

- pixel-perfect Grok reproduction
- proprietary code/assets
- xAI-only providers
- removal of Rakazo-only advanced triggers
- a visual workflow canvas
- identical cloud infrastructure
