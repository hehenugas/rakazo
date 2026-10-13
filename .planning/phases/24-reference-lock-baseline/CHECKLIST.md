# Phase 24 Checklist — Reference Lock & Baseline

## Status

DONE (audit only) — Claude Code (Sonnet 5.5), branch `m4-execution`, 2026-10-12

## Tasks

- [x] P24-01 Record dated official versions and URLs after v0.66.0. (`REFERENCE-SOURCES.md`: v0.67.0, v0.68.0, v0.68.1; changelog read from a 2026-10-10 Wayback capture because the live page returns 403; docs pages undated.)
- [x] P24-02 Make the reference matrix. (`REFERENCE-MATRIX.md`; unclear items labeled `unverified`.)
- [x] P24-03 Compare every entry to local code/tests. (Read-only agent-assisted audit, spot-checked by grep; no screenshots exist for new items.)
- [ ] P24-04 Capture canonical UI journeys. — Not done: no authorized Grok reference captures and no device/Electron here; the new items have no local UI yet.
- [x] P24-05 Create `M4-REQUIREMENTS.md` and `M4-ACCEPTANCE-MATRIX.md`.
- [x] P24-06 Refresh upstream divergence. (2026-10-12: fork 43 ahead, upstream 146 ahead; dry-run `git merge-tree` predicts 34 conflicting paths = 24 code/docs + 10 `messages.po`; list in `HANDOFF.md`. Nothing merged.)
- [x] P24-07 Scope confirmation. (Maintainer directive to complete all phases, recorded in `SPEC.md`.)

## Phase Verification

- [x] VERIFY-01 Every mandatory M4 item has a source+code pair (see `REFERENCE-MATRIX.md` exit check).
- [x] VERIFY-02 No unverified behavior is in MUST scope.
- [ ] VERIFY-03 P24-04 journey capture outstanding; phase is DONE for the audit deliverables only.
