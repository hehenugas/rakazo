# Phase 18 Handoff — Routines & Scheduling Experience Parity

## Current Status

DONE — all 23 tasks and 5 verification items pass (2026-10-06).

## Owner

ZCode (GLM)

## Branch / Worktree

Local `main` (fork).

## Work Log

### 2026-10-06 — Phase implemented and verified (ZCode/GLM)

**Core (`packages/core`)**
- `CRON_FREQS` gained "Once" and "Yearly"; `cronFromPreset`/`presetFromCron` round-trip both; `formatCron("@once")` → "Once"; added `formatInstant(iso, timezone)` shared date formatting. Unit tests updated/extended.

**Contracts (`packages/contracts`)**
- `CreateRoutineInput.runAt` (IsoDate, optional) so the editor can arm a one-shot — previously active one-shots were chat-only by rejection.

**API (`apps/api`)**
- `routines.create` arms an active one-shot from `runAt` (future-validated) instead of rejecting it; `runAt` on recurring routines still rejected. Update-path semantics unchanged.
- The plain `Routine "x" created` meta notice is now a concise confirmation card (`Routine`/`Instruction`/`When`/`Timezone`/`Next run`) posted from one shared helper; update-path schedule changes post the same card, active toggles keep the small meta notice.

**Adapters (`packages/adapters`)**
- `schedule-tools.ts` is the single home for `routineWhenSummary`/`routineConfirmLines`/`appendRoutineTranscriptNotice`; the chat path (`schedule_create`) posts the confirmation card too; the tool result returns `scheduleText`/`timezone`/`nextRunAt`; `schedule_create` description rewritten for the conversational journey (ask only for missing material details; confirm name/schedule/timezone/next run).
- `scripted-runtime.ts` gained a "create a routine" branch (e2e scripting) calling the real `schedule_create` tool.

**Web (`apps/web`)**
- Routine menu: primary human presets (Once/Daily/Weekdays/Weekly/Monthly/Yearly) ahead of an "Advanced" divider (Every hour/Interval/Advanced cron) and a new "Event triggers" submenu (Slack/Teams/coming-soon/Git/Webhook).
- Editor: editable timezone select (IANA via `Intl.supportedValuesOf`, curated fallback), next-run line, Run-at field for Once drafts; save wires `timezone` and one-shot `runAt` for create and update.
- List rows show "Next run: …" when active and armed.
- i18n: new msgids extracted and filled for all 10 non-English catalogs (`Once`, `Yearly`, `Event triggers`, `Timezone`, `Next run`, `on Jan 1 at {0}`); catalogs recompiled.

**Mobile (`apps/mobile`)**
- `routines.tsx`: human schedule summaries (was raw cron) + next run per row.
- `routine.tsx`: full management per the documented mobile split — schedule/timezone/next run/instruction, Active/pause Switch (`routines/update`), run history (`routines/history`), destructive delete via native Alert (`routines/remove`); edit/test remain desktop-only by design. New strings translated (zh/ru/de).

**E2E**
- New `routine-chat-journey.spec.ts` (chat → confirmation card → management home).
- `routine-crud.spec.ts` extended: pause hides next run / resume restores it; Once arms from Run-at; Yearly/Advanced menu presence.
- `routine-execution.spec.ts` updated for the Event triggers submenu (incl. Korean).

## Files / Modules Changed

- `packages/core/src/cron.ts` + test; `packages/contracts/src/domain.ts`
- `apps/api/src/router.ts`; `apps/api/src/routine-create.test.ts` (new)
- `packages/adapters/src/schedule-tools.ts` + test; `builtin-tools.ts`; `scripted-runtime.ts`
- `apps/web/src/pages/RoutineEditor.tsx`, `RoutineSchedule.tsx`, `Shell.tsx`; `apps/web/src/locales/*/messages.po` (regenerated + filled)
- `apps/mobile/app/routines.tsx`, `routine.tsx`; `apps/mobile/lib/locales/{zh,ru,de}.ts`
- `apps/web/e2e/routine-chat-journey.spec.ts` (new); `routine-crud.spec.ts`; `routine-execution.spec.ts`

## Verification Run

| Suite | Result |
|---|---|
| Typecheck (turbo check, 16 tasks) | 16/16 pass |
| Lint (biome on all touched files) | clean |
| Unit: core/adapters/api (cron, schedule-tools, routine-create, routine-runs, team-bots, router, executor) | green; 4 failures pre-existing on the clean tree (computer-idle ×3 timeouts, desktop-runtime — environment-dependent baseline set) |
| Unit: web (65 files) + mobile lib (incl. i18n completeness) | green |
| E2E (local harness, scripted runtime) | routine-chat-journey 1/1, routine-crud 6/6, routine-execution 5/5, routines-library-search 2/2 |

## Decisions Made During Phase

- One shared confirmation card (`routineConfirmLines`) used by both chat and editor paths — the Grok "Bot creates the routine and shows its next run" state is provider-neutral and cannot drift between surfaces.
- Update/pause stay management-home actions (editor + mobile toggle) rather than new chat tools: the official reference manages routines in Details → Routines, and the chat tools already cover create/list/cancel.
- Editor-created one-shots arm via `CreateRoutineInput.runAt` instead of the old blanket rejection, matching the Once preset's first-class place in the schedule hierarchy.
- P18-19's isolation invariant is verified by API integration tests; the browser E2E with a second member is deferred to phase 19 (P19-19/P19-20) because the product has no space-invite flow yet — a two-member web e2e is not buildable before the membership/publish work exists.

## Intentional Rakazo-only Advanced Capabilities (P18-23)

Preserved behind progressive disclosure, not removed for parity: raw cron and arbitrary intervals under Advanced; webhook/GitHub/message-provider event triggers under Event triggers; hourly scheduling under Advanced; Teams/Linear/Sentry/PagerDuty triggers remain visible-but-disabled placeholders (as before); `notify` per-routine flag persists in the schema without UI (as before).

## Blockers

None.

## Discovered Follow-ups

- Event-trigger runs (webhook/GitHub/messaging) carry `trigger: "webhook"` without `routineId`, so they do not appear in Routine run history (P2, candidate for a later routine-polish pass or phase 23 sweep).
- Deleting a Bot should be verified to remove its routines (docs: deleting removes profile, conversation, and routines) — folded into phase 23 verification.

## Next Recommended Task

Execute Phase 19 (Team Bot Publish & Shared Setup Parity), starting from P19-01: audit the TeamBot/TeamBotMember/Bot-instance model, then add the draft/published lifecycle state and the owner-only setup gate (P19-02/P19-03/P19-07) before the Share → Publish to Team flow (P19-04…P19-06).

## Final Summary

DONE — recurring work now follows the Grok journey: conversational creation with a concise confirmation card (instruction, schedule in words, timezone, next run), human schedule presets with cron/events behind disclosure, next-run visibility across web/mobile/confirmation, and mobile management matching the documented capability split; team-bot routines stay actor-private and verified.
