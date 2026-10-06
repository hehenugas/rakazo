# Phase 18 Checklist — Routines & Scheduling Experience Parity

## Status

TODO — unclaimed

## Tasks

- [ ] P18-01 Map current Routine create/manage API and UI to the official Grok Routine journey.
- [ ] P18-02 Add a provider-neutral conversational Routine creation contract/tool for a Bot to create/update/pause/delete the user's Routine.
- [ ] P18-03 Detect/handle explicit recurring requests without forcing the user into the editor for ordinary schedules.
- [ ] P18-04 Return a concise Routine-created/updated card or transcript state with instruction, schedule, timezone, and next run.
- [ ] P18-05 Ensure the Bot asks for missing material schedule information only when necessary.
- [ ] P18-06 Add/verify One-time schedule support and show it as Once + date/time.
- [ ] P18-07 Add/verify Daily, Weekdays, Weekly, Monthly, and Yearly human schedule choices.
- [ ] P18-08 Keep hourly/arbitrary interval/raw cron behind Advanced.
- [ ] P18-09 Move webhook/Git/message triggers behind an Advanced or event-trigger disclosure rather than ordinary schedule hierarchy.
- [ ] P18-10 Show the user's configured timezone prominently enough to prevent schedule ambiguity.
- [ ] P18-11 Show Next run in the Routine list/detail and confirmation state.
- [ ] P18-12 Keep Details → Routines as the management home.
- [ ] P18-13 Verify Active/pause, Test run, edit instruction, edit schedule, Run history, and Delete.
- [ ] P18-14 Verify deleting a Routine is immediate and clearly destructive; no misleading undo state.
- [ ] P18-15 Ensure Routine run results return to the owning Bot/private conversation.
- [ ] P18-16 Enforce Team Bot routines as actor-private rather than shared Team Bot configuration.
- [ ] P18-17 Add E2E: chat request → Routine created → next run shown → Details → Routines.
- [ ] P18-18 Add E2E: pause/resume → edit schedule → Test run → history → delete.
- [ ] P18-19 Add E2E: Team Bot member creates Routine; another member cannot see/edit it.
- [ ] P18-20 Add mobile verification for schedule/next run/instruction/history/Active/delete.
- [ ] P18-21 Preserve existing webhook/Git/message trigger capabilities through Advanced flow.
- [ ] P18-22 Update screenshots/evidence for hierarchy sanity, not pixel identity.
- [ ] P18-23 Record intentional Rakazo-only advanced capabilities in HANDOFF.

## Phase Verification

- [ ] VERIFY-01 Conversational scheduling journey passes end-to-end.
- [ ] VERIFY-02 Ordinary schedule creation never requires raw cron.
- [ ] VERIFY-03 Team Bot Routine privacy/isolation tests pass.
- [ ] VERIFY-04 Desktop/mobile management behavior matches the documented capability split.
- [ ] VERIFY-05 HANDOFF.md and STATE.md are updated.

## DONE

- [ ] Phase marked DONE only after all verification items pass.
