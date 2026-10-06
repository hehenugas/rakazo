# Rakazo Fork Planning Hub

This directory is the shared source of truth for humans and coding agents working on the Rakazo fork.

The product goal is not merely to add missing features to Rakazo. The fork should preserve Rakazo's strong open-source/provider-neutral engine while making the product model, information architecture, and learned user journeys feel natural to an existing Grok Bot user. M3 explicitly prioritizes structural and experience parity over pixel-perfect reproduction.

## Start Here

Every agent must read, in order:

1. `PROJECT.md`
2. `ROADMAP.md`
3. `STATE.md`
4. `REQUIREMENTS.md` for the active milestone when present
5. `AGENT-PROTOCOL.md`
6. For M3, `phases/17-experience-parity-contract/EXPERIENCE-SPEC.md`
7. The active phase's `SPEC.md`
8. The active phase's `CHECKLIST.md`
9. The active phase's `HANDOFF.md`

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
├── REQUIREMENTS.md
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
    ├── 16-responsive-parity-release/
    ├── 17-experience-parity-contract/
    ├── 18-routines-scheduling-parity/
    ├── 19-team-bot-lifecycle-parity/
    ├── 20-composer-delivery-parity/
    ├── 21-transcript-voice-approvals-connect-apps/
    ├── 22-projects-delegation-main-bot-parity/
    └── 23-experience-release-gate/
```

Each phase contains:

- `SPEC.md` — what and why
- `CHECKLIST.md` — executable checkbox plan
- `HANDOFF.md` — cross-agent continuity log

## Core Rule

Where Grok Bot has an equivalent product surface, do not independently redesign it unless this plan explicitly says otherwise. Match Grok Bot's information hierarchy and interaction model first, then adapt Rakazo-specific capabilities into that model.

For M3 phases 17–23, neither “the feature exists” nor “the screenshot looks close” is a completion criterion. Read `REQUIREMENTS.md` and `phases/17-experience-parity-contract/EXPERIENCE-SPEC.md`; verify where the journey starts, the step sequence, ownership/lifecycle, action semantics, recovery behavior, approvals, and desktop/mobile split. Screenshot evidence checks hierarchy/regressions, not pixel identity.
