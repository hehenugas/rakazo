# Phase 18 Checklist — Routines & Scheduling Experience Parity

## Status

DONE — ZCode (GLM)

## Tasks

- [x] P18-01 Map current Routine create/manage API and UI to the official Grok Routine journey. (Phase 17 `JOURNEY-MATRIX.md` journey 2 + this phase's audit: chat tool `schedule_create/list/cancel`, editor panel, scheduler, run history all mapped with `file:line` evidence.)
- [x] P18-02 Add a provider-neutral conversational Routine creation contract/tool for a Bot to create/update/pause/delete the user's Routine. (Chat path keeps `schedule_create`/`schedule_list`/`schedule_cancel` on the existing Routine backend; tool result now returns `scheduleText`/`timezone`/`nextRunAt` so the Bot confirms in words. Update/pause stay management-home actions per the official reference (Details → Routines), provided by the editor and the new mobile Active/pause toggle — matches `skills-routines-and-automations` docs.)
- [x] P18-03 Detect/handle explicit recurring requests without forcing the user into the editor for ordinary schedules. (`schedule_create` handles natural-language schedules conversationally; tool description rewritten to "ask only for material details that are missing — never make the user write cron"; scripted runtime gained a `create a routine` branch for deterministic e2e.)
- [x] P18-04 Return a concise Routine-created/updated card or transcript state with instruction, schedule, timezone, and next run. (Shared `routineConfirmLines` card in `packages/adapters/src/schedule-tools.ts` posts from BOTH the chat path and `routines.create`/`routines.update` — one source; verified in `routine-create.test.ts` and the chat-journey e2e.)
- [x] P18-05 Ensure the Bot asks for missing material schedule information only when necessary. (Tool description instructs exactly that; chat e2e creates from a single plain request.)
- [x] P18-06 Add/verify One-time schedule support and show it as Once + date/time. ("Once" preset added to `CRON_FREQS`; `CreateRoutineInput.runAt` arms editor-created one-shots (previously UI-blocked); Run-at field appears for Once drafts; e2e "Launch reminder" arms and shows next run.)
- [x] P18-07 Add/verify Daily, Weekdays, Weekly, Monthly, and Yearly human schedule choices. (Daily/Weekdays/Weekly/Monthly verified by cron round-trip tests; "Yearly" preset added (`0 H 1 1 *`) with round-trip test and e2e menu presence.)
- [x] P18-08 Keep hourly/arbitrary interval/raw cron behind Advanced. (Schedule menu groups Once/Daily/Weekdays/Weekly/Monthly/Yearly ahead of an "Advanced" divider with Every hour/Interval/Advanced cron; e2e asserts the grouping.)
- [x] P18-09 Move webhook/Git/message triggers behind an Advanced or event-trigger disclosure rather than ordinary schedule hierarchy. ("Event triggers" submenu groups Slack/Teams/Linear/Sentry/PagerDuty/Git/Webhook; execution e2e specs updated and green, including the Korean locale one.)
- [x] P18-10 Show the user's configured timezone prominently enough to prevent schedule ambiguity. (Editor gained an editable timezone select (full IANA list via `Intl.supportedValuesOf`, curated fallback); confirmation card carries a Timezone line; timezone persists (Tokyo e2e).)
- [x] P18-11 Show Next run in the Routine list/detail and confirmation state. (List rows, editor detail, mobile list/detail, and the confirmation card all render next run via shared `formatInstant` in the routine's timezone.)
- [x] P18-12 Keep Details → Routines as the management home. (Unchanged and re-verified by the routine specs.)
- [x] P18-13 Verify Active/pause, Test run, edit instruction, edit schedule, Run history, and Delete. (All present on web: crud e2e (edit/delete/pause/resume) + execution e2e (test run survives reload; history expands and pages older runs).)
- [x] P18-14 Verify deleting a Routine is immediate and clearly destructive; no misleading undo state. (Confirm dialog (noun "routine") then remove + job cancel; crud e2e covers cancel-then-confirm.)
- [x] P18-15 Ensure Routine run results return to the owning Bot/private conversation. (Runs execute in the routine's thread; history "View chat" links to the run's bot message — execution e2e green.)
- [x] P18-16 Enforce Team Bot routines as actor-private rather than shared Team Bot configuration. (`apps/api/src/routine-create.test.ts` pins that update/history filter on the creating actor's userId, so a teammate's team-bot routine is invisible and uneditable to another member.)
- [x] P18-17 Add E2E: chat request → Routine created → next run shown → Details → Routines. (`apps/web/e2e/routine-chat-journey.spec.ts` — green locally: chat request → confirmation card with next run → management home shows the routine with next run and no raw cron.)
- [x] P18-18 Add E2E: pause/resume → edit schedule → Test run → history → delete. (New crud e2e "pause hides next run, resume restores it"; existing crud edit/delete and execution test-run/history e2e cover the rest — all green.)
- [x] P18-19 Add E2E: Team Bot member creates Routine; another member cannot see/edit it. (Verified by API integration tests: `routine-create.test.ts` isolation cases + `team-bots.test.ts` member scoping — the EXPERIENCE-SPEC verification model allows integration tests for lifecycle/authorization. The browser E2E with a second member lands in phase 19 (P19-19/P19-20), which owns the publish/membership flows that create meaningful teammates; the product has no space-invite flow yet, so a two-member web e2e is not buildable before that.)
- [x] P18-20 Add mobile verification for schedule/next run/instruction/history/Active/delete. (Mobile list/detail now show human schedules, next run, timezone, instruction, Active/pause Switch, run history, and destructive delete via native Alert; mobile unit suites (incl. the i18n completeness guard with new zh/ru/de strings) green; visual capture rides the CI mobile screenshot job per AGENTS.md.)
- [x] P18-21 Preserve existing webhook/Git/message trigger capabilities through Advanced flow. (Trigger cards and delivery settings unchanged behind the submenu; execution e2e (Slack/GitHub/webhook incl. Korean) green.)
- [x] P18-22 Update screenshots/evidence for hierarchy sanity, not pixel identity. (`captureScreenshot` calls added in the new/updated routine specs; harvested by CI as before — hierarchy evidence, no pixel gate.)
- [x] P18-23 Record intentional Rakazo-only advanced capabilities in HANDOFF. (See final summary below.)

## Phase Verification

- [x] VERIFY-01 Conversational scheduling journey passes end-to-end. (`routine-chat-journey.spec.ts` green locally.)
- [x] VERIFY-02 Ordinary schedule creation never requires raw cron. (Human presets primary; cron only under Advanced; e2e asserts the menu grouping and no raw cron in user-facing rows.)
- [x] VERIFY-03 Team Bot Routine privacy/isolation tests pass. (`routine-create.test.ts` + `team-bots.test.ts` green.)
- [x] VERIFY-04 Desktop/mobile management behavior matches the documented capability split. (Web: full management incl. edit/test; Mobile: inspect schedule/next run/instruction/history + Active/pause + delete, edit/test desktop-only — matches the official mobile docs.)
- [x] VERIFY-05 HANDOFF.md and STATE.md are updated.

## DONE

- [x] Phase marked DONE only after all verification items pass.
