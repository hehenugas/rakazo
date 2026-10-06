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

Stable canonical states use deterministic screenshot comparison for M2 regression evidence. This remains historical M2 tooling and does not become a pixel-perfect requirement for later milestones.

### D-013 — M3 parity means no product relearning

For M3, match information architecture, entry point, terminology, step order, ownership/lifecycle, state transitions, action semantics, approval boundaries, error/retry/cancel behavior, important keyboard habits, and desktop/mobile capability split. Exact pixels, font rendering, color values, shadows, and screenshot-diff percentages are not acceptance gates.

### D-014 — Public docs/changelog can pin behavior without screenshots

If current official Grok Bot documentation or changelog explicitly describes a workflow or interaction, an implementation task may not be waived as `pending-reference` solely because authenticated product screenshots are unavailable.

### D-015 — Routines are conversation-first, editor-second

The primary Routine mental model is delegating recurring work to a Bot in conversation. Details → Routines is the management home. Ordinary schedule concepts are human-readable; raw cron and Rakazo-only event power remain available through progressive disclosure.

### D-016 — Team Bot availability begins at Publish

A Team Bot under setup is owner-private. Shared definition/setup and actor-private conversations/routines are separate concerns. Publish makes the Team Bot available to teammates; Unpublish removes that availability without leaking or merging member-private state.

### D-017 — Projects represent orchestration

A Project is not merely durable task CRUD. It represents an orchestrator/Cloud Agent-style workflow that creates a plan, coordinates owned child work, exposes blockers/progress, and has predictable parent/child cancellation semantics while staying provider-neutral internally.

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

### P-006 — M2 reference source until authenticated captures exist — RESOLVED 2026-10-05

Chosen: M2 parity work proceeds from the pinned public reference set (docs.x.ai Grok Bot overview + release notes, captured 2026-10-05) plus the recorded delta observations in each phase SPEC, until the maintainer supplies authenticated Grok captures per the procedure in `PARITY-MATRIX.md`. Geometry or copy that neither source pins stays marked `?` in the matrix and is NOT implemented from memory; visual-fidelity work on those rows waits for the captures. Direct consequence: phase 11 implements the recorded deltas (compact round Search/New chat controls) and verifies behavior, while avatar-shape and featured-logo treatments stay pending reference assets.
