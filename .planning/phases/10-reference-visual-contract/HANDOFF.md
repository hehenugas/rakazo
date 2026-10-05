# Phase 10 Handoff — Reference Lock & Visual Diff Foundation

## Current Status

DONE — reference lock + visual-diff foundation complete (2026-10-05); phases 11-16 consume the matrix, baselines, and gates.

## Owner

ZCode (GLM)

## Branch / Worktree

Local `main` (fork), pushed to `origin/main`.

## Work Log

### 2026-10-05 — Phase claimed (ZCode/GLM)

- Claimed P10-01…P10-20; work starts with reference pinning and the parity matrix, then fixture helpers and the visual-diff harness.

### 2026-10-05 — M2 planning created

- Established reference-first UI/UX parity as the next milestone.
- Added a shared UI design contract and measurable visual-diff gate.
- No product code changed.

### 2026-10-05 — Phase implemented and verified (ZCode/GLM)

- **Reference registry (P10-01)**: public Grok Bot references pinned with capture date in `PARITY-MATRIX.md` (docs.x.ai overview + release notes, captured 2026-10-05). Authenticated app states are documented as pending with an exact maintainer capture procedure (1440×900 / 1024×768 / 390×844 into `.planning/evidence/phase-10-reference/reference/` + `SOURCE.md`) — nothing is filled from memory.
- **Parity matrix (P10-02, P10-17)**: `PARITY-MATRIX.md` maps all 22 canonical states to reference source, fork implementation, evidence, verification method, known delta, and the G/T/C/I/T/R/A scorecard (✓/△/✗/? legend).
- **Canonical captures (P10-03…P10-08)**: `apps/web/e2e/parity/canonical-states.spec.ts` produces 20 deterministic captures; 15 stable states have committed screenshot baselines (`toHaveScreenshot`, tolerance 0.02, masks limited to volatile timestamps); working state uses the scripted-runtime hang prompt ("keep working…") for a deterministic freeze; curated copies under `.planning/evidence/phase-10-reference/`.
- **Measurements (P10-09/P10-10)**: `shell-geometry.json` records computed geometry/typography per surface (sidebar 316px, header 65px, roster row 58px, composer 880×52, roster name 14px/600/21px, identity pill 16px/400/24px, …). Grok-side numbers intentionally absent until the authenticated capture.
- **Diff tooling (P10-15)**: `scripts/visual-diff.mjs` (pixelmatch + pngjs devDeps) diffs reference-vs-fork pairs with masks, tolerance, JSON report, and highlighted `diff.png`; the harness passes `--update-snapshots` through for re-baselining.
- **Masks/tolerances (P10-16)**: `VISUAL-DIFF.md` documents both gates and the two justified masks (`time`, `roster-time` — volatile timestamps only; the testid hook was added to the roster span).
- **Deltas (P10-18/P10-19)**: known gaps carry owning phases in the matrix (✗→11-16); `INTENTIONAL-DELTAS.md` records branding, provider-neutrality, security, a11y, and native-platform overrides.
- **Verification**: canonical spec 18/18 green against baselines (repeated runs); `tsc` clean; biome clean.

## Files / Modules Expected

- .planning/evidence/phase-10-reference/
- apps/web/e2e/
- shared screenshot fixture/test helpers as needed

## Verification Run

| Suite | Command | Result |
|---|---|---|
| Canonical states | `pnpm test:e2e -- --spec=apps/web/e2e/parity/canonical-states.spec.ts` | 18/18 passed against committed baselines (repeated runs, 2026-10-05) |
| Typecheck | `pnpm --filter @rakazo/web exec tsc --noEmit` | clean |
| Lint | `pnpm exec biome check` on touched paths | clean |
| Visual-diff script | identical-image smoke + `--help` shape | exit 0, JSON report correct |

## Decisions Made During Phase

- Feature presence is not sufficient for M2 parity.
- References must be pinned before implementation changes.
- Security/accessibility/provider-neutral behavior may intentionally diverge, but every divergence must be explicit.

## Blockers

None.

## Discovered Follow-ups

None yet.

## Next Recommended Task

Implementation order for phases 11–16 (P10-20):

1. **Phase 11 — Shell, roster & navigation** first: it owns the largest measured surface (sidebar 316px, header 65px, roster rows) and every other phase re-uses those baselines. Work state-by-state against `01/02/03/04/14/19` baselines; diff with the screenshot gate after each change; keep `INTENTIONAL-DELTAS.md` in sync.
2. **Phase 12 — Composer & input**: use `composer` measurements (880×52 centered) and the keyboard records; promote `17-normal-response` to a compared state once streaming timing is pinned.
3. **Phase 13 — Transcript, cards & voice**: runs after 12 because cards inherit composer state; owns the timing classes (✗→13 rows) and the voice transcript highlight.
4. **Phase 14 — Details, Connect apps & Team Bot**: owns the team-bot publish/manager gap (✗→14) and connector catalog composition; needs the maintainer reference captures for Grok's publish flow before building.
5. **Phase 15 — Main Bot & work-flow feel**: depends on 13's timing work; verify delegated flows against 05/06 baselines.
6. **Phase 16 — Responsive & release gate**: re-runs the whole matrix across the three viewports, prunes diff exceptions, and runs the full gates.

Rule for every phase: capture the maintainer's authenticated reference BEFORE changing a surface it covers; diff reference-vs-fork with `scripts/visual-diff.mjs`; record every mask and every accepted delta.

## Final Summary

Complete — matrix, baseline captures, visual-diff harness, and scoring rules exist and are usable by phases 11-16. Grok-side authenticated captures stay open as a standing procedure, not a blocker for starting phase 11.
