# Project — Rakazo Fork: Grok Bot Parity

## Vision

Create an open-source, self-hostable Grok Bot alternative by forking Rakazo and preserving its provider-neutral runtime, computers, memory, integrations, routines, and multi-agent primitives while making the externally observable product experience feel as close as practical to the current Grok Bot reference.

The target is an **independent implementation with close product-experience parity** to public Grok Bot references. M1 established capability and information architecture; M2 aligned the visible shell and major UI surfaces; M3 focuses on journey parity — where features live, how users start them, the sequence of steps, ownership/lifecycle semantics, action labels, error/retry behavior, approvals, and desktop/mobile capability split. Pixel-perfect reproduction is explicitly not required. Do not copy proprietary source code, private assets, or hidden implementation details.

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
15. Measured Grok Bot UI/UX parity across shell, roster, composer, transcript, details, Team Bot, coordination, and responsive/mobile flows
16. Grok Bot experience/journey parity for Routines, Team Bot lifecycle, composer delivery, transcript/voice/approvals, Projects/delegation, and Main Bot attention

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

### P7 — Parity is verified state, not feature presence

A feature is not “parity” merely because an equivalent control exists. Its real user journey, lifecycle, ownership, state transitions, error/retry semantics, and important learned interactions must be verified.

### P8 — M3 optimizes for no relearning, not identical pixels

A Grok Bot user should know where to go and what will happen without learning a fork-specific workflow. Exact pixels, font rendering, colors, shadows, and screenshot-diff percentages are not M3 acceptance gates. Deterministic screenshots remain useful for hierarchy and regression review.

## Explicit Non-Goals

Unless added to a future milestone:

- no visual node-canvas workflow builder like n8n
- no copying proprietary source code, private assets, or hidden implementation details
- no requirement for pixel-perfect Grok reproduction; layout hierarchy and product experience matter more than exact measurements
- no xAI-only model dependency
- no transfer of secrets/history/private memory in templates
- no weakening of Rakazo approval/security boundaries for parity
- no rewrite of the entire Rakazo runtime
