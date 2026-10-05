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

## Pending Decisions

### P-001 — Team Bot persistence model

Choose between:

- separate `TeamBotDefinition` + actor-scoped conversation instances
- generalized Bot definition/session split across all Bot types

Decision must optimize semantics, migration safety, and upstream mergeability.

### P-002 — Team Bot computer semantics

Decide exactly when execution uses:

- shared Team Computer
- per-user Private Computer
- ephemeral isolated computer

Personal browser authentication must not leak into shared execution.

### P-003 — Shared memory write policy

Decide whether ordinary member interactions may automatically write team memory or whether team-memory writes require policy/admin controls.

### P-004 — Template update semantics

M1 default recommendation: template import creates an independent snapshot with no live update relationship.

### P-005 — Proactive Main Bot cadence

Define sensible limits, quiet hours, and user control before enabling proactive check-ins by default.
