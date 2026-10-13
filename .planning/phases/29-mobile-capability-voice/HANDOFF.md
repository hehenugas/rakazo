# Phase 29 Handoff — Mobile Capability & Voice

## Current Status

DOING — 2026-10-12 (Claude Code, Sonnet 5.5). Code changes verified by typecheck and unit tests only; every device-dependent item is open.

## Branch

`m4-execution` (local, not pushed).

## Changes (all in `apps/mobile`)

- `lib/voice.ts`: `playMpeg(bytes, {onProgress})`; HTML audio reports `currentTime` on `timeupdate`, native `expo-audio` reports `status.currentTime` while playing.
- `app/thread.tsx`: `VoiceMemoRow` transcript with active-segment emphasis or plain text; project card is a button that opens `/project`, with progress; card list shared by both render paths so draft, project, deck and voice-memo cards render on their own (this also fixes drafts/voice memos that never showed outside an ask message). Deck row was added in Phase 28.

## New visible copy

- No new strings: the project card reuses "Project", the localized status labels and "{completed} of {total} tasks done".

## Verification (local)

- `tsc --noEmit` for mobile clean; mobile unit suite 403/403 including the i18n catalog test and the new playback-progress test.
- Not verified: any on-device behavior (audio progress callbacks, navigation to `/project`, accessibility, dynamic text), Maestro flows.

## Open

- P29-01 source recording code is present and hardened, but its reference behavior and device lifecycle remain unverified (MAY); P29-05 and P29-06 still need a device.
- Tap-to-seek is wired in source and remains unverified on device.

## Upstream surface

`apps/mobile/app/thread.tsx` is a predicted conflict file; this phase moved a block of JSX into a variable, which will make a textual merge noisier. Re-apply by hand after upstream changes land.

## Next recommended task

Phase 30 (Slack user-group mentions).

## Code-first parity hardening follow-up — 2026-10-13

- Source review confirms mobile recording already exists in `lib/voice-memo.ts` and `app/thread.tsx`. The recorder now attempts release/audio-mode restoration on every exit, cancels an open recording on background, and verifies the file size before base64 allocation.
- `sendVoiceMemo` retains one submission nonce, transcript result, and artifact id while a send is pending. Retrying reuses the same artifact and message nonce; `apps/api/src/artifacts.ts` deduplicates the same memo submission under the artifact-family lock. Pending capture data remains in memory only; process-restart recovery is not implemented.
- `lib/voice.ts` exposes seek for HTML Audio and Expo Audio. Timed transcript segments become accessible seek actions while playback is active; transcripts without timing remain plain text.
- New accessibility/error copy is shown only for recovery: “Retry voice memo” identifies that the existing control retries the same pending clip, so a new record does not replace it; “Could not verify the voice memo size.” explains why a clip is refused before a large base64 allocation. Both appear only when the corresponding state occurs.
- Verification for this follow-up: source review and TypeScript checks only. No unit, simulator, device, audio-permission, VoiceOver/TalkBack, or screenshot verification was run. Device items remain open.
