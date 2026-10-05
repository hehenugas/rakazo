# Phase 00 Checklist — Bootstrap & Baseline

## Status

**DOING — ZCode (GLM)**

## Tasks

- [x] P00-01 Initialize the Rakazo fork in this directory and record exact upstream commit (`fd3563756315da7c593ed49ee5e63d45a4005f8a`).
- [x] P00-02 Configure and verify `origin` and `upstream` remotes. (origin = `https://github.com/Aorus22/rakazo.git`, created via `gh repo fork`; both remotes verified with a successful fetch dry-run. Upstream `main` has advanced to `01b5cd6b` — baseline stays `fd356375`.)
- [x] P00-03 Read and summarize repository `AGENTS.md`/contributor constraints relevant to agents.
- [x] P00-04 Install dependencies using the upstream-supported package manager/workflow. (`COREPACK_ENABLE_DOWNLOAD_PROMPT=0 pnpm install --frozen-lockfile`, exit 0, pnpm 9.15.0 / node 22.23.1)
- [x] P00-05 Record monorepo package/app boundaries relevant to web, API, worker, desktop, mobile, contracts, DB, core, adapters, UI.
- [x] P00-06 Revalidate the known-capability list in `.planning/REFERENCES.md` against checked-out code. (All 9 capabilities and all 17 listed paths confirmed; annotations added to REFERENCES.md.)
- [x] P00-07 Run baseline lint/typecheck/unit tests and record results. (lint: 0 errors, 19 warnings + 4 infos pre-existing; `turbo check`: 22/22 tasks pass; unit: 5828 passed / 6 failed / 174 skipped — the 6 are environment-dependent upstream failures, see HANDOFF.)
- [x] P00-08 Run feasible integration/E2E baseline tests and record results separately from unit tests. (E2E web: 3 full runs — stable result 158–160 passed with the same 5 `screen-proxy-isolation` failures (environment) plus 1–2 timing flakes (`resizable-side-panel`, `team-computer`); integration: 1 pre-existing failure in `pi-offline.postgres.test.ts` (model emulator receives HEAD instead of POST on this host). Desktop e2e and mobile screenshots delegated to their CI workflows per repo instructions.)
- [x] P00-09 Capture baseline web/desktop screenshots for sidebar, conversation, Bot settings, Routines, integrations, search, computer. (308 named screenshots harvested from the Playwright HTML report of the clean-tree run; curated set committed under `.planning/evidence/phase-00/`. Desktop = web UI hosted in Electron; desktop setup window covered by the CI `desktop-macos-screenshot` workflow.)
- [ ] P00-10 Capture baseline mobile screenshots for primary flows. (BLOCKED locally — no Maestro CLI/Android emulator on this machine. Unblocked by dispatching the CI `mobile-android-screenshots` workflow on the pushed baseline; artifacts will be attached to HANDOFF when the run finishes.)
- [x] P00-11 Document known upstream failures/flakes so they are not attributed to parity changes. (See HANDOFF "Known baseline failures".)
- [x] P00-12 Add/verify project-local instructions telling coding agents to read `.planning/` before phase work. (AGENTS.md gained a "Fork planning workflow" section; CLAUDE.md imports AGENTS.md.)
- [x] P00-13 Update `STATE.md` with exact baseline commit and Phase 00 result.
- [x] P00-14 Final verification: fresh agent can understand setup and baseline without chat history. (HANDOFF.md contains setup commands, baseline numbers, evidence locations, and the exact next task.)


## Phase Verification

- [ ] VERIFY-01 All mandatory tasks above are checked. (P00-10 pending CI artifacts.)
- [ ] VERIFY-02 Relevant tests pass or approved pre-existing failures are documented. (All failures documented in HANDOFF; none are fork regressions — the fork has not changed product code.)
- [ ] VERIFY-03 No unresolved P0/P1 regression remains.
- [ ] VERIFY-04 HANDOFF.md contains final implementation and verification summary.
- [ ] VERIFY-05 STATE.md is updated.

## DONE

- [ ] Phase marked **DONE** only after all verification items pass.
