# Phase 09 Handoff — Hardening & Release

## Current Status

DOING — P09-01…P09-22 all pass; only P09-23 (release-candidate approval) open. Green full-pipeline CI run 37322886544 closes the suite gates.

## Owner

ZCode (GLM)

## Branch / Worktree

`phase/00-bootstrap` @ origin (hehenugas) — pushed through `19af7588`.

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

### 2026-10-05 — Migration gate verified; CI triage (ZCode/GLM)

- **P09-06 migration from a representative upstream database** — verified end-to-end on a throwaway Postgres 16: (1) built the database from the baseline commit's (`fd356375`) migrations only (91 upstream migrations); (2) seeded representative rows via SQL (organization, space, user, bot, thread, message with a pre-migration block); (3) ran the fork's `prisma migrate deploy` — exactly the three fork migrations applied (`20261004211000_space_main_bot`, `20261004212500_team_bots`, `20261004214000_projects`); (4) re-read every seeded row through the fork's client — all intact; (5) wrote through the new surfaces (TeamBot + owner member, Project, `spaces.mainBotId`). No data loss, no manual SQL needed by the migration itself.
- **P09-01 full suite** on the pushed tree: `turbo check` 22/22, `biome check .` 0 errors (19 warnings + 4 infos pre-existing), unit 5849 passed / 6 failed / 174 skipped — the 6 are the documented baseline failures (environment-dependent upstream tests), unchanged in identity.
- **Web E2E triage** (first CI run of the shell work): the Playwright job timed out at 20 min with 23 visible failures — the phase 01 shell changes are intentional (Connect apps rename, on-demand sidebar search, details-hub pill, header computer toggle, Hidden Bots section, centered column), so upstream specs asserting the old affordances were adapted (helpers `openBotSettings`/`openSidebarSearch`/`openSideComputerPanel`; peer-chip geometry now measures the centered content column). Two real test bugs fixed (ambiguous draft-card input locator; archived-section label). Job cap raised to 35 min for the grown suite. CI re-run + local re-run in flight.
- **Mobile screenshots CI**: launch ANR needed an app relaunch (fix in `screenshots.yaml`), the Main bot row required a scroll for the Advanced section, and the S3 gallery publish needed a fork-safe skip when secrets are absent. After the first two fixes the Maestro flow captured all 35 screenshots + notification video.

### 2026-10-05 — Full pipeline green; suites closed; audit done (ZCode/GLM)

- Push triggers on the fork were dead after the account transfer, so `ci.yml` gained a `workflow_dispatch` trigger and the pipeline is driven on demand (commit `32f1f808`).
- The 9 CI-found web e2e regressions from the shell adaptation were fixed on `main` (commits `49b1af66`, `d6646ab9`, `ade0dbfc`): the stale `?panel=` deep link clobbering pre-bootstrap panel clicks, the routines panel serving a stale list on open, the stale Korean "Agent computer" locator, and shell-renamed labels (`Connect apps`, `Close apps`, details-hub settings entry). The Composio emulator catalog unit test now counts the phase 07 X pack.
- Green full-pipeline run [`37322886544`](https://github.com/hehenugas/rakazo/actions/runs/37322886544): lint, typecheck, production builds incl. the Electron desktop smoke, unit tests, Postgres integration, web e2e 182/182. P09-02…P09-05 and P09-07 close on it.
- Named captures from the run report were harvested and curated per phase under `.planning/evidence/phase-0{1..7}-*/`, and the desktop smoke screenshots under `.planning/evidence/phase-09-hardening/` — P09-17.
- P09-22 audit: phases 00-08 have zero unchecked checklist items and DONE status in CHECKLIST/HANDOFF; STATE and ROADMAP tables synced.
- Remaining: P09-23 only — marking M1 complete awaits the maintainer's release-candidate approval.

## Files / Modules Changed

- `.github/workflows/playwright.yml` — job timeout 20→35 min.
- `.github/workflows/mobile-android-screenshots.yml` — gallery publish skips without S3 credentials.
- `apps/web/e2e/helpers.ts` — `openBotSettings`, `openSidebarSearch`, `openSideComputerPanel` helpers.
- 14 upstream e2e specs adapted to the intentional shell changes (see work log).
- `apps/mobile/.maestro/screenshots.yaml` — ANR relaunch + Advanced-section scroll.

## Verification Run

| Suite | Command | Result |
|---|---|---|
| Typecheck | `pnpm check` | 22/22 tasks pass (2026-10-05, pushed tree) |
| Lint | `pnpm lint` | 0 errors; 19 warnings + 4 infos (pre-existing baseline) |
| Unit | `pnpm test` | 5849 passed / 6 failed / 174 skipped (2026-10-05) — failures are the documented baseline set |
| Migration | baseline DB → fork `migrate deploy` | 3 migrations, data intact, new tables writable (2026-10-05, P09-06) |
| Web E2E | CI `Web E2E` job | 182 passed / 0 failed (run 37322886544, 2026-10-05) |
| Desktop E2E | CI `Production builds` Electron smoke | green on virtual display (run 37322886544); setup screenshots curated under `.planning/evidence/phase-09-hardening/` |
| Mobile | CI unit job (`apps/mobile/lib` vitest) + phase 08 capture run | unit green (run 37322886544); screenshots green in capture run 37268854174 |

## Decisions Made During Phase

- Suite gates are left unchecked until they run against the final committed state; code-level reviews are recorded now so the remaining work is purely execution.
- Upstream e2e specs are adapted (not weakened) to the intentional parity-shell changes: each edit points at the replacement affordance or measures the centered column rather than dropping assertions.
- The S3 gallery publish is upstream convenience infrastructure; a fork without those secrets should not fail a fully green capture run.

## Blockers

- None — only P09-23 (release-candidate approval) remains, which is the maintainer's decision.
- P09-22 requires every prior phase DONE; P09-23 requires maintainer release-candidate approval.

## Discovered Follow-ups

- None new.

## Next Recommended Task

1. Maintainer reviews the release evidence (`.planning/STATE.md` → Release Evidence) and grants the release-candidate approval.
2. Check P09-23 + the VERIFY/DONE block, flip phase 09 to DONE, and close M1.

## Final Summary

Complete except P09-23 — every hardening task and verification item that does not require the maintainer's release-candidate approval passes (green run 37322886544); M1 completion is one approval away.
