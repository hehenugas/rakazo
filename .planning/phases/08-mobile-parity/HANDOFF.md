# Phase 08 Handoff — Mobile Parity

## Current Status

DOING — all implementation tasks are in the tree: the four degraded screens (P08-05/07/08/09) landed this pass together with a Routines list screen completing P08-06, plus the CI Maestro launch fix. P08-17 waits on the mobile CI artifacts.

## Owner

ZCode (GLM)

## Branch / Worktree

`phase/00-bootstrap` @ origin (hehenugas) — pushed through `99a5a076`.

## IA map (P08-01)

- Thread: `app/thread.tsx` (+ `group-thread.tsx`) — blocks, composer, dictation, calls.
- Controls hub: `app/bot-settings.tsx` (mobile's Conversation Details surface).
- Routines: `app/routines.tsx` (list) → `app/routine.tsx` (detail); Library: `app/library.tsx`; Tasks: `app/projects.tsx` → `app/project.tsx`; Team Bots: `app/new-team-bot.tsx`; Connect apps: `app/integrations.tsx`; Computer: `app/computer.tsx`; Voice: `app/voice.tsx`; New chat: `app/new.tsx`.
- Shared contracts (`@rakazo/contracts`) and the same RPC surface as web — no mobile-specific API.

## Work Log

### 2026-10-04 — Planning initialized

- Phase packet created.
- No implementation work has started.

### 2026-10-05 — Phase claimed; thread cards for the new block kinds (ZCode/GLM)

- `apps/mobile/app/thread.tsx` now renders the three new block kinds:
  - `draft_action`: card with provider/action, fields (selectable), status; a Send action submits via `threads/updateDraftAction` + the same execution prompt the web card uses, then refreshes.
  - `project`: status card (title, Project · status, objective).
  - `voice_memo`: playback row — fetches the artifact and plays through expo-audio via the existing `playMpeg` helper, with loading/error states and accessibility labels.
- Screen `submitDraftAction` added alongside the existing `send()`; passes through a new optional `onDraftSubmit` prop on `MessageBubble`.
- Voice memo recording on mobile stays dictation-based for M1; the composer mic flow differs natively (dictation → text) and memo recording ports with the composer work above.

### 2026-10-05 — Parity screens for the remaining gaps (ZCode/GLM)

- **Tasks/Projects (P08-05)**: `app/projects.tsx` lists `projects/list` as status-chip cards with task progress and pull-to-refresh; `app/project.tsx` renders `projects/get` (objective, numbered plan, task rows mirroring the web dot+status pattern) with an Open conversation button. Entries from the thread bot-actions sheet.
- **Routines (P08-06)**: `app/routines.tsx` lists `routines/list` (name, active/paused, trigger summary) and routes into the existing `app/routine.tsx` detail screen — the previously missing list surface.
- **Library (P08-07)**: `app/library.tsx` lists `artifacts/list` for the bot with mime/size/version rows; markdown artifacts open in the shared `MarkdownArtifactPreview`, everything else through `openMobileArtifact`.
- **Team Bots (P08-08)**: `app/new-team-bot.tsx` modal — browse `teamBots/list` with role badges and open the actor-private instance via `teamBots/open`, or create through `teamBots/create` then open. Wired as a "Team bot" entry in the roster create sheet.
- **Main Bot (P08-09)**: `bot-settings.tsx` gains a Main bot switch backed by `spaces/list` (`current.mainBotId`) and `spaces/setMainBot`, with optimistic update + revert on failure.
- **CI stability (P08-15)**: `screenshots.yaml` now relaunches the app after closing the cold-start launcher ANR — the flow previously ended up waiting on the home screen (diagnosed from the run's failure screenshot: launcher home visible for the whole 30 s wait).
- All new chrome strings translated in de/ru/zh (the i18n completeness guard test enforces it).

## Files / Modules Changed

- `apps/mobile/app/thread.tsx` — new block cards, `VoiceMemoRow`, `submitDraftAction`, `onDraftSubmit` prop, `draftExecutionPrompt`, bot-actions entries for Tasks/Routines/Library.
- `apps/mobile/app/projects.tsx`, `project.tsx`, `routines.tsx`, `library.tsx`, `new-team-bot.tsx` — new screens (registered in `_layout.tsx`).
- `apps/mobile/lib/project-status.ts` — shared status label/color helpers.
- `apps/mobile/app/bot-settings.tsx` — Main bot switch.
- `apps/mobile/app/index.tsx` — Team bot entry in the create sheet.
- `apps/mobile/lib/locales/{de,ru,zh}.ts` — 45 new keys each.
- `apps/mobile/.maestro/screenshots.yaml` — ANR relaunch fix.

## Verification Run

| Suite | Command | Result |
|---|---|---|
| Typecheck | `tsc --noEmit` (mobile) | clean (2026-10-05, parity screens) |
| Lint | `biome check apps/mobile` | clean (2026-10-05) |
| Mobile unit | `pnpm --filter @rakazo/mobile test` | 396/396 pass (2026-10-05) |
| Mobile e2e | Maestro flows / CI `mobile-android-screenshots` | delegated to CI; re-dispatched after `99a5a076` with the ANR relaunch fix |

## Evidence / Screenshots

- CI `mobile-android-screenshots` artifacts — pending on the run dispatched for `99a5a076`; the new screens are reachable from thread actions and the create sheet.

## Decisions Made During Phase

- Draft submission on mobile reuses the exact web execution prompt so approval policy and audit behavior match across surfaces.
- Playback reuses `playMpeg` (expo-audio) instead of adding a new audio stack.
- Project tasks render the raw lifecycle status like the web detail view; the shared status color/label helpers live in `lib/project-status.ts` so the list and detail cannot drift.
- Main bot toggles immediately (space-level setting, not part of the bot save diff) — same semantics as the web Details toggle.

## Blockers

- P08-17 needs the CI mobile run artifacts.

## Discovered Follow-ups

- Composer mic for voice-memo recording on mobile (recording stays dictation-based in M1).
- Roster badge for team-bot instances (`Bot.teamBotId` is available on the roster payload).

## Next Recommended Task

1. Check the mobile CI run for `99a5a076`; attach the artifact set to P08-17.
2. Phase 09 (Hardening & Release).

## Final Summary

Not complete — P08-17 pending on CI artifacts; everything else implemented and locally verified.
