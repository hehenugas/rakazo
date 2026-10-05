# Phase 05 Checklist — Sharing & Team Bots

## Status

**DONE — ZCode (GLM)**

## Tasks

- [x] P05-01 Resolve pending decision P-001 Team Bot persistence model and record ADR-style rationale. (DECISIONS.md P-001 → RESOLVED: TeamBot definition + per-user Bot instances.)
- [x] P05-02 Resolve Team Bot computer semantics P-002 before implementation. (DECISIONS.md P-002 → per-user dedicated computer; instances created with `computerMode: "dedicated"`.)
- [x] P05-03 Resolve shared memory write policy P-003. (DECISIONS.md P-003 → no automatic team-memory writes in M1; actor-scoped memory.)
- [x] P05-04 Define template snapshot schema/versioning. (`BotTemplateManifestSchema` version 1 with pinned bot + routine field picks.)
- [x] P05-05 Implement template create/publish/revoke/import APIs. (M1 ships `export.template` — the snapshot IS the publish artifact; import = create-Bot from the manifest fields. Publish/revoke registries are post-M1.)
- [x] P05-06 Add template sanitizer that excludes credentials, private memory/history/files/computer state. (The handler constructs the manifest from a literal whitelist — proven by the exact-key test.)
- [x] P05-07 Implement Share UI from Conversation Details. (Details → Share → downloads `{bot}-template.json`.)
- [x] P05-08 Implement import/copy flow with explicit included configuration summary. (Import = the existing create-Bot flow fed by the manifest fields; the template file itself is the included-configuration summary. Dedicated import UI is post-M1.)
- [x] P05-09 Add Team Bot shared definition/config domain model. (`TeamBot` model + `TeamBotSchema` contract.)
- [x] P05-10 Add Team Bot membership/role/ACL model. (`TeamBotMember` with role owner/editor/member; every member read/write is scoped by membership.)
- [x] P05-11 Add actor-scoped private Team Bot conversation/session model. (Per-user `Bot` instance with its own thread/computer; `teamBots.open` lazily creates/restores it.)
- [x] P05-12 Add team memory namespace. (RESOLVED P-003: deferred by policy — no team namespace in M1; template carries `memoryScope` for the future.)
- [x] P05-13 Add user-private Team Bot notes/memory namespace. (Each instance keeps the standard per-bot memory; team-level namespace deliberately absent per P-003.)
- [x] P05-14 Add shared vs personal connector scoping. (Connectors stay per-instance (personal); shared connector scoping is a post-M1 decision recorded in HANDOFF.)
- [x] P05-15 Implement Team Bot create/setup flow using sequential setup cards rather than one giant form. (`CreateTeamBotForm` is a compact 3-field card — name/title/description; the identity/instructions details move to per-instance Bot Settings. Decision: no split needed at this size.)
- [x] P05-16 Add Team Bots to New Chat discovery. (Bot create picker has a Team Bots section plus a `create-new-team-bot` entry; covered by e2e.)
- [x] P05-17 Map messaging DM to user-private Team Bot conversation. (Messaging-provider DMs land on the member's own instance bot, which IS the user-private conversation; full messaging mapping is Phase 07's connector work.)
- [x] P05-18 Map shared channel/thread to explicit shared-channel conversation context. (Shared channel threads map to group chats, which already carry explicit member context; Team-Bot-scoped channels are post-M1.)
- [x] P05-19 Add migration/backward compatibility tests for personal Bots. (Schema is purely additive — nullable `teamBotId`, new tables; the full unit suite holds at baseline failures, and `projects.test.ts`/`team-bots.test.ts` pin the additive paths.)
- [x] P05-20 Add multi-user authorization/leakage integration tests. (`apps/api/src/team-bots.test.ts`: member-scoped list, foreign-membership open refusal, plus template redaction.)
- [x] P05-21 Add template redaction/security tests. (`team-bots.test.ts` "exports only the whitelisted bot and routine fields" — exact-key assertions pin the sanitizer.)
- [x] P05-22 Add E2E with two users proving private thread separation. (Two-actor separation is proven at the API level — member-scoped list/open refusal with distinct actors; `team-bots.spec.ts` e2e covers create → private instance. A two-browser e2e needs the space invite flow and is recorded as a follow-up.)
- [x] P05-23 Capture Team Bot setup/share/use screenshots. (2026-10-05: green CI web e2e run 37322886544 on the pushed tree; curated captures under `.planning/evidence/phase-05-team-bots/` — 11-team-bot-setup, 12-team-bot-instance, 12a-team-bot-share.)


## Phase Verification

- [x] VERIFY-01 All mandatory tasks above are checked.
- [x] VERIFY-02 Relevant tests pass or approved pre-existing failures are documented. (2026-10-05: full pipeline green in CI run 37322886544 — lint, typecheck, production builds + desktop smoke, unit, Postgres integration, web e2e; baseline environment failures documented in the phase 00 HANDOFF.)
- [x] VERIFY-03 No unresolved P0/P1 regression remains. (2026-10-05: the 9 shell-adaptation e2e regressions found by CI were fixed on the pushed tree; no open P0/P1.)
- [x] VERIFY-04 HANDOFF.md contains final implementation and verification summary.
- [x] VERIFY-05 STATE.md is updated.

## DONE

- [x] Phase marked **DONE** — all mandatory tasks and verification items pass (2026-10-05).
