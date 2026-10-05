# Agent Protocol

This file defines how multiple coding agents collaborate without losing project state.

## Before Starting Any Task

An agent must:

1. Read `.planning/PROJECT.md`.
2. Read `.planning/ROADMAP.md`.
3. Read `.planning/STATE.md`.
4. Read the target phase's `SPEC.md`.
5. Read the target phase's `CHECKLIST.md`.
6. Read the target phase's `HANDOFF.md`.
7. Inspect repository instructions such as `AGENTS.md`.
8. Inspect current git status before changing code.

## Claiming Work

Before modifying product code:

- put the agent name/identifier in the relevant checklist task
- change the phase status in `STATE.md` to `DOING` if it is the first active task
- record branch/worktree information
- write a short `Work started` entry in `HANDOFF.md`

If two agents need the same files, coordinate ownership before editing.

## Checkbox Rule

Use checkboxes as verification state, not implementation state.

Bad:

```md
- [x] Add Tasks page
```

when the component exists but no navigation/test works.

Good:

```md
- [x] TASK-UI-03 Tasks page is reachable from Conversation Details and E2E coverage passes.
```

## Handoff Rule

Before stopping, every agent must update the active phase's `HANDOFF.md` with:

- what changed
- files/modules touched
- tests run and results
- screenshots/evidence produced
- unresolved issues
- decisions made
- exact next recommended task

Never leave important context only in chat.

## Blocking Rule

When blocked:

1. Do not check the task.
2. Add `BLOCKED` next to the task in the checklist.
3. Explain the blocker in `HANDOFF.md`.
4. Add it to `STATE.md > Active Blockers`.
5. State what event or decision unblocks it.

## DONE Gate

A phase becomes DONE only when:

- all mandatory checklist items are checked
- phase acceptance criteria pass
- relevant unit/integration/E2E tests pass
- UI phases have current screenshot evidence
- accessibility sanity checks pass for changed UI
- no known P0/P1 regression remains
- phase handoff contains a final summary
- `STATE.md` is updated

## Scope Discipline

If an agent discovers unrelated work:

- do not silently expand the phase
- write it under `Discovered follow-ups` in `HANDOFF.md`
- add it to the correct future phase checklist if clearly in scope
- otherwise add it to `.planning/DECISIONS.md` as a pending decision

## Git Discipline

Recommended branch naming:

```text
phase/00-bootstrap
phase/01-shell
phase/02-details-tasks
phase/03-routines-library-search
phase/04-transcript-composer
phase/05-team-bots
phase/06-main-bot
phase/07-connect-apps
phase/08-mobile
phase/09-hardening
```

Prefer small reviewable commits. Do not mix unrelated phase work in one commit.

## Upstream Sync Discipline

Before large architectural changes:

- check whether upstream already changed the relevant subsystem
- prefer adapter or additive files over invasive rewrites
- keep a note in the phase handoff when a change is likely to create recurring upstream merge conflicts

## Security Rule

Never place secrets, session tokens, credentials, private memory, or user content in planning files, test fixtures, screenshots, commits, or handoff notes.
