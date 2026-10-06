# M2 UI Design Contract — Grok Bot Parity

> **Scope note (M3, 2026-10-06):** This contract governed M2 (phases 10–16), which is DONE. It is historical. For M3 (phases 17–23) the acceptance contract is `REQUIREMENTS.md` + `../17-experience-parity-contract/EXPERIENCE-SPEC.md` — journey/structural parity, explicitly not pixel identity. This document's visual gates remain useful as regression tooling only and are not M3 DONE gates.

## Intent

M2 optimizes for recognition: a user who regularly uses Grok Bot should not need to relearn layout, control placement, state language, or common interaction flows when moving into this fork.

The implementation remains independent and provider-neutral. Observable product behavior is the reference; proprietary source code and private assets are not.

## Fidelity Order

When tradeoffs are required, preserve this order:

1. information hierarchy and control placement
2. geometry and spacing
3. interaction flow and state transitions
4. user-visible copy and icon meaning
5. timing, motion, and progressive disclosure
6. typography scale/weight/line-height
7. semantic colors, borders, elevation, and identity color
8. implementation internals

Security, accessibility, and platform-native requirements may override parity. Every override must be documented as an intentional delta.

## Shared Geometry

Do not guess globally from memory. Phase 10 captures the measured values from current references and records them in the parity matrix.

The matrix must cover at minimum:

- sidebar width and collapsed behavior
- top action control size and spacing
- roster avatar size, row height, title/preview/timestamp layout
- conversation header height and identity placement
- transcript max-width and message alignment
- composer width, minimum/maximum height, control order
- right details panel width and section rhythm
- dialog/sheet widths for Connect apps and Team Bot flows
- mobile/narrow breakpoints and surface transformations

## Typography

Use existing shared UI tokens and font stack. Match observable hierarchy through size, weight, line-height, tracking, and muted emphasis before considering any font substitution.

## Color

Remain token-driven. Do not hardcode product hex values in feature code.

- chrome stays predominantly monochrome
- Bot identity color is the main persistent chromatic identity
- status colors use semantic success/warning/destructive tokens
- selected, hover, and pressed states must match contrast and hierarchy from the reference, not merely be “visible”

## Motion and Timing

Capture behavior, not decorative animation.

Important timing classes:

- optimistic message appearance
- delayed progress indicators for operations that are not instant
- streaming response transitions
- working/waiting Bot state changes
- open/close transitions for sidebar, details, popovers, dialogs, and sheets
- playback progress for voice memo transcript highlighting

Avoid adding motion not present in the reference.

## Interaction Contract

Parity review must explicitly test:

- mouse/pointer
- keyboard
- focus traversal
- text selection
- drag/reorder where exposed
- error/retry
- loading and empty states
- screen resize / responsive transition
- reload persistence where the reference preserves state

## Copy Contract

When a Grok Bot label is part of the learned workflow, prefer the same concise wording unless the fork cannot truthfully make the same claim.

Examples that must be reviewed include Search, New chat, Conversation details, Tasks, Routines, Library, Connect apps, Search plugins, Main Bot, Publish, Resend, Delete, and approval wording.

## Screenshot Contract

Every M2 UI phase must add canonical screenshots to .planning/evidence/phase-XX-*.

For each stable canonical state:

- fixed viewport
- deterministic fixture data
- reference capture or documented official reference
- fork capture
- visual diff result
- intentional-delta note when non-zero divergence is accepted

No screenshot is evidence if the state is not deterministic enough to compare.

## Pass / Fail

A state passes only when:

- no known structural mismatch remains
- visual diff is inside the documented tolerance
- keyboard flow matches
- visible state/copy matches
- responsive behavior matches or has an explicit platform-native exception
- changed UI passes accessibility sanity checks

A feature existing is not evidence of parity.
