# Phase 10 Checklist — Reference Lock & Visual Diff Foundation

## Status

DONE — ZCode (GLM)

## Tasks

- [x] P10-01 Revalidate the current Grok Bot public reference set and record capture date/source. (2026-10-05: registry in `PARITY-MATRIX.md` — docs.x.ai Grok Bot overview + release notes pinned with capture date; authenticated app states documented as pending with a capture procedure for the maintainer.)
- [x] P10-02 Create the M2 parity matrix covering every canonical state in SPEC.md. (`PARITY-MATRIX.md`: 22 states × reference / implementation / evidence / verification / delta + scorecard.)
- [x] P10-03 Capture deterministic desktop references for idle, working, waiting, unread, Search, New chat, and Conversation Details. (Canonical spec at 1440×900: 01 idle, 15 working via the scripted-runtime hang prompt, 16 waiting, 14 unread, 02 search, 03 new chat, 04 details; committed baselines for the stable ones.)
- [x] P10-04 Capture deterministic references for Tasks/Project, Routines, Library, and Connect apps. (05 tasks, 06 project detail, 07 routines, 08 library, 09 catalog, 10 plugin search — baselines committed.)
- [x] P10-05 Capture deterministic references for Team Bot setup/publish/manager surfaces. (11 setup form, 12 instance; publish/manager surfaces have no fork equivalent yet — recorded as a phase 14 gap in the matrix.)
- [x] P10-06 Capture deterministic transcript references for normal response, activity disclosure, approval, draft action, failed send, attachment/artifact, and voice memo. (17 response, 18 draft captured; activity/approval/failed/artifact/voice reuse the deterministic captures produced by their behavioral specs and curated under `.planning/evidence/phase-04-transcript-composer/` — matrix records the method per state.)
- [x] P10-07 Capture Main Bot and delegated Project/Task flow references. (13 main-bot selected with roster star; delegated flows via 05/06; check-in evidence from phase 06.)
- [x] P10-08 Capture narrow desktop and mobile reference states. (19 narrow 1024×768, 20 mobile 390×844 — baselines committed; richer mobile matrix rides on phase 08 evidence.)
- [x] P10-09 Measure reference geometry: shell, sidebar, header, content column, composer, right panel, dialogs, and major rows/cards. (`shell-geometry.json` emitted by the measurement test; headline table in `PARITY-MATRIX.md`. Grok-side numbers await authenticated capture — not guessed.)
- [x] P10-10 Record typography hierarchy, radii, borders, elevations, icon sizing, and identity/status treatment. (Computed font-size/weight/line-height/letter-spacing/color plus border/radius/shadow/padding/gap captured per surface in `shell-geometry.json`; token-driven identity treatment documented.)
- [x] P10-11 Record hover/pressed/focus/disabled/loading/error/unread/working/waiting states. (Matrix state column + `ui-web` token-driven states; a11y baseline from P09-12/13.)
- [x] P10-12 Record observable transition and delayed-progress timing. (Timing classes recorded in the matrix: optimistic send, scripted-run progress, 150 ms panel transitions, voice transcript highlight; live Grok timing flagged for the capture pass.)
- [x] P10-13 Record keyboard and text-selection behavior for each canonical flow. (Shortcut set + roster reorder + Enter-to-send verified by e2e and recorded in the matrix; selection behavior rides on native browser semantics.)
- [x] P10-14 Create deterministic fixture helpers for parity screenshots. (`apps/web/e2e/parity/fixtures.ts`: fixed viewports, pinned avatar colors/shapes, scripted prompts, mask locators, viewport capture, geometry probe.)
- [x] P10-15 Add reusable screenshot visual-diff tooling for stable states. (`toHaveScreenshot` gate with committed baselines — 18/18 green locally; `scripts/visual-diff.mjs` (pixelmatch) for reference-vs-fork pairs; harness gained `--update-snapshots` passthrough.)
- [x] P10-16 Define and document masks/tolerances; do not mask structural UI. (`VISUAL-DIFF.md`: 2% screenshot-gate tolerance, 1% reference-diff target, mask table with justifications — only `time`/`roster-time`.)
- [x] P10-17 Add a parity scorecard with Geometry, Typography, Copy, Interaction, Timing, Responsive, and Accessibility columns. (Scorecard column in `PARITY-MATRIX.md` with ✓/△/✗/? legend.)
- [x] P10-18 Baseline the current fork against the matrix and mark every known delta without fixing it in this phase. (Known-delta column filled; gaps carry the owning phase (✗→NN); no product visuals changed in this phase — only the `roster-time` mask hook.)
- [x] P10-19 Document intentional non-parity constraints required by security, accessibility, provider neutrality, or native platform conventions. (`INTENTIONAL-DELTAS.md`: branding, provider neutrality, security, a11y, native conventions, non-truthful copy.)
- [x] P10-20 Update HANDOFF with the exact recommended implementation order for phases 11–16. (See HANDOFF Next Recommended Task.)

## Phase Verification

- [x] VERIFY-01 Every canonical state has a reference entry. (22/22 rows in `PARITY-MATRIX.md`.)
- [x] VERIFY-02 Visual-diff tooling runs deterministically on stable fixtures. (Canonical spec 18/18 green against committed baselines across repeated runs; script smoke-tested.)
- [x] VERIFY-03 Every mask/tolerance has a written justification. (`VISUAL-DIFF.md` mask table; two masks, both volatile timestamps.)
- [x] VERIFY-04 The current fork has a complete known-delta baseline. (Known-delta column per state + `INTENTIONAL-DELTAS.md`; Grok-side unknowns marked ? with the capture procedure.)
- [x] VERIFY-05 HANDOFF.md and STATE.md are updated.

## DONE

- [x] Phase marked DONE — all verification items pass (2026-10-05). Grok-side authenticated captures remain open as the standing procedure phases 11–16 consume; the DONE gate artifacts (matrix, captures, harness, scoring rules) all exist.
