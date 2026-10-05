# Project State

## Current Milestone

**M1 — Grok Bot Parity Foundation**

## Current Phase

**Phase 09 — Hardening & Release (DOING — release-candidate approval pending)**

## Next Milestone

**M2 — Grok Bot UI/UX Parity (DOING — Phase 10 done, Phase 11 next)**

M2 begins with Phase 10 reference locking. Do not mark any M2 surface as parity-complete from feature presence alone; use the Phase 10 UI contract, canonical reference matrix, and visual/behavior verification gates.

## Phase Status

| Phase | Status | Owner | Branch/Worktree | Last Update |
|---|---|---|---|---|
| 00 Bootstrap & Baseline | DONE | ZCode (GLM) | main (fork) | 2026-10-05 |
| 01 Desktop Shell Parity | DONE | ZCode (GLM) | main (fork) | 2026-10-05 |
| 02 Details, Tasks & Projects | DONE | ZCode (GLM) | main (fork) | 2026-10-05 |
| 03 Routines, Library & Search | DONE | ZCode (GLM) | main (fork) | 2026-10-05 |
| 04 Transcript Cards & Composer | DONE | ZCode (GLM) | main (fork) | 2026-10-05 |
| 05 Sharing & Team Bots | DONE | ZCode (GLM) | main (fork) | 2026-10-05 |
| 06 Main Bot & Proactivity | DONE | ZCode (GLM) | main (fork) | 2026-10-05 |
| 07 Connect Apps, X & Voice Memo | DONE | ZCode (GLM) | main (fork) | 2026-10-05 |
| 08 Mobile Parity | DONE | ZCode (GLM) | main (fork) | 2026-10-05 |
| 09 Hardening & Release | DOING | ZCode (GLM) | main (fork) | 2026-10-05 |
| 10 Reference & Visual Diff | TODO | — | — | 2026-10-05 |
| 11 Shell/Roster/Navigation Parity | TODO | — | — | 2026-10-05 |
| 12 Composer/Input Parity | TODO | — | — | 2026-10-05 |
| 13 Transcript/Cards/Voice Parity | TODO | — | — | 2026-10-05 |
| 14 Details/Connect Apps/Team Bot Parity | TODO | — | — | 2026-10-05 |
| 15 Main Bot/Work-Flow Feel Parity | TODO | — | — | 2026-10-05 |
| 16 Responsive Parity & M2 Release | TODO | — | — | 2026-10-05 |

## Active Blockers

- None. P09-01…P09-22 are complete; only P09-23 (mark M1 complete after release-candidate approval) remains, which is the maintainer's call.

## Global Verification

- [x] Fork initialized and upstream remote configured
- [x] Baseline test suite documented
- [x] Desktop baseline screenshots captured
- [x] Web baseline screenshots captured
- [x] Mobile baseline screenshots captured (CI run 37268854174, curated under `.planning/evidence/phase-08-mobile/`)
- [x] All M1 phases DONE except 09, which is complete except P09-23 (release-candidate approval)
- [x] Security review complete (P09-08…P09-11)
- [ ] Release candidate approved

## Release Evidence

- Green full-pipeline CI run [`37322886544`](https://github.com/hehenugas/rakazo/actions/runs/37322886544) on `main` (2026-10-05): lint, typecheck, production builds + Electron smoke, unit tests, Postgres integration, web e2e 182/182.
- Phase screenshot evidence curated under `.planning/evidence/phase-0{1..9}-*/`.
- Upstream sync: fork main carries upstream `f3d4c6c3`; merge-tree clean, no conflict hotspots (P09-18).

## Coordinator Notes

When a phase changes status, update this file in the same commit as the corresponding phase `HANDOFF.md`.

Do not mark a phase DONE unless every mandatory item in its `CHECKLIST.md` is checked and its DONE gate is satisfied.

M1 remains the current milestone until Phase 09 receives release-candidate approval. M2 planning is intentionally ready in advance; Phase 10 may only be claimed explicitly. For phases 10–16, the shared UI contract at `.planning/phases/10-reference-visual-contract/UI-SPEC.md` is mandatory reading.
