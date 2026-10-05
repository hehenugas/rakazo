# Rakazo Fork Planning Hub

This directory is the shared source of truth for humans and coding agents working on the Rakazo fork.

The product goal is not merely to add missing features to Rakazo. The fork should preserve Rakazo's strong open-source/provider-neutral engine while moving the product model, information architecture, interaction patterns, and visual hierarchy as close as practical to the current public Grok Bot experience. M2 makes that fidelity measurable with pinned references, canonical states, and visual/behavior diff gates.

## Start Here

Every agent must read, in order:

1. `PROJECT.md`
2. `ROADMAP.md`
3. `STATE.md`
4. `AGENT-PROTOCOL.md`
5. The active phase's `SPEC.md`
6. The active phase's `CHECKLIST.md`
7. The active phase's `HANDOFF.md`

Do not start implementation from chat context alone.

## Status Convention

- `[ ]` = not done
- `[x]` = verified done
- `TODO` = unclaimed
- `DOING` = currently being worked
- `BLOCKED` = cannot proceed; blocker must be written in the phase handoff
- `DONE` = all phase acceptance criteria and verification gates passed

A task is never checked merely because code was written. It is checked only after the task-specific verification in the checklist passes.

## Planning Layout

```text
.planning/
├── README.md
├── PROJECT.md
├── SCR.md
├── ROADMAP.md
├── STATE.md
├── DECISIONS.md
├── AGENT-PROTOCOL.md
├── REFERENCES.md
└── phases/
    ├── 00-bootstrap-baseline/
    ├── 01-desktop-shell-parity/
    ├── 02-details-tasks-projects/
    ├── 03-routines-library-search/
    ├── 04-transcript-composer/
    ├── 05-sharing-team-bots/
    ├── 06-main-bot-proactivity/
    ├── 07-marketplace-x-voice/
    ├── 08-mobile-parity/
    ├── 09-hardening-release/
    ├── 10-reference-visual-contract/
    ├── 11-shell-roster-navigation-parity/
    ├── 12-composer-input-parity/
    ├── 13-transcript-cards-voice-parity/
    ├── 14-details-marketplace-team-parity/
    ├── 15-coordination-workflow-parity/
    └── 16-responsive-parity-release/
```

Each phase contains:

- `SPEC.md` — what and why
- `CHECKLIST.md` — executable checkbox plan
- `HANDOFF.md` — cross-agent continuity log

## Core Rule

Where Grok Bot has an equivalent product surface, do not independently redesign it unless this plan explicitly says otherwise. Match Grok Bot's information hierarchy and interaction model first, then adapt Rakazo-specific capabilities into that model.

For M2 phases 10–16, “looks close” is not a completion criterion. Read `phases/10-reference-visual-contract/UI-SPEC.md`, use the pinned parity matrix, capture deterministic evidence, and verify geometry + copy + interaction + timing + keyboard + responsive behavior.
