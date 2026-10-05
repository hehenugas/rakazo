# Phase 08 Handoff — Mobile Parity

## Current Status

DOING — P08-10/11/12/13 implemented this pass; several screens ride upstream parity (P08-01..04, 06, 12..16); P08-05/07/08/09/17 remain open with explicit degradation reasons.

## Owner

ZCode (GLM)

## Branch / Worktree

Local `main` (baseline `fd356375`) carrying the restored phase WIP, uncommitted.

## IA map (P08-01)

- Thread: `app/thread.tsx` (+ `group-thread.tsx`) — blocks, composer, dictation, calls.
- Controls hub: `app/bot-settings.tsx` (mobile's Conversation Details surface).
- Routines: `app/routine.tsx`; Connect apps: `app/integrations.tsx`; Computer: `app/computer.tsx`; Voice: `app/voice.tsx`; New chat: `app/new.tsx`.
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
- Explicit M1 degradations (per the fork rule that degradations need reasons): Tasks/Project management, Bot Library list, Team Bot discovery, and Main Bot control remain desktop-only surfaces — the shared contracts make each a focused port (picker rows + one screen each), listed as the next concrete tasks.
- Voice memo recording on mobile stays dictation-based for M1; the composer mic flow differs natively (dictation → text) and memo recording ports with the composer work above.

## Files / Modules Changed

- `apps/mobile/app/thread.tsx` — new block cards, `VoiceMemoRow`, `submitDraftAction`, `onDraftSubmit` prop, `draftExecutionPrompt`, `decodeAttachmentBase64`/`playMpeg` imports.

## Verification Run

| Suite | Command | Result |
|---|---|---|
| Typecheck | `tsc --noEmit -p apps/mobile` | clean (2026-10-05) |
| Lint | `pnpm lint` | 0 errors; 19 warnings + 4 infos (pre-existing baseline) |
| Mobile e2e | Maestro flows / CI `mobile-android-screenshots` | delegated to CI; run dispatched on the baseline |

## Evidence / Screenshots

- CI `mobile-android-screenshots` artifacts — pending; new cards will appear in thread screenshots once the run includes them (next dispatch after push).

## Decisions Made During Phase

- Draft submission on mobile reuses the exact web execution prompt so approval policy and audit behavior match across surfaces.
- Playback reuses `playMpeg` (expo-audio) instead of adding a new audio stack.

## Blockers

- P08-17 needs the CI mobile run artifacts.

## Discovered Follow-ups

- Mobile screens for Tasks/Projects (P08-05), Library (P08-07), Team Bots (P08-08), Main Bot control (P08-09) — each is a focused port from the desktop patterns over the shared contracts.
- Composer mic for voice-memo recording on mobile.

## Next Recommended Task

1. Push; re-dispatch `mobile-android-screenshots` so the new cards appear in the matrix; check P08-17.
2. Port the four degraded screens above, then close P08-05/07/08/09.
3. Then Phase 09 (Hardening & Release).

## Final Summary

Not complete — open items P08-05/07/08/09/17 with recorded reasons.
