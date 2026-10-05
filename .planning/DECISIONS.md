# Product and Architecture Decisions

## Locked Decisions

### D-001 — Grok Bot is the primary UX reference

Where an equivalent Grok Bot surface exists, match its information hierarchy and interaction model before inventing an alternative.

### D-002 — Preserve Rakazo engine strengths

The fork should reuse Rakazo's existing runtime, approvals, Routines, Skills, computers, memory, connectors, and multi-agent primitives where possible.

### D-003 — No visual workflow canvas in M1

Routines represent repeatable/triggered workflows. Projects represent planned multi-step orchestration. A node-canvas builder is out of scope for M1.

### D-004 — Conversation Details replaces settings-first navigation

Clicking a Bot from the conversation header should open a details home. Dense Bot settings remain a nested surface.

### D-005 — Projects/Tasks become first-class

Cloud-agent/subagent work must be representable as durable, inspectable Tasks/Projects rather than only transient transcript/tool activity.

### D-006 — Main Bot belongs to a Space

Model one Main Bot per Space, preferably with a `Space.mainBotId`-style relation rather than independent `isMain` booleans on many Bots.

### D-007 — Template sharing copies configuration only

Bot templates must not transfer computer state, credentials, private files, private memory, or conversation history.

### D-008 — Team Bot is not just an ordinary Bot with a flag

The domain must support shared Bot definition/configuration plus actor-scoped private conversations and private user state.

### D-009 — Generic draft action abstraction

Editable email/Slack/etc. drafts should share a provider-neutral action-card model instead of separate provider-specific transcript implementations.

### D-010 — X should be a capability pack

First-class X UX may exist, but core agent logic remains provider-neutral and should use the connector/tool abstraction.

### D-011 — M2 targets measured UI/UX fidelity

M1 acceptance proved feature and information-architecture parity. M2 intentionally raises the bar: for equivalent public Grok Bot surfaces, independently implement the observable layout, hierarchy, copy, state transitions, timing, keyboard behavior, and responsive flow as closely as practical. Do not copy proprietary source code or private assets.

### D-012 — Visual diff is an M2 acceptance gate

Stable canonical states must use deterministic screenshot comparison plus a parity scorecard. A feature existing is not evidence of parity. Structural mismatches fail even when a permissive numeric pixel threshold would pass; masks and tolerances require written justification.

## Pending Decisions

### P-001 — Team Bot persistence model — RESOLVED 2026-10-05

Chosen: separate `TeamBot` definition table + actor-scoped `Bot` instances (`Bot.teamBotId` with `@@unique([teamBotId, userId])`). `teamBots.open` lazily creates or restores the caller's instance. Rationale: additive tables keep migrations safe and upstream mergeability (the generalized definition/session split across all Bot types stays a post-M1 idea). See Phase 05 HANDOFF.

### P-002 — Team Bot computer semantics — RESOLVED for M1 2026-10-05

Chosen: per-user Private Computer — `teamBots.open` creates instances with `computerMode: "dedicated"`. Personal browser authentication cannot leak into a teammate's execution because each member's instance carries its own computer. A shared Team Computer mode is deferred; templates record `computerMode` so future import can express either.

### P-003 — Shared memory write policy — RESOLVED for M1 2026-10-05

Chosen: no automatic team-memory writes in M1. Each Team Bot instance keeps actor-scoped memory (isolated by default), so ordinary member interactions never mutate a teammate's memory. A team memory namespace with an explicit write policy remains a post-M1 decision; the template carries `memoryScope` for that future.

### P-004 — Template update semantics

M1 default recommendation: template import creates an independent snapshot with no live update relationship.

### P-005 — Proactive Main Bot cadence — RESOLVED for M1 2026-10-05

Chosen: proactive check-ins are an opt-in Routine on the Main Bot, not a new scheduler. Details offers a "Proactive check-ins" toggle that creates `MAIN_BOT_CHECKIN_ROUTINE_NAME` with `0 */4 * * *` in the user's timezone (`notify: true`), editable with every existing Routine control. Cooldown = the routine cadence (4h floor); quiet hours = timezone-aware scheduling (no overnight crons by default); disable = pause the routine. The check-in prompt reviews active Projects, recent task outcomes, blocked work, and other Bots' activity, and surfaces only items needing attention — keeping proactivity summary-first and approval-gated like any run.
