# Phase 23 — Journey Audit and Evidence Index

Audit date: 2026-10-11 (Claude Code, Sonnet 5.5). Source of expectations: `../17-experience-parity-contract/JOURNEY-MATRIX.md`. Everything below was verified **locally and offline** on the uncommitted working tree; no CI run, no Electron run, no device run.

## Journey status

| # | Journey | Status | Evidence (web e2e unless noted) | Known remaining deltas |
|---|---|---|---|---|
| 1 | Create / open / edit / hide / share a Bot | Unchanged by M3 | `bot-crud`, `bot-organization`, full-suite green | P3 items from the matrix (entry parity, delete also removes routines) were not re-verified in M3 |
| 2 | Routines create / manage / test / pause / delete | Done (P18) | `routine-chat-journey`, `routine-crud` (6), `routine-execution` (5) green | Event-trigger runs without a routine id are absent from history; no long-absence pause ask |
| 3 | Team Bot publish lifecycle | Done (P19) | `team-bot-publish`, `team-bots` green; `team-bots.test.ts`, `routine-create.test.ts` | Mobile team-bot management is list/create/open only (P2) |
| 4 | Composer lists, add-to-prompt, send/stop | Done (P20) | `composer-delivery` (4), parity composer states green | — |
| 5 | Failed-message resend / delete | Done (P20) | `canonical-states` "failed send presentation", `composer-delivery` | — |
| 6 | Approvals and credential handoff | Done (P21) | `consequential-approval` (summary → full request → Deny/Allow once/Always), `project-orchestration` (delegated approval) | No password-manager integration exists, so none is offered |
| 7 | Connect apps discovery / sign-in / resume | Done (P21) | `app-connect-resume`, `golden`, `onboarding-conversation`, `graphql-integrations` | Timeout/error/reconnect branches audited, not e2e-covered |
| 8 | Voice memo transcript / seek | Done on web (P21) | `voice-memo` (3: highlight+seek, plain fallback); core/adapter unit tests | **Mobile**: no recording and no highlight/seek (P2). OpenAI transcription has no timing. Fish/ElevenLabs timing shapes only tested with mocked payloads |
| 9 | Project creation / delegation / status / stop | Done (P22) | `project-orchestration` (4), `project-orchestration.postgres.test.ts` (8), `project-control.postgres.test.ts` (3) | Same-bot child on a Team Computer can serialize behind the execution lease; cloud agents are not part of the stop cascade |
| 10 | Main Bot attention | Done (P22) | `project-orchestration` blocker test; integration dedupe + ownership tests; `main-bot` | Attention latency up to ~30 s (reconciler interval); project card progress not shown in the mobile thread |
| 11 | Desktop / mobile capability split | Partially verified | Mobile unit/i18n tests; mobile typecheck | No device or simulator run; Electron not run |

## Local verification summary

- **Typecheck:** contracts, core, db, adapter-kit, adapters, testkit, api, worker, web, mobile — clean.
- **Lint (`biome check .`):** 2 formatting errors in files untouched by M3 (`apps/api/src/team-bots.test.ts`, `apps/web/src/lib/thread-events.ts`, from phases 19–20) plus pre-existing warnings; all files changed in M3 are clean.
- **Unit (`vitest run`):** 5911 passed. Failures are computer/process-lifecycle suites that spawn shells/Chromium and time out on this host (`computer-idle`, `desktop-runtime`, supervisor browser-profile, `computer-replay`, `computer-recording`); `computer-idle` fails on a clean baseline too and `computer-recording` passes in isolation.
- **Integration (21 suites, throwaway Postgres):** 17 pass. `pi-offline`, `computer-approval`, `eval-history`, `eval-customer-support` fail ("Expected a model POST request"); all four fail identically on a clean baseline.
- **Web e2e (full suite, 210+ passed):** failures are `message-jump` (fails on a clean baseline), `message-quote` "selection spanning two messages" (flaky: failed 3 of 6 runs on a clean baseline), and `screen-proxy-isolation` (fails in setup in 0–16 ms; unrelated to M3, not re-checked on baseline).
- **Migrations:** all migrations apply from an empty database in the harness and the throwaway Postgres. The two M3 additions (`artifacts.transcript`, `projects.orchestratorRunId`) are nullable and additive; no upgrade-from-production-data test was run.
- **Security:** targeted review of this work found one cross-member issue in my own first draft (Main Bot attention could post into another member's thread), fixed with an integration test; an independent read-only review of the full diff found nothing above the reporting bar. Team Bot publication and Routine privacy rely on the Phase 18–19 tests, which pass.

## Upstream merge surface

`git fetch upstream` on 2026-10-11: upstream is 146 commits ahead, the fork 42. A dry-run `git merge-tree` of **committed** HEAD against `upstream/main` predicts 29 conflicting files: `apps/api/src/router.ts`, `packages/contracts/src/{domain,rpc}.ts`, `packages/db/prisma/schema.prisma`, `packages/db/src/repos.ts`, `packages/core/src/{cron.ts,attachments.test.ts}`, mobile `{bot-settings,index,_layout,routine,thread}.tsx` and locales, web `Shell.tsx`, `RoutineEditor.tsx`, all ten `messages.po`, `CHANGELOG.md`, and `apps/web/e2e/activity-list.spec.ts`. The uncommitted Phase 21–22 work edits several of the same files (`router.ts`, `Shell.tsx`, `domain.ts`, `rpc.ts`, `schema.prisma`, `thread.tsx`) and will add to those conflicts. Nothing was merged or resolved.

## Evidence index

- Screenshots from the e2e specs land in `test-report/` and `apps/web/test-results/`: `14-voice-memo-transcript-seek`, `60-app-connect-waiting`, `61-app-connect-resumed`, `70-project-delegated-completed`, `71-main-bot-attention`. They are for hierarchy review only.
- No M3 gate depends on pixel ratios or Grok screenshots: `PROJECT.md` P8, `EXPERIENCE-SPEC.md`, and the `VISUAL-DIFF.md` scope note keep the pixel gates as M2 regression tooling only.

## Not done here (needs the maintainer, CI, or a device)

Electron smoke/e2e (P23-18, and keyboard/navigation P23-09), mobile critical-flow tests on device (P23-19, P23-10), accessibility audits for web/Electron and mobile (P23-11, P23-12), measured performance review (P23-13), a green full CI pipeline (P23-17), and maintainer approval (P23-25).
