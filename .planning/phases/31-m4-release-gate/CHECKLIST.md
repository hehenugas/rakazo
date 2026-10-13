# Phase 31 Checklist — M4 Release & Upstream Gate

## Status

DOING — Claude Code (Sonnet 5.5), branch `m4-execution`, 2026-10-12. Local evidence only; **not releasable on this evidence**.

## Tasks

- [ ] P31-01 Every approved MUST mapped to a green test/evidence and all P0/P1 closed. — Partial: every MUST in `M4-ACCEPTANCE-MATRIX.md` has a locally passing test (mocked/emulated providers, web only); SHOULD items EML-003/004, MOB-001/002 are partial or not done; no CI.
- [ ] P31-02 Full typecheck, lint, unit, Postgres integration, e2e, migration-upgrade, platform CI green. — Partial; see "Recorded results". Pre-existing failures remain and CI has not run.
- [ ] P31-03 Electron E2E on CI virtual display; mobile critical journeys on devices; security, accessibility, performance evidence. — BLOCKED: Electron (CI), devices; accessibility and performance audits not run. A read-only security review of the M4 diff was done and its P1 findings fixed (see HANDOFF).
- [ ] P31-04 Failure/recovery cases: reconnect, restart, duplicate events, timed-out sends, cancellations, approval race. — Partial: idempotent draft submit, compare-and-set draft writes, cloud-agent cancel idempotency, fail-closed Slack lookup are tested; reconnect, app restart, and approval races for the new flows are not.
- [x] P31-05 Upstream merge-tree checked; sync strategy proposed (not executed). (2026-10-12 against `upstream/main`: fork 50 ahead, upstream 146 ahead; dry run predicts 37 conflicting paths, 27 code/docs + 10 `messages.po`, listed in `HANDOFF.md`. Strategy: do not merge from this branch; first land M4 in reviewable slices, then merge upstream in a dedicated branch, regenerate locale catalogs and the lockfile instead of hand-resolving them. Nothing merged.)
- [ ] P31-06 Screenshot documentation for material UI changes. — Partial: Playwright screenshots exist for palette plugin, routine row menu, bot-colored bubble, formatted email preview, deck card (under `apps/web/test-results/` and CI reports, not committed). No mobile or Electron captures.
- [x] P31-07 Release notes, migrations, unsupported capabilities, provider requirements, rollback notes. (`CHANGELOG.md` [Unreleased] entries and Migration notes; `docs/self-host.md` Slack paragraph; unsupported items in the Phase 27, 28, 29 checklists.)
- [ ] P31-08 Maintainer end-to-end experience approval. — OPEN: only the maintainer can record it. `STATE.md` is not changed to DONE for any M4 phase.

## Phase Verification

- [ ] VERIFY-01 All mandatory tasks checked.
- [ ] VERIFY-02 Full CI and platform suites pass.
- [ ] VERIFY-03 Maintainer approval recorded.

## DONE

- [ ] M4 is not DONE.
