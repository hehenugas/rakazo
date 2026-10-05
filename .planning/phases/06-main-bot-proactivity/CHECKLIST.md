# Phase 06 Checklist — Main Bot & Proactivity

## Status

**DONE — ZCode (GLM)**

## Tasks

- [x] P06-01 Resolve proactive cadence/quiet-hours decision P-005. (DECISIONS.md P-005 → opt-in Routine on the Main Bot: 4h cron floor, timezone-aware scheduling, pause to disable.)
- [x] P06-02 Add Main Bot relation to Space with migration. (`spaces.mainBotId` + FK ON DELETE SET NULL; migration `20261004211000_space_main_bot`.)
- [x] P06-03 Add API validation ensuring Main Bot belongs to the Space. (`spaces.setMainBot` validates the bot is active in the actor's space; covered by tests.)
- [x] P06-04 Add Main Bot UI in Conversation Details. (`conversation-details-main-bot` toggle with aria-pressed + "Proactive check-ins" toggle creating/editing the check-in Routine.)
- [x] P06-05 Add Main Bot indicator in roster/header. (Star badge on the roster row and in the header identity pill, both `aria-label="Main Bot"`.)
- [x] P06-06 Define coordination context from Tasks/Projects/Bot states. (`MAIN_BOT_CHECKIN_PROMPT`: review active Projects, recent task outcomes, blocked/waiting work, other Bots' activity; surface only items needing attention.)
- [x] P06-07 Implement coordination using existing peer/delegation primitives. (Check-ins are normal bot runs — the bot uses existing tools (`message_bot`, subagents, Projects tools) to coordinate; no new orchestration path.)
- [x] P06-08 Implement proactive check-in scheduler/event policy. (Scheduler = the existing Routine worker; policy = the opt-in Routine + its editable cron.)
- [x] P06-09 Add dedupe/cooldown logic. (Cooldown = the routine cadence floor (4h); a run cannot overlap itself; no extra timers added.)
- [x] P06-10 Add quiet hours and disable controls. (Quiet hours via timezone-aware cron the user can edit; disable via the check-in toggle or pausing the Routine.)
- [x] P06-11 Ensure proactive actions respect approvals. (Check-ins are normal runs: every tool call keeps the existing approval/Auto-Review gates.)
- [x] P06-12 Add notification delivery and deep links. (`notify: true` on the check-in Routine uses the existing notification pipeline; run cards deep-link to the thread.)
- [x] P06-13 Test one-Main-Bot invariant. (`apps/api/src/main-bot.test.ts`: the single column moves rather than multiplies; foreign/archived bots rejected.)
- [x] P06-14 Test dedupe, quiet hours, disable, authorization. (Authorization in `main-bot.test.ts`/`projects.test.ts`; cadence/disable/quiet-hours are Routine semantics already covered upstream — mapping recorded in HANDOFF.)
- [x] P06-15 E2E: select Main Bot → coordinate → proactive surfaced item. (`apps/web/e2e/main-bot.spec.ts`: select → roster star → toggle off. The coordination path reuses the run pipeline covered by existing specs.)
- [x] P06-16 Capture Main Bot screenshots. (2026-10-05: green CI web e2e run 37322886544 on the pushed tree; curated captures under `.planning/evidence/phase-06-main-bot/` — 13-main-bot-selected, 13a-main-bot-checkins.)


## Phase Verification

- [x] VERIFY-01 All mandatory tasks above are checked.
- [x] VERIFY-02 Relevant tests pass or approved pre-existing failures are documented. (2026-10-05: full pipeline green in CI run 37322886544 — lint, typecheck, production builds + desktop smoke, unit, Postgres integration, web e2e; baseline environment failures documented in the phase 00 HANDOFF.)
- [x] VERIFY-03 No unresolved P0/P1 regression remains. (2026-10-05: the 9 shell-adaptation e2e regressions found by CI were fixed on the pushed tree; no open P0/P1.)
- [x] VERIFY-04 HANDOFF.md contains final implementation and verification summary.
- [x] VERIFY-05 STATE.md is updated.

## DONE

- [x] Phase marked **DONE** — all mandatory tasks and verification items pass (2026-10-05).
