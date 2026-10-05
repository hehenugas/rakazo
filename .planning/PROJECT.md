# Project — Rakazo Fork: Grok Bot Parity

## Vision

Create an open-source, self-hostable Grok Bot alternative by forking Rakazo and preserving its provider-neutral runtime, computers, memory, integrations, routines, and multi-agent primitives while making the product feel substantially closer to Grok Bot.

The target is **product parity in behavior and interaction**, not a literal proprietary clone.

## Primary Product Goal

A user familiar with Grok Bot should immediately recognize the same mental model:

- Bots behave like persistent coworkers.
- The sidebar feels like a coworker roster, not a settings/navigation list.
- Search and New Chat are primary actions.
- Bot details are the home for Tasks, Routines, Library, Settings, and sharing.
- Agent activity is visible but progressively disclosed.
- Work can be represented as Projects/Tasks instead of only hidden tool runs.
- Main Bot coordinates work and can proactively surface important items.
- Team Bots provide shared configuration with user-private conversations.
- Integrations are presented as `Connect apps`, not a technical connector console.
- Rich actions and artifacts live inline in the conversation timeline.

## Upstream

- Upstream repository: `https://github.com/elie222/rakazo`
- Fork directory: the local clone of this repository

At the time these planning files were created, the local directory was empty and had not yet been initialized as a git repository.

## Preserve From Rakazo

Do not discard working primitives just to imitate another codebase.

Rakazo already has useful foundations including:

- persistent Bots with memory/history
- one-thread personal Bot model
- Team Computer and Private Computer modes
- browser, terminal, files, and GUI computer access
- peer Bot messaging and short-lived subagents
- scheduled/event-driven Routines
- Slack and other messaging surfaces
- replies, reactions, and mentions
- approvals and Auto Review
- Skills and teach-by-demonstration
- global/space search
- artifacts/files/links
- voice calls, dictation, and TTS
- connector catalog and provider-neutral integrations
- cloud-agent launch/status primitives
- mobile, web, and Electron surfaces

The fork should reuse these primitives where possible.

## Major Product Gaps

The project treats the following as first-class gaps:

1. Grok-like desktop shell and information architecture
2. Conversation Details as the main Bot control surface
3. Tasks / Projects as first-class orchestration UX
4. Grok-like Routines placement and presentation
5. Bot-scoped Library
6. Heterogeneous transcript cards and editable action drafts
7. Share Bot as template/link
8. Team Bot model
9. Main Bot and proactive coordination
10. Unified Connect Apps / marketplace surface
11. First-class X capability pack
12. Voice memo messages
13. Mobile parity for the new information architecture
14. Release hardening, migrations, auditability, and upstream-sync discipline

## Product Principles

### P1 — Bots, not conversations, are the primary object

A Bot is a durable coworker with identity, configuration, tools, memory, routines, tasks, and history.

### P2 — Keep technical machinery behind progressive disclosure

Users should not need to understand sandboxes, connector providers, cron syntax, thread ids, or worker queues for ordinary work.

### P3 — Preserve provider neutrality

Grok parity must not turn Rakazo into an xAI-only product. Model, computer, memory, voice, and integration provider boundaries stay modular.

### P4 — Security beats visual parity

Credentials, private memory, private files, personal connectors, and private conversation history must not leak through sharing, templates, Team Bots, or shared computers.

### P5 — Prefer adaptation over duplication

If Rakazo already has a working primitive, build the Grok-like UX on top of it instead of creating a parallel subsystem.

### P6 — Upstream sync remains possible

Prefer additive models, clear adapters, isolated UI modules, and migrations that minimize permanent conflicts with upstream Rakazo.

## Explicit Non-Goals

Unless added to a future milestone:

- no visual node-canvas workflow builder like n8n
- no requirement to copy proprietary source code or exact pixels
- no xAI-only model dependency
- no transfer of secrets/history/private memory in templates
- no weakening of Rakazo approval/security boundaries for parity
- no rewrite of the entire Rakazo runtime
