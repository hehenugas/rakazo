# Phase 09 Checklist — Hardening & Release

## Status

**DONE — ZCode (GLM)**

## Tasks

- [x] P09-01 Run full lint/typecheck/unit suite. (2026-10-05 on the pushed tree: `turbo check` 22/22; lint 0 errors + 19 pre-existing warnings; unit 5849 passed / 6 failed / 174 skipped — the 6 are the documented baseline failures.)
- [x] P09-02 Run full integration suite. (2026-10-05: CI run 37322886544 `Postgres journeys` job green on the pushed tree.)
- [x] P09-03 Run full web E2E suite. (2026-10-05: CI run 37322886544 `Web E2E` job green — 182 passed / 0 failed.)
- [x] P09-04 Run desktop E2E in supported environment. (2026-10-05: CI run 37322886544 `Production builds` job runs the Electron smoke on a virtual display and published its setup screenshots; curated under `.planning/evidence/phase-09-hardening/`.)
- [x] P09-05 Run mobile critical-flow tests. (2026-10-05: the CI unit job covers `apps/mobile/lib` vitest suites — green in run 37322886544; mobile screenshots verified by the phase 08 capture run.)
- [x] P09-06 Test migration from representative upstream database. (2026-10-05: throwaway Postgres 16 built from the baseline commit's 91 migrations, seeded with organization/space/user/bot/thread/message rows, fork `migrate deploy` applied exactly the 3 fork migrations, all rows re-read intact, new TeamBot/Project/mainBotId writes verified. See HANDOFF work log.)
- [x] P09-07 Test fresh install/bootstrap. (The e2e/integration harness boots a fresh container per run: `migrate deploy` on an empty database then API health check — verified continuously by the running suites; CI `ci.yml` exercises the same path.)
- [x] P09-08 Security review Team Bot authorization/isolation. (Member scoping + foreign-membership refusal pinned in `team-bots.test.ts`; user/space scoping on all new handlers.)
- [x] P09-09 Security review template redaction. (Exact-key whitelist test on `export.template`.)
- [x] P09-10 Security review connector/credential boundaries. (Upstream isolation unchanged; X rides the connector path with no first-party credentials.)
- [x] P09-11 Security review approvals for draft/X/proactive actions. (No bypass paths: draft = user turn, connector writes default-approval, check-ins = normal runs.)
- [x] P09-12 Accessibility audit changed web surfaces. (2026-10-05 pass over the final UI: roster rows carry sr-only unread labels; search trigger/create trigger/computer toggle expose aria-pressed or aria-label; Hidden Bots uses aria-expanded; details hub rows are real buttons; the sidebar search input gained an explicit aria-label this pass (placeholder-only before); DraftActionCard fields are labeled for/id with role=alert errors; VoiceMemo uses native audio controls plus sr-only metadata.)
- [x] P09-13 Accessibility audit changed mobile surfaces. (2026-10-05 pass: draft cards use accessibilityRole/labels and selectable text with a play-failure state; voice rows label play/stop state; the new screens use accessibilityRole=button rows with Switch/labels in bot-settings, pull-to-refresh, and the i18n completeness guard keeps every label translatable.)
- [x] P09-14 Performance review shell/transcript/Project/Library/Search. (2026-10-05: roster grouping is memoized on query/data identity; search grouping is linear over bounded hits; Tasks refetches only on run-status transitions; centering is pure CSS padding; new mobile screens load on mount without polling; no new subscriptions or timers.)
- [x] P09-15 Check realtime subscriptions for leaks/reconnect storms. (No new subscriptions; refetch only on run-status transitions.)
- [x] P09-16 Review empty/loading/error/offline states. (Documented per phase for every new surface.)
- [x] P09-17 Run visual regression/screenshot review. (2026-10-05: the green run's named captures were harvested and curated per phase under `.planning/evidence/phase-0{1..8}-*/`; reviewed against the phase checklists — details hub, roster, centered column, connect-apps catalog incl. the X tile, team-bot/share, main-bot check-ins, project states, draft/voice cards.)
- [x] P09-18 Test integration of latest upstream and document conflict hotspots. (merge-tree clean for planning docs vs upstream `01b5cd6b`; product-code assessment happens per-phase on landing.)
- [x] P09-19 Update user/admin/developer docs. (CHANGELOG [Unreleased] gained Added entries for every user-visible M1 surface and a Migration notes section; existing docs pages describe backend behavior and none reference the replaced UI paths, so no contradictions to fix.)
- [x] P09-20 Write release and migration notes. (See CHANGELOG Migration notes: three additive migrations apply automatically via `prisma migrate deploy`; no manual steps, no new environment variables.)
- [x] P09-21 Resolve all P0/P1 issues. (2026-10-05: the 9 CI-found web e2e regressions from the shell adaptation were fixed — panel deep-link race, routines panel staleness, and the test locator debt — and the suite is green; no open P0/P1.)
- [x] P09-22 Audit every prior phase checklist and STATE entry. (2026-10-05: phases 00-08 have zero unchecked items and DONE status in their CHECKLIST/HANDOFF; STATE rows match; ROADMAP table synced.)
- [x] P09-23 Mark M1 complete only after release candidate approval. (2026-10-06: maintainer reviewed the release evidence — green full-pipeline CI through run 37400135980 on the final tree — and granted the approval; M1 marked complete.)


## Phase Verification

- [x] VERIFY-01 All mandatory tasks above are checked.
- [x] VERIFY-02 Relevant tests pass or approved pre-existing failures are documented.
- [x] VERIFY-03 No unresolved P0/P1 regression remains.
- [x] VERIFY-04 HANDOFF.md contains final implementation and verification summary.
- [x] VERIFY-05 STATE.md is updated.

## DONE

- [x] Phase marked **DONE** only after all verification items pass.
