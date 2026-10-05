# Phase 00 Handoff — Bootstrap & Baseline

## Current Status

DOING — all tasks verified except P00-10 (mobile screenshots), which is dispatched to the CI `mobile-android-screenshots` workflow and pending artifacts. The stashed phase WIP has been restored to the working tree and verified (2026-10-05, see Work Log).

## Owner

ZCode (GLM)

## Branch / Worktree

`main` @ `fd3563756315da7c593ed49ee5e63d45a4005f8a` + Phase 00 docs commits. Pushed to `origin/main` (`https://github.com/Aorus22/rakazo.git`).

## Work Log

### 2026-10-04 — Planning initialized

- Phase packet created.
- No implementation work has started.

### 2026-10-04 — Baseline established (ZCode/GLM)

- Configured remotes: created the GitHub fork `Aorus22/rakazo` with `gh repo fork elie222/rakazo --clone=false`, added it as `origin`, verified both remotes with fetch dry-runs. Upstream `main` has advanced to `01b5cd6b`; the fork baseline intentionally stays at `fd3563756315da7c593ed49ee5e63d45a4005f8a`.
- Installed dependencies with `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 pnpm install --frozen-lockfile` (pnpm 9.15.0, node 22.23.1) — exit 0.
- Revalidated `.planning/REFERENCES.md` against the checked-out code: all 9 capability claims and all 17 file paths confirmed; annotations added to both sections of that file.
- Baseline verification on the clean tree (uncommitted fork WIP was stashed during verification and restored afterwards — see "Pre-existing uncommitted WIP" below):
  - Lint (`pnpm lint`, biome): exit 0; 19 warnings + 4 infos, all pre-existing.
  - Typecheck (`pnpm check` via turbo): 22/22 tasks successful.
  - Unit tests (`pnpm test`): 5828 passed / 6 failed / 174 skipped; failures listed below.
  - E2E web (`pnpm test:e2e`, 3 full runs): 158–160 passed; the same 5 `screen-proxy-isolation.spec.ts` failures every run plus 1–2 timing flakes per run (`resizable-side-panel.spec.ts` resize assertion, `team-computer.spec.ts:128`). Durations ≈ 9.3 min.
  - Integration (`pnpm test:integration`): 1 pre-existing failure in `packages/testkit/src/pi-offline.postgres.test.ts`.
  - Desktop e2e: not run locally per repository instructions (opens real Electron windows; CI runs it). Mobile: no Maestro/Android emulator locally; the CI `mobile-android-screenshots` workflow (workflow_dispatch) was dispatched on the pushed baseline instead.
- Captured baseline web screenshots: ran the full web e2e on the clean tree and harvested 308 uniquely-named `captureScreenshot` PNGs from the Playwright HTML report (embedded base64 report → `report.json` → attachment mapping). A curated set covering the screens this phase requires lives in `.planning/evidence/phase-00/`.
- Added the "Fork planning workflow" section to `AGENTS.md` (P00-12). `CLAUDE.md` imports `AGENTS.md`, so the instruction reaches Claude-family agents too.

### 2026-10-05 — Phase WIP restored and verified (ZCode/GLM)

- Applied the stashed WIP (`stash@{0}` "phase-wip: projects/team-bots/main-bot/draft-actions/voice-memo") back to the working tree with `git stash apply` (stash kept as backup until the work is landed). 16 tracked files + 6 untracked files (3 UI components, 3 additive migrations) restored cleanly.
- Regenerated the Prisma client (`pnpm db:generate`) for the new `Space.mainBotId`, `TeamBot`/`TeamBotMember`, `Project`/`Task.projectId` schema.
- Fixed three small issues found by verification (details under "Files / Modules Changed"):
  - typecheck: `attachWorkspaceFileToThread` return type now accepts the new `voice_memo` message block.
  - lint: formatted the WIP files, fixed import order, replaced a label-wrapping-custom-input pattern with explicit `htmlFor`/`id` (a11y), and used an optional chain in the voice-memo send handler. Lint is back to the pre-existing baseline: 0 errors, 19 warnings + 4 infos.
  - guard test: `apps/web/src/lib/desktop.test.ts` asserted the old conversation-header markup; the WIP intentionally redesigns that header (centered absolute pill), so the guard was updated to the new markup while keeping its intent (drag region stays a drag region, controls stay non-drag).
- Verification after restoration: typecheck 22/22 pass; unit tests 5829 passed / 6 failed / 174 skipped — 5 are the stable baseline failures and 1 rotates between the environment-sensitive computer replay/recording tests across runs (passed when run in isolation). Web e2e run dispatched on the restored tree; result recorded below when finished.
- The WIP still belongs to phases 02/04/05/06/07 and is not part of the Phase 00 baseline evidence; it is uncommitted in the working tree awaiting phase-claimed landing.
- Code review of the restored WIP (2026-10-05, read-through of contracts, router, executor tools, and UI wiring): no blockers. All changes additive and consistent with the repo's contracts → router → executor → UI layering; every new RPC handler is scoped by `spaceId`/`userId` (or `resolveThreadTarget`/`repos.getBot`), `teamBots.open` handles the per-user-instance uniqueness race via the P2002 fallback, and `updateDraftAction` re-parses message blocks through the zod schema before mutating. Non-blocking observations for the owning phases:
  - `threads.updateDraftAction` accepts any status transition; the UI gates edit-after-submit, but the owning phase (04/05) may want a server-side guard.
  - `VoiceMemoCard` loads the whole artifact as a base64 data URL; acceptable while the 10 MiB attachment cap holds.
  - `teamBots.create` falls back to `description` when `instructions` is empty — intentional convenience, confirm during Phase 05.

## Files / Modules Changed

- `AGENTS.md` — added the fork planning-workflow instructions (P00-12).
- `.planning/**` — planning docs, checklist/handoff/state updates, REFERENCES revalidation annotations, baseline evidence screenshots.
- Phase WIP (restored 2026-10-05, uncommitted): schema/migrations, contracts, RPC, executor tools, attachments, shell UI as listed under "Pre-existing uncommitted WIP" below, plus these restoration fixes:
  - `packages/adapters/src/thread-artifacts.ts` — return type widened to include the `voice_memo` block kind.
  - `apps/web/src/components/DraftActionCard.tsx` — form fields now use `label htmlFor` + `id` instead of wrapping custom inputs.
  - `apps/web/src/pages/Shell.tsx` — optional chain in the voice-memo mime check; formatting.
  - `apps/web/src/lib/desktop.test.ts` — guard updated to the redesigned conversation-header markup.
  - WIP files formatted and import-ordered via biome (executor, contracts, router, bot-panel, builtin-tools, right-panel-state, attachments, VoiceMemo components).
- No other product code changed in this phase.

## Verification Run

| Suite | Command | Result |
|---|---|---|
| Lint | `pnpm lint` | 0 errors; 19 warnings + 4 infos (pre-existing) |
| Typecheck | `pnpm check` | 22/22 tasks pass |
| Unit | `pnpm test` | 5828 passed / 6 failed / 174 skipped |
| E2E web | `pnpm test:e2e` | 158–160 passed / 5 stable failures + occasional timing flakes |
| Integration | `pnpm test:integration` | 1 failure (see below) |
| Desktop e2e | CI `desktop-macos-screenshot` / virtual-display jobs | delegated to CI per repo instructions |
| Mobile | CI `mobile-android-screenshots` (workflow_dispatch) | dispatched; artifacts pending |
| E2E web (post-WIP) | `pnpm test:e2e` | skipped on this host by maintainer instruction ("no need for tests, focus on the code"); typecheck/lint/unit cover the WIP wiring; CI will arbitrate |

## Known baseline failures (upstream `fd356375`, this Linux host — not fork regressions)

- Unit (6, stable across runs):
  - `packages/adapters/src/computer-idle.test.ts` — 3 failures in "background work launch and probe" (spawnSync returns `status: null`).
  - `packages/testkit/src/computer-recording.test.ts` — "replays the captured Luna/OpenRouter + Docker export…" (depends on recorded Docker artifacts).
  - `infra/sandboxes/supervisor/src/browser-profile.test.ts` — spawnSync `status: null` (Chromium quiesce scripts need a desktop session).
  - `packages/core/src/node/desktop-runtime.test.ts` — "quiesces the debugger-owning Chromium process…" (same class; needs a desktop session).
- E2E web (stable across all 3 runs):
  - 5 failures in `apps/web/e2e/screen-proxy-isolation.spec.ts` — first failure was `EMFILE: too many open files` from the vite dev-server file watcher on this host; with a raised fd limit the same spec fails on `SyntaxError: Unexpected end of JSON input` at the spec's own local helper server (`spec.ts:118`), i.e. an empty request body race. 3 of 8 tests in the spec pass. Environment-sensitive; confirm on CI.
- E2E web (flaky, passed in at least one run): `resizable-side-panel.spec.ts` (panel width assertion 384 vs >600), `team-computer.spec.ts:128`.
- Integration: `packages/testkit/src/pi-offline.postgres.test.ts` — "Expected a model POST request: 'HEAD' !== 'POST'" (something on this host probes the emulator with HEAD before the POST arrives).

## Evidence / Screenshots

- `.planning/evidence/phase-00/01-sign-up.png` — auth screen
- `.planning/evidence/phase-00/07-durable-bot-work.png` — conversation with durable bot work
- `.planning/evidence/phase-00/10-routine-created.png` — routine created (Routines surface)
- `.planning/evidence/phase-00/11-plugins-catalog.png` — integrations/plugins catalog
- `.planning/evidence/phase-00/12-bot-settings.png` — Bot settings
- `.planning/evidence/phase-00/13-spawned-bot.png` — spawned bot (sidebar roster)
- `.planning/evidence/phase-00/14-active-bot-work.png` — active bot work (activity/attention)
- `.planning/evidence/phase-00/14-active-bot-work-mobile.png` — mobile-viewport activity
- `.planning/evidence/phase-00/16-bot-context-menu.png` — bot context menu
- `.planning/evidence/phase-00/27b-computer-panel.png` — computer panel
- Full set (308 named PNGs, untracked): `/tmp/baseline-shots/` (re-harvestable from a fresh `pnpm test:e2e` run's HTML report). CI mobile artifacts: `gh workflow run mobile-android-screenshots` on `main`, then `gh run download`.

## Pre-existing uncommitted WIP

The working tree contains ~2.6k lines of uncommitted fork work from a previous session (stash "phase-wip: projects/team-bots/main-bot/draft-actions/voice-memo", re-applied on 2026-10-05 and verified — see Work Log). It spans later-phase features and is additive: `Space.mainBotId`, `TeamBot`/`TeamBotMember` + per-user `Bot` instances, `Project` + `Task.projectId` (schema + 3 additive migrations), contracts for team bots/projects/draft actions/voice memos/Bot template manifest, RPC handlers, agent tools (`draft_action_create`, `project_create`, `project_task_add`, `project_update`) with executor wiring, audio attachment support, `DraftActionCard`/`VoiceMemo*` components, and shell/panel UI work. It must be split and landed under the owning phases (02, 04, 05, 06, 07) — it does not belong to Phase 00 and is NOT part of the baseline evidence above.

## Decisions Made During Phase

- Baseline commit stays `fd356375…` even though upstream `main` advanced to `01b5cd6b`; upstream sync is a later-phase concern.
- Desktop baseline evidence = web screenshots (Electron hosts the web UI) + CI desktop workflow for the native setup window; documented instead of running Electron e2e locally.
- Mobile baseline evidence delegated to the CI `mobile-android-screenshots` workflow rather than installing Maestro + an Android emulator locally.
- D-008 interpretation in the WIP (noted for Phase 05): `TeamBot` definition table + per-user `Bot` instance (`@@unique([teamBotId, userId])`) — the "separate definition + actor-scoped instances" option of pending decision P-001.

## Blockers

None — P00-10 closed on 2026-10-05.

## Discovered Follow-ups

- The fork's Playwright browser cache must be reachable at `$HOME/.cache/ms-playwright`; in sandboxed shells where `HOME` differs, symlink the browsers (done locally on the verification host).
- `screen-proxy-isolation.spec.ts` locally fails in a way CI will arbitrate; if CI is green, add a note that this spec is host-sensitive.

## Next Recommended Task

Phase 00 is DONE; follow the roadmap's phase order.

## Final Summary

**DONE (2026-10-05).** Baseline `fd356375` recorded; web/desktop baseline screenshots under `.planning/evidence/phase-00/`; mobile baseline matrix captured by the green CI run [37268854174](https://github.com/hehenugas/rakazo/actions/runs/37268854174) (35 screenshots + notification video, curated under `.planning/evidence/phase-08-mobile/`). Baseline failures documented and unchanged since. The fork now lives at `hehenugas/rakazo` (origin moved per the maintainer); the pre-existing WIP referenced above has since landed as phase commits on `phase/00-bootstrap`.
