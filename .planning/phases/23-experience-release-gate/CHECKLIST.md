# Phase 23 Checklist — Cross-Platform Experience Parity Release Gate

## Status

DOING — Claude Code (Sonnet 5.5); CI, Electron, device, accessibility, and maintainer items open

## Tasks

- [x] P23-01 Audit every Phase 17 journey-matrix row against the final implementation. (`JOURNEY-AUDIT.md` maps all 11 journeys to evidence and remaining deltas.)
- [x] P23-02 Run Routine create/manage/test/pause/delete journeys. (`routine-chat-journey`, `routine-crud`, `routine-execution` green in the full web e2e run.)
- [x] P23-03 Run Team Bot owner setup/publish/unpublish/member-private-chat journeys. (`team-bot-publish`, `team-bots` e2e and `team-bots.test.ts` green (unpublish and member-private chat are covered there).)
- [x] P23-04 Run composer list/add-to-prompt/send/failure/resend/delete/in-flight journeys. (`composer-delivery` (4) and the parity composer/failed-send states green.)
- [x] P23-05 Run voice memo transcript + seek and approval disclosure journeys. (`voice-memo` (3) and `consequential-approval` green.)
- [x] P23-06 Run Connect apps discovery/sign-in/resume journey. (`app-connect-resume`, `golden`, `onboarding-conversation` green.)
- [x] P23-07 Run Project plan/delegation/blocker/stop/completion journey. (`project-orchestration` plan/delegation/blocker/stop/completion green (4 tests, two consecutive runs).)
- [x] P23-08 Run Main Bot event-attention/deduplication journey. (Blocker → one Main Bot message → answer e2e, plus integration dedupe and ownership tests.)
- [ ] P23-09 Verify desktop web and Electron keyboard/navigation behavior. — Not run: Electron suites are CI-only per AGENTS.md.
- [ ] P23-10 Verify mobile capability split and native interaction patterns. — Partial: mobile unit/i18n tests and typecheck only; no device or simulator run.
- [ ] P23-11 Run accessibility audit for all M3 changed web/Electron UI. — Not run: only roles/aria asserted inside e2e; no axe/screen-reader audit.
- [ ] P23-12 Run accessibility audit for all M3 changed mobile UI. — Not run.
- [ ] P23-13 Run performance review for composer, transcript, routines, projects, and event attention. — Not run as a measured review; known cost noted in Phase 22 handoff (card sync scans 200 messages per open project per pass).
- [x] P23-14 Verify no subscription/reconnect/notification duplication regressions. (New attention/card events dedupe by unique nonce (integration-tested); existing realtime/reconnect e2e green in the full run. No dedicated duplicate-subscription test added.)
- [x] P23-15 Run migration tests for Team Bot/Project/Routine schema changes. (Migrations apply from empty on the harness and a throwaway Postgres; both M3 migrations are nullable/additive. No upgrade-from-existing-data test.)
- [x] P23-16 Run security review for Team Bot publication, private routines, credentials, approvals, and cancellation ownership. (Own review fixed a cross-member Main Bot post; an independent read-only review found nothing above the bar. Team Bot publication and Routine privacy rely on Phase 18–19 tests (green).)
- [ ] P23-17 Run full lint/typecheck/unit/integration/web E2E pipeline. — Partial: typecheck clean, unit/integration/e2e results recorded in `JOURNEY-AUDIT.md` with pre-existing failures; no full green CI.
- [ ] P23-18 Run supported Electron smoke/E2E in CI. — BLOCKED: needs CI virtual-display job.
- [ ] P23-19 Run mobile critical-flow tests. — BLOCKED: needs a device or simulator.
- [x] P23-20 Capture representative hierarchy screenshots for documentation/regression only. (Hierarchy screenshots from the e2e specs (see `JOURNEY-AUDIT.md`).)
- [x] P23-21 Confirm no M3 gate requires exact pixels or Grok screenshot diff percentages. (Confirmed in `PROJECT.md` P8, `EXPERIENCE-SPEC.md`, and the `VISUAL-DIFF.md` scope note: M2 pixel gates are regression-only.)
- [x] P23-22 Audit phases 17–22 checklist/HANDOFF/STATE consistency. (Phases 17–22 checklists, handoffs, and STATE are consistent (duplicate rows for phases 20/21 in STATE removed).)
- [x] P23-23 Update CHANGELOG/release notes and journey evidence index. (CHANGELOG `[Unreleased]` entries and migration notes added; evidence index in `JOURNEY-AUDIT.md`.)
- [x] P23-24 Check upstream merge/conflict surface. (Fetched upstream (146 ahead); dry-run merge predicts 29 conflicting files for committed HEAD (listed in `JOURNEY-AUDIT.md`); nothing resolved.)
- [ ] P23-25 Obtain maintainer experience-parity approval before closing M3. — BLOCKED: requires the maintainer.

## Phase Verification

- [ ] VERIFY-01 All mandatory tasks are checked.
- [ ] VERIFY-02 Full CI and relevant platform suites pass.
- [ ] VERIFY-03 Zero known P0/P1 journey parity deltas remain.
- [ ] VERIFY-04 Security/privacy/authorization gates pass.
- [ ] VERIFY-05 Maintainer experience review passes and STATE.md is updated.

## DONE

- [ ] Phase marked DONE only after all verification items pass.
