# Phase 31 Handoff — M4 Release & Upstream Gate

## Current Status

DOING — 2026-10-12 (Claude Code, Sonnet 5.5). M4 is implemented on a local branch and verified locally; it is not approved and has not run in CI.

## Branch / commits

`m4-execution` (local, not pushed), from `main` @ `ca1dc816`: Phase 24 `57c6a012`, 25 `c3d45212`, 26 `e377fc78`, 27 `dcb836c4`, 28 `53bde3a2`, 29 `53c34f6e`, 30 `6ebef40b`, review fixes `635bfb6c`, plus this phase's documentation commit.

## Recorded results (local host, Docker Postgres 16 and Chromium; no CI)

- **Lint** `pnpm exec biome check .`: 0 errors, 20 warnings, 4 infos (pre-existing warnings).
- **Typecheck** `pnpm exec turbo check --continue`: 21 of 22 tasks pass. `@rakazo/mobile#check` fails only in its `expo install --check` step (installed Expo patch versions differ from `package.json`); `tsc --noEmit` for mobile exits 0.
- **Unit** `pnpm test` at `635bfb6c`: 488 files passed, 4 failed; 5984 tests passed, 6 failed. Failures: `computer-idle` (3), `desktop-runtime` (1), supervisor `browser-profile` (1), `computer-recording` (1) — the host-dependent process/computer suites listed in the Phase 23 audit (`computer-recording` passes in isolation there). Not re-run on baseline in this phase.
- **Integration** (each harness suite run on its own database cloned from a freshly migrated template, because the stock harness stops at the first failure): 19 of 23 suites pass, including the new `migration-upgrade`, `project-control`, `project-orchestration` (10) and `presentation-artifacts` suites. The 4 failures (`pi-offline`, `computer-approval`, `eval-history` 1 of 2, `eval-customer-support`) all stop at `Expected a model POST request` in `model-emulator.ts`, the signature the Phase 23 audit recorded as failing on a clean baseline. Not re-run on baseline here.
- **Web e2e**, full suite, harness: main tree at `6ebef40b` 215 passed, 10 failed, 3 not run; a clean checkout (no root `.env`) at the same commit 222 passed, 5 failed, 1 not run. Failures classified by rerunning alone and on the baseline commit in clean checkouts:
  - fail on baseline as well: `message-jump`, `message-hover-actions` (reply preview jumps), `golden` (sign-in, spawn, stop), `parity/composer-states` ("composer with text" screenshot) — the last two pass in the main tree and fail in a clean checkout for baseline and M4 alike (environment-dependent).
  - pass alone / environment: `screen-proxy-isolation` (6; passes 8/8 in a clean checkout on baseline and M4, fails in the main tree, which has a local `.env`), `group-chats`, `resizable-side-panel`, `message-quote` (flaky under full-suite load).
  - None of the observed failures was attributable to M4. After the review fixes at `635bfb6c`, the draft, deck, palette and slash specs (9 tests) passed again in the main tree.
- **Security review**: an independent read-only review of the M4 diff found, and `635bfb6c` fixed: `updateDraftAction` could mark a draft submitted without validation (now refused), non-atomic draft writes (now compare-and-set), the email-binding check ignoring unparseable addresses and unapproved arguments such as attachments (now deny-by-default), nested Slack tokens bypassing the mention rules (now neutralized), control characters breaking exported deck XML (now stripped). Remaining accepted limits: the binding covers connector email tools only (not browser/shell routes); reply/forward tools without a `subject` argument fail closed; a retried `presentation_save` adds another version; draft ids are executor-generated, so cross-card nonce collisions were not treated as exploitable.

## Upstream merge surface (dry run, nothing merged)

Fork 50 ahead, upstream 146 ahead. 37 predicted conflicts: `apps/api/src/router.ts`; mobile `app/{bot-settings,index,_layout,routine,thread}.tsx`, `lib/voice.ts`, `lib/locales/{de,ru,zh}.ts`; `apps/web/e2e/activity-list.spec.ts`; web `AccountSettingsOverlay.tsx`, `RoutineEditor.tsx`, `Shell.tsx`; `CHANGELOG.md`; `packages/adapters/src/executor.ts`; `packages/contracts/src/{domain,rpc,runs}.ts`; `packages/core/src/{attachments,attachments.test,cron,index,run-state}.ts`; `packages/db/prisma/schema.prisma`, `packages/db/src/repos.ts`; `packages/testkit/src/cli/harness.ts`; and 10 web `messages.po`. M4 added to these: `router.ts`, `Shell.tsx`, `RoutineEditor.tsx`, `AccountSettingsOverlay.tsx`, `executor.ts`, `rpc.ts`, `attachments.ts`, `core/index.ts`, `harness.ts`, mobile `thread.tsx`/`voice.ts`/locales, `CHANGELOG.md`. New logic is in new files where possible.

## What only the maintainer, CI or a device can close

1. Push the branch so CI runs the full pipeline and the Electron virtual-display e2e; compare against the failures listed above.
2. Device/simulator runs for mobile (voice transcript follow-along, project card navigation, deck card) and the Maestro flows.
3. Open an exported `.pptx` in PowerPoint, Keynote and Google Slides (only structural validation was possible here).
4. Real Gmail/Composio and real Slack runs for the email binding and the Slack mention policy (offline emulators and mocks only so far).
5. Accessibility and performance audits for the new UI.
6. Maintainer experience approval (P31-08) and the M3 Phase 23 gate, which this work did not close.

## Decisions to make

- Whether to split `m4-execution` into one PR per phase (recommended; Phases 25, 26, 27, 28 are independent apart from shared files) and in what order relative to the upstream merge.
- Whether to keep `pptxgenjs` as a runtime dependency of `packages/adapters`.
- Provider-dependent items left out (Gmail send-as, Spam, Google Slides): which connector capability should carry them.
