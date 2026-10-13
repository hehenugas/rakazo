# Project State

## Current Milestone

**M3 — Grok Bot Experience Parity (PLANNED 2026-10-06)**

M1 and M2 remain completed historical milestones. M3 does not pursue pixel-perfect parity; it closes journey/lifecycle gaps that a Grok Bot user would otherwise have to relearn.

## Current Phase

**Phase 23 — Cross-Platform Experience Release Gate (DOING — Claude Code; CI, Electron, device, and maintainer items open)**

## M4 (in progress; parity work integrated into fork `main` on 2026-10-13; release gate open)

M4 follows `.planning/M4-EXECUTION-PLAN.md`. M3 Phase 23 is still DOING; the maintainer directed M4 to proceed anyway (recorded in `phases/24-reference-lock-baseline/SPEC.md`). M4 status is tracked in this table only; no M4 phase is DONE unless its checklist says so.

| Phase | Status | Last Update |
|---|---|---|
| 24 Reference lock & baseline | DONE (audit deliverables; P24-04 open) | 2026-10-12 |
| 25 M3 completion & runtime reliability | DOING (P25-01, P25-04 open) | 2026-10-12 |
| 26 Daily UX parity | DOING (P26-05 open; web only) | 2026-10-12 |
| 27 Email action parity | DOING (P27-04/05 provider-dependent, not done) | 2026-10-12 |
| 28 Slide decks & export | DOING (P28-05 Google Slides not offered) | 2026-10-12 |
| 29 Mobile capability & voice | DOING (device items blocked) | 2026-10-12 |
| 30 Messaging & integration edge parity | DOING (P30-03 open) | 2026-10-12 |
| 31 M4 release & upstream gate | DOING (CI, Electron, devices, maintainer approval open) | 2026-10-12 |

## M5 (CODE COMPLETE — code-only; runtime/UI/tests NOT VERIFIED)

M5 — Grok Bot Feature & Experience Completion is specified in `.planning/M5-EXECUTION-PLAN.md` (phases 32–36). Code is implemented and statically reviewed on `main`; typechecks passed. No runtime, UI, test, CI, device, or provider verification is claimed. See `.planning/M5-HANDOFF.md` for limits and owner checks. M3 Phase 23 and M4 Phase 31 release gates remain open and are not superseded.

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
| 17 Experience Contract & Journey Baseline | DONE | ZCode (GLM) | main (fork) | 2026-10-06 |
| 18 Routines & Scheduling Experience Parity | DONE | ZCode (GLM) | main (fork) | 2026-10-06 |
| 19 Team Bot Publish & Shared Setup Parity | DONE | ZCode (GLM) | main (fork) | 2026-10-06 |
| 20 Composer & Message Delivery Parity | DONE | ZCode (GLM) | main (fork) | 2026-10-06 |
| 21 Transcript/Voice/Approvals/Connect Apps Parity | DONE | Claude Code (Sonnet 5.5) | main (fork) | 2026-10-11 |
| 22 Projects/Delegation/Main Bot Parity | DONE | Claude Code (Sonnet 5.5) | main (fork) | 2026-10-11 |
| 23 Cross-Platform Experience Release Gate | DOING | Claude Code (Sonnet 5.5) | main (fork) | 2026-10-11 |

## Active Blockers

- None. M3 planning is committed; Phase 17 is being executed.

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
