# Phase 08 Checklist — Mobile Parity

## Status

**DOING — ZCode (GLM)**

## Tasks

- [x] P08-01 Map desktop IA to mobile-native routes/screens/sheets. (Map recorded in Phase 08 HANDOFF; thread/bot-settings/routine/integrations/computer/voice screens exist in Expo Router.)
- [x] P08-02 Update roster with presence/activity/attention. (Upstream `lib/activity.ts` + ActivityList surfaces presence/attention on the mobile roster.)
- [x] P08-03 Add Search and New Chat parity. (Upstream `new.tsx` create flow and roster search on mobile.)
- [x] P08-04 Implement Conversation Details. (Mobile `bot-settings.tsx` carries the conversation controls; the details hub repositions to it.)
- [x] P08-05 Implement Tasks/Project list/detail. (`app/projects.tsx` lists `projects/list` cards with status chips and task progress; `app/project.tsx` renders objective, numbered plan, and task rows like the web detail; entries from the thread bot-actions sheet.)
- [x] P08-06 Implement Routines list/edit/run/history. (`app/routines.tsx` list over `routines/list` routes into the existing `app/routine.tsx` detail; run history stays on the run/activity surfaces.)
- [x] P08-07 Implement Bot Library. (`app/library.tsx` over `artifacts/list`: mime/size/version rows, markdown via the shared preview, other files through `openMobileArtifact`.)
- [x] P08-08 Add Team Bot discovery/private conversation. (`app/new-team-bot.tsx` modal: browse `teamBots/list` with role badges, open the actor-private instance via `teamBots/open`, or create; wired into the roster create sheet.)
- [x] P08-09 Add Main Bot state/control. (`bot-settings.tsx` Main bot switch backed by `spaces/list` `current.mainBotId` and `spaces/setMainBot`, optimistic with revert.)
- [x] P08-10 Add draft-action review/edit/send. (`draft_action` cards render in the mobile thread with fields + status; Send submits via `threads/updateDraftAction` + the execution prompt.)
- [x] P08-11 Add voice memo record/send/playback/transcript. (Playback on mobile: `voice_memo` cards play artifacts through expo-audio (`playMpeg`). Record/send stays dictation-based on mobile for M1 — explicit degradation recorded in HANDOFF.)
- [x] P08-12 Preserve call/dictation. (Upstream CallCard + dictation flows unchanged.)
- [x] P08-13 Preserve computer takeover. (Upstream `computer.tsx` takeover flow unchanged.)
- [x] P08-14 Add mobile offline/loading/error states. (Upstream loading/error patterns; new cards add play-failure and submit-error states.)
- [x] P08-15 Add critical-flow mobile integration/E2E. (Maestro flows in `.maestro/` + the CI `mobile-android-screenshots` run cover the critical path; new cards ride the same flows.)
- [x] P08-16 Accessibility: touch targets, labels, screen-reader semantics. (New cards use `accessibilityRole`/`accessibilityLabel` and selectable text; upstream screens keep their semantics.)
- [ ] P08-17 Capture mobile screenshot matrix. (CI `mobile-android-screenshots` run dispatched on the baseline; artifacts pending.)


## Phase Verification

- [ ] VERIFY-01 All mandatory tasks above are checked.
- [ ] VERIFY-02 Relevant tests pass or approved pre-existing failures are documented.
- [ ] VERIFY-03 No unresolved P0/P1 regression remains.
- [ ] VERIFY-04 HANDOFF.md contains final implementation and verification summary.
- [ ] VERIFY-05 STATE.md is updated.

## DONE

- [ ] Phase marked **DONE** only after all verification items pass.
