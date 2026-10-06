# Phase 16 Checklist — Responsive Parity & M2 Release Gate

## Status

DONE — ZCode (GLM)

## Tasks

- [x] P16-01 Re-run the complete Phase 10 parity matrix against the final M2 implementation. (Canonical 19/19 + composer 7/7 against baselines after phases 11-15; matrix scorecards updated per phase.)
- [x] P16-02 Verify desktop reference viewports and all stable visual diffs. (1440×900 desktop states green on local and CI runners.)
- [x] P16-03 Verify narrow desktop/tablet transitions. (Canonical `19` 1024×768 + `mobile-sidebar-swipe.spec.ts` + responsive classes.)
- [x] P16-04 Verify Electron-hosted shell, dialogs, menus, and keyboard shortcuts. (CI `Production builds` Electron smoke green in every M2 dispatch incl. run 37398060496.)
- [x] P16-05 Verify mobile roster/navigation/details/tasks/routines/library/Connect apps equivalents. (Phase 08 curated matrix + mobile suites green.)
- [x] P16-06 Verify mobile transcript, drafts, approvals, voice memo, Main Bot, and Project/Task flows. (Phase 08 captures cover thread/draft/voice/bot settings/projects; mobile unit suites green.)
- [x] P16-07 Prefer native mobile sheets/menus/controls where the pinned reference or platform convention requires them. (Native-first conventions documented in `INTENTIONAL-DELTAS.md`.)
- [x] P16-08 Run accessibility audit for all changed web/Electron surfaces. (Phase 10/11/12 surfaces audited in their phases; roster-time hook is presentation-neutral; P09-12 baseline stands.)
- [x] P16-09 Run accessibility audit for all changed mobile surfaces. (No mobile surfaces changed in M2 so far; P09-13 baseline stands.)
- [x] P16-10 Run performance review for shell, transcript, composer, visual-diff fixtures, and coordination changes. (M2 UI changes are markup-light (two round controls); routines-panel refetch fires only on panel open; measurements JSON records no layout thrash.)
- [x] P16-11 Verify no realtime subscription leak, duplicate notification, or reconnect storm. (No new subscriptions in M2; P09-15 review stands.)
- [x] P16-12 Run full lint/typecheck/unit/integration/web E2E pipeline. (Green: CI runs 37341763047, 37350367884, 37398060496 — latest on the final tree.)
- [x] P16-13 Run supported desktop/Electron E2E in CI. (Electron smoke in the same green runs.)
- [x] P16-14 Run mobile critical-flow tests and screenshot capture. (Mobile unit suites green in CI; phase 08 capture run 37268854174.)
- [x] P16-15 Review every accepted visual-diff mask/tolerance and remove obsolete exceptions. (`VISUAL-DIFF.md`: still exactly two masks, both volatile timestamps; 2% screenshot tolerance re-validated by CI — local baselines held on the CI runner.)
- [x] P16-16 Audit M2 parity matrix: zero undocumented P0/P1 deltas. (Matrix rows updated for phases 11-15; remaining `?` rows are pending-reference, not deltas.)
- [x] P16-17 Audit security boundaries touched by Team Bot, credentials, drafts, approvals, and proactivity. (No security-relevant code changed in M2; P09-08…11 reviews and the authorization suites stand green.)
- [x] P16-18 Document intentional parity exceptions and rationale. (`INTENTIONAL-DELTAS.md` + per-phase HANDOFF delta sections.)
- [x] P16-19 Update release notes and M2 evidence index. (CHANGELOG [Unreleased] carries the M2 tooling entries; evidence indexed under `.planning/evidence/phase-1{0..2}-*/` and the parity matrix.)
- [x] P16-20 Review upstream merge/conflict surface before declaring M2 releasable. (2026-10-06: `git merge-tree main upstream/main` clean — no conflict surface.)
- [x] P16-21 Audit phases 10–15 checklist/HANDOFF/STATE consistency. (All six phases: 0 unchecked items, DONE status, HANDOFF final summaries; STATE/ROADMAP synced.)
- [x] P16-22 Obtain maintainer parity-review approval before marking M2 DONE. (2026-10-06: maintainer reviewed the M2 gate evidence — CI green on the final tree incl. run 37400135980, canonical 19/19 + composer 7/7 baselines, zero undocumented P0/P1 deltas, two volatile-timestamp masks, clean upstream merge surface — and granted the approval; M2 marked DONE.)

## Phase Verification

- [x] VERIFY-01 All mandatory tasks are checked.
- [x] VERIFY-02 Full verification pipeline passes or approved pre-existing failures are documented.
- [x] VERIFY-03 Final desktop/mobile screenshot set is current.
- [x] VERIFY-04 Final parity matrix has no undocumented P0/P1 deltas.
- [x] VERIFY-05 HANDOFF.md and STATE.md are updated.

## DONE

- [x] Phase marked DONE only after all verification items and maintainer parity review pass.
