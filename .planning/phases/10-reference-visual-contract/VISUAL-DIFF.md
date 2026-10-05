# Visual Diff — Masks and Tolerances

Phase 10 deliverable (P10-15/P10-16). How the M2 visual gates run, what is masked, and
why. The rule: **mask only truly volatile content; never mask structural UI to make a
diff pass.**

## Gate 1 — Fork screenshot gate (regression inside phases 11–16)

`apps/web/e2e/parity/canonical-states.spec.ts` compares stable canonical states with
`expect(page).toHaveScreenshot()`:

- **Tolerance**: `maxDiffPixelRatio = 0.02` (2%). This absorbs cross-machine font
  antialiasing between dev Linux boxes and the CI runner; structural changes (layout,
  spacing, missing controls, wrong states) always exceed it and fail.
- **Viewports**: desktop 1440×900, narrow 1024×768, mobile 390×844. Viewport-only
  frames (not fullPage) — the frame is part of the contract.
- **Determinism**: animations disabled, caret hidden, pinned fixture avatars
  (`#hex::shape_N` via RPC), fixed fixture names, fixed scripted-runtime prompts.
- **Compared states** (one baseline each under
  `apps/web/e2e/parity/canonical-states.spec.ts-snapshots/`): 01 idle conversation,
  02 search open, 03 new chat open, 04 conversation details home, 05 tasks list,
  06 project detail, 07 routines list, 08 library, 09 connect-apps catalog,
  10 connect-apps search, 11 team-bot setup, 12 team-bot instance, 13 main-bot
  selected, 14 roster unread, 19 narrow desktop idle, 20 mobile idle.
- **Re-baselining**: `pnpm test:e2e -- --spec=apps/web/e2e/parity/canonical-states.spec.ts --update-snapshots`
  (the harness passes the flag through to Playwright). Re-baseline only when the UI
  change is intended, and say so in the phase handoff.

### Masks (justified)

| Mask | Why it is volatile | Where used |
|---|---|---|
| `time` elements | Message/roster timestamps render wall-clock time of the run. | every compared state |
| `roster-time` (`[data-testid="roster-time"]`) | Roster preview timestamps; added in this phase as a stable mask hook (span was class-only). | every compared state |

Nothing else is masked. Generated reply text is deterministic for the scripted runtime
(same prompt → same reply), so the transcript in `17-normal-response` is diffable in
principle — it is capture-only for now because its timing (when the reply lands) is
volatile; phases 12–13 may promote it to a compared state once the streaming gate is
fully settled.

## Gate 2 — Reference-vs-fork pixel diff

`scripts/visual-diff.mjs <reference.png> <fork.png> [--tolerance 0.01] [--mask x,y,w,h]... [--threshold 0.1] [--out DIR]`

- Compares a pinned Grok capture against the matching fork capture (same viewport).
- Default tolerance 0.01 (≤1.0% unexpected changed pixels after masks) — the SPEC
  target for stable canonical states.
- Masks are rectangles of volatile content only; every mask used in a phase must be
  listed in that phase's handoff with its justification.
- Dimension mismatches fail unconditionally; the contract compares the same viewport.
- Output: JSON report (`changedPixels`, `changedRatio`, masks) + `diff.png` with
  changed pixels highlighted and masked regions painted amber. Exit 1 when outside
  tolerance.
- Reference captures do not exist yet (they need an authenticated Grok session —
  see the registry in `PARITY-MATRIX.md`); until then this gate is wired and dry.

## Pass/Fail recap

A canonical state passes only when the numeric gate is inside tolerance AND no
structural mismatch is visible in `diff.png` — the numeric threshold passing never
excuses an obvious structural difference.
