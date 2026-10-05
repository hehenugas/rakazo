# Phase 10 — Reference Lock & Visual Diff Foundation

## Objective

Turn “make it feel exactly like Grok Bot” into a measurable UI/UX contract before further parity implementation.

M2 does not accept feature-presence as parity. A surface is only considered matched when its public reference, layout, copy, interaction states, timing, keyboard behavior, and responsive behavior are captured and verified.

## Reference Policy

- Use current public Grok Bot product surfaces, official docs, official changelog, and official design material as references.
- Record the capture date and source for every canonical reference.
- Do not copy proprietary source code, private assets, or hidden implementation details.
- Reimplement the observable UX using Rakazo primitives and shared design tokens.
- When Grok changes during M2, do not silently chase it. Record the delta and deliberately re-pin the reference set.

## Canonical Desktop States

At minimum capture and track:

1. empty/idle Bot conversation
2. working Bot
3. waiting-for-user Bot
4. unread/attention Bot in roster
5. Search open
6. New chat open
7. Conversation Details home
8. Tasks list and Project detail
9. Routines list/editor
10. Library
11. Connect apps / plugin search
12. Team Bot setup and published state
13. Main Bot selected and proactive check-in
14. normal assistant response
15. tool/activity disclosure
16. approval request
17. editable action draft
18. failed message
19. voice memo with transcript/playback
20. attachments/artifacts
21. narrow desktop
22. mobile equivalents where the product exposes them

## Visual Contract

Each canonical state must record:

- viewport size and device scale assumptions
- shell width, sidebar width, content max-width, panel width
- key spacing, radii, borders, elevation, typography hierarchy
- avatar geometry and identity/status treatment
- exact visible labels where they are product-significant
- hover, pressed, focus, disabled, loading, error, unread, working, waiting states
- transition or delayed-progress behavior when observable
- keyboard behavior
- responsive transformation

## Visual Diff Gate

Stable reference fixtures should use screenshot comparison.

- Mask only truly volatile content such as timestamps, generated text, or remote thumbnails.
- Never mask structural UI simply to make a diff pass.
- Target <= 1.0% unexpected changed pixels for stable canonical states after justified masks.
- Any obvious structural mismatch fails even when the numeric threshold passes.
- Every tolerance or mask must be documented in the phase handoff.

## Likely Code Areas

- apps/web/e2e/
- packages/ui-tokens/
- packages/ui-web/
- apps/web/src/pages/Shell.tsx
- apps/web/src/pages/shell/
- apps/web/src/components/
- apps/mobile/
- .planning/evidence/

## Acceptance Criteria

There is one authoritative parity matrix mapping every canonical Grok Bot state to a local implementation state, screenshot evidence, automated or manual verification method, and known delta.

## DONE Gate

Phase 10 is DONE only when the reference matrix, baseline captures, reusable visual-diff harness, and parity scoring rules exist and are usable by phases 11–16.
