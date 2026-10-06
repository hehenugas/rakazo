# Project State

## Current Milestone

**M3 — Grok Bot Experience Parity (PLANNED 2026-10-06)**

M1 and M2 remain completed historical milestones. M3 does not pursue pixel-perfect parity; it closes journey/lifecycle gaps that a Grok Bot user would otherwise have to relearn.

## Current Phase

**Phase 17 — Experience Parity Contract & Journey Baseline (TODO — unclaimed)**

## Previous Milestones

- **M1 — Grok Bot Parity Foundation — DONE 2026-10-06**
- **M2 — Grok Bot UI/UX Parity — DONE 2026-10-06**

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
| 09 Hardening & Release | DONE | ZCode (GLM) | main (fork) | 2026-10-06 |
| 10 Reference & Visual Diff | DONE | ZCode (GLM) | main (fork) | 2026-10-05 |
| 11 Shell/Roster/Navigation Parity | DONE | ZCode (GLM) | main (fork) | 2026-10-05 |
| 12 Composer/Input Parity | DONE | ZCode (GLM) | main (fork) | 2026-10-05 |
| 13 Transcript/Cards/Voice Parity | DONE | ZCode (GLM) | main (fork) | 2026-10-05 |
| 14 Details/Connect Apps/Team Bot Parity | DONE | ZCode (GLM) | main (fork) | 2026-10-05 |
| 15 Main Bot/Work-Flow Feel Parity | DONE | ZCode (GLM) | main (fork) | 2026-10-05 |
| 16 Responsive Parity & M2 Release | DONE | ZCode (GLM) | main (fork) | 2026-10-06 |
| 17 Experience Contract & Journey Baseline | TODO | — | — | 2026-10-06 |
| 18 Routines & Scheduling Experience Parity | TODO | — | — | 2026-10-06 |
| 19 Team Bot Publish & Shared Setup Parity | TODO | — | — | 2026-10-06 |
| 20 Composer & Message Delivery Parity | TODO | — | — | 2026-10-06 |
| 21 Transcript/Voice/Approvals/Connect Apps Parity | TODO | — | — | 2026-10-06 |
| 22 Projects/Delegation/Main Bot Parity | TODO | — | — | 2026-10-06 |
| 23 Cross-Platform Experience Release Gate | TODO | — | — | 2026-10-06 |

## Active Blockers

- None. M3 planning is ready; Phase 17 is unclaimed.

## Global Verification

- [x] Fork initialized and upstream remote configured
- [x] Baseline test suite documented
- [x] Desktop baseline screenshots captured
- [x] Web baseline screenshots captured
- [x] Mobile baseline screenshots captured (CI run 37268854174, curated under `.planning/evidence/phase-08-mobile/`)
- [x] All M1 phases DONE (00–09)
- [x] Security review complete (P09-08…P09-11)
- [x] Release candidate approved (2026-10-06)

## Release Evidence

- Green full-pipeline CI run [`37400135980`](https://github.com/hehenugas/rakazo/actions/runs/37400135980) on the final M2 tree (2026-10-06): lint, typecheck, production builds + Electron smoke, unit tests, Postgres integration, web e2e 205/0; earlier green full-pipeline runs on `main` include [`37322886544`](https://github.com/hehenugas/rakazo/actions/runs/37322886544) (2026-10-05, M1 release evidence).
- Phase screenshot evidence curated under `.planning/evidence/phase-0{1..9}-*/` and `.planning/evidence/phase-1{0..2}-*/`.
- Upstream sync: fork main carries upstream `f3d4c6c3`; merge-tree clean, no conflict hotspots (P09-18, re-checked 2026-10-06 in P16-20).

## Coordinator Notes

When a phase changes status, update this file in the same commit as the corresponding phase `HANDOFF.md`.

Do not mark a phase DONE unless every mandatory item in its `CHECKLIST.md` is checked and its DONE gate is satisfied.

M1 and M2 are complete historical milestones. For M3 phases 17–23, `.planning/REQUIREMENTS.md` and `.planning/phases/17-experience-parity-contract/EXPERIENCE-SPEC.md` are the primary acceptance contract. The old M2 visual-diff harness remains useful for regression, but authenticated Grok screenshots and pixel-diff percentages are not required to close M3. A task cannot be waived as pending-reference when current official docs/changelog already specify the relevant journey.
