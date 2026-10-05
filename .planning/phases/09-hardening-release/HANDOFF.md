# Phase 09 Handoff — Hardening & Release

## Current Status

DOING — code-level security/state reviews done (P09-08…P11, P09-15/16); all suite gates (P09-01…P05) and the release gates (P09-21…23) remain open until the pending CI runs finish and prior phases close.

## Owner

ZCode (GLM)

## Branch / Worktree

Local `main` (baseline `fd356375`) carrying the restored phase WIP, uncommitted.

## Work Log

### 2026-10-04 — Planning initialized

- Phase packet created.
- No implementation work has started.

### 2026-10-05 — Phase claimed; security/state reviews (ZCode/GLM)

- P09-08 Team Bot authorization/isolation: member-scoped list, foreign-membership open refusal, and per-user instance uniqueness are pinned by `apps/api/src/team-bots.test.ts`. No cross-user write path exists — all project/draft handlers scope by `spaceId`+`userId` (see `apps/api/src/projects.test.ts`).
- P09-09 template redaction: `export.template` builds the manifest from a literal whitelist; an exact-key test proves credentials/history/computer state cannot appear (`team-bots.test.ts`).
- P09-10 connector/credential boundaries: unchanged upstream isolation (secrets stay in bot-scoped secret stores; connector tools require a connection). The X toolkit rides the same path with no first-party credentials.
- P09-11 approvals for draft/X/proactive actions: draft submit is a normal user turn; connector write tools default to approval via `toolRequiresApproval`; proactive check-ins are normal runs. No new bypass paths were added.
- P09-15 realtime review: the WIP adds no new subscriptions. The Tasks panel refetches on run-status transitions only (rare, no timers); deep-link effects write URL params without network calls.
- P09-16 states review: loading/empty/error states exist for Tasks (loading row, empty state, catch-to-empty), Library (loading/error/empty), Routines (empty), draft cards (submit error), mobile voice memos (play failure).
- P09-18 upstream check: `git merge-tree` of upstream `main` (`01b5cd6b`) into the planning docs commit merges clean; product-code conflict hotspots will be assessed when each phase's WIP lands.
- CI findings: the dispatched `mobile-android-screenshots` run on the clean baseline failed on an upstream Maestro assertion (`assertVisible: "React"` after long-press in `screenshots.yaml`) followed by a post-shutdown pool-end noise; re-dispatched once to separate flake from reproducible. Tracked under P00-10.

## Files / Modules Changed

- None (review-only phase pass; findings recorded here and in phase handoffs).

## Verification Run

| Suite | Command | Result |
|---|---|---|
| Typecheck | `pnpm check` | 22/22 tasks pass (2026-10-05, current tree) |
| Lint | `pnpm lint` | 0 errors; 19 warnings + 4 infos (pre-existing baseline) |
| Unit | `pnpm test` | 5829 passed / 6 failed / 174 skipped (2026-10-05, pre-phase-03..08 additions; the additions since ran as targeted suites — projects 7/7, team-bots 3/3, library 2/2, main-bot 2/2, contracts+core attachments 8/8, DraftActionCard 4/4) |
| Full suites | integration / web E2E / desktop / mobile | pending CI runs after push |

## Decisions Made During Phase

- Suite gates are left unchecked until they run against the final committed state; code-level reviews are recorded now so the remaining work is purely execution.

## Blockers

- All suite gates (P09-01…P05) need the WIP committed/pushed and CI green.
- P09-22 requires every prior phase DONE; P09-23 requires maintainer release-candidate approval.

## Discovered Follow-ups

- Upstream Maestro flow `screenshots.yaml` long-press action assertion is flaky/failing on the clean baseline — fix belongs to the mobile screenshots flow (upstream).

## Next Recommended Task

1. Commit and push the phase work in phase-scoped commits; let CI run the full suites; close phase screenshot tasks (P01-15, P02-18, P03-17, P04-19, P05-23, P06-16, P07-18, P08-17).
2. Close remaining mobile screens (P08-05/07/08/09), then re-run the full suites (P09-01…05), migration/fresh-install checks (P09-06/07), docs (P09-19/20), and the final audit (P09-22) before requesting release-candidate approval (P09-23).

## Final Summary

Not complete — blocked on pending CI suites, prior-phase closures, and release approval.
