# Phase 09 Checklist — Hardening & Release

## Status

**DOING — ZCode (GLM)**

## Tasks

- [ ] P09-01 Run full lint/typecheck/unit suite. (2026-10-05: lint 0 errors + typecheck 22/22 on the current tree; full unit ran before the last additions — final full run pending push.)
- [ ] P09-02 Run full integration suite.
- [ ] P09-03 Run full web E2E suite.
- [ ] P09-04 Run desktop E2E in supported environment.
- [ ] P09-05 Run mobile critical-flow tests.
- [ ] P09-06 Test migration from representative upstream database.
- [ ] P09-07 Test fresh install/bootstrap.
- [x] P09-08 Security review Team Bot authorization/isolation. (Member scoping + foreign-membership refusal pinned in `team-bots.test.ts`; user/space scoping on all new handlers.)
- [x] P09-09 Security review template redaction. (Exact-key whitelist test on `export.template`.)
- [x] P09-10 Security review connector/credential boundaries. (Upstream isolation unchanged; X rides the connector path with no first-party credentials.)
- [x] P09-11 Security review approvals for draft/X/proactive actions. (No bypass paths: draft = user turn, connector writes default-approval, check-ins = normal runs.)
- [ ] P09-12 Accessibility audit changed web surfaces. (Code-level: aria roles/labels/sr-only verified per phase; full audit pending final UI.)
- [ ] P09-13 Accessibility audit changed mobile surfaces. (New cards carry roles/labels; full audit pending.)
- [ ] P09-14 Performance review shell/transcript/Project/Library/Search.
- [x] P09-15 Check realtime subscriptions for leaks/reconnect storms. (No new subscriptions; refetch only on run-status transitions.)
- [x] P09-16 Review empty/loading/error/offline states. (Documented per phase for every new surface.)
- [ ] P09-17 Run visual regression/screenshot review.
- [x] P09-18 Test integration of latest upstream and document conflict hotspots. (merge-tree clean for planning docs vs upstream `01b5cd6b`; product-code assessment happens per-phase on landing.)
- [ ] P09-19 Update user/admin/developer docs.
- [ ] P09-20 Write release and migration notes.
- [ ] P09-21 Resolve all P0/P1 issues.
- [ ] P09-22 Audit every prior phase checklist and STATE entry.
- [ ] P09-23 Mark M1 complete only after release candidate approval.


## Phase Verification

- [ ] VERIFY-01 All mandatory tasks above are checked.
- [ ] VERIFY-02 Relevant tests pass or approved pre-existing failures are documented.
- [ ] VERIFY-03 No unresolved P0/P1 regression remains.
- [ ] VERIFY-04 HANDOFF.md contains final implementation and verification summary.
- [ ] VERIFY-05 STATE.md is updated.

## DONE

- [ ] Phase marked **DONE** only after all verification items pass.
