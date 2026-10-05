# Phase 11 — Shell, Roster & Navigation Parity

## Objective

Make the first five seconds of the desktop/web experience visually and behaviorally indistinguishable from the pinned Grok Bot reference at the shell level.

This phase inherits Phase 10 UI-SPEC.md and the parity matrix.

## Scope

- top Search and New chat actions
- sidebar spacing, width, section rhythm, collapse behavior
- Bot roster rows, timestamps, previews, unread/attention/working/waiting states
- Hidden Bots presentation
- Bot avatar geometry and current public shape/status language
- conversation header identity/details trigger
- secondary computer affordance
- centered transcript shell geometry
- Connect apps footer entry and featured app-logo treatment
- shell keyboard shortcuts and focus order
- shell motion/responsive transformation

## Important Known Deltas To Recheck

- current Search and New chat are wide pill buttons; current Grok reference uses more compact round controls
- current footer uses a generic grid icon instead of the learned featured-app treatment
- current shipped avatar shape set may not match the latest public Grok Bot set
- current shell was accepted under M1 for hierarchy, not pixel/interaction fidelity

## Acceptance Criteria

All Phase 10 shell states pass the parity scorecard with no known structural mismatch.

## DONE Gate

Desktop shell screenshots, visual diffs, keyboard tests, focus checks, and narrow-layout sanity checks all pass.
