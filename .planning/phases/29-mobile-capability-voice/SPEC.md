# Phase 29 — Mobile Capability & Voice Gap Closure

## Objective

Close the verified mobile gaps with native UI and no desktop compression, and record honestly what cannot be verified without a device. Reference: mobile docs say a Bot's voice memo can be played, Team Bots can be used (not created, set up or published) from mobile, routines can be paused/resumed/deleted but not edited or tested.

## Maintainer directive

All M4 phases were requested in one run; documented exception to the M3 Phase 23 dependency.

## Decisions

- **D-29-1 No voice-memo recording on mobile.** No source describes it (`unverified`), so it is MAY (M4-MOB-003). It also cannot be verified without a device and microphone, and untested native audio capture is a regression risk.
- **D-29-2 No Team Bot publish/setup on mobile.** The Team Bots docs make creating, setup and publishing desktop-only; mobile already exceeds that (list/create/open). Nothing to add.
- **D-29-3 Transcript follows playback, no tap-to-seek.** The shared `activeTranscriptSegment`/`seekableSegments` helpers drive highlighting from a new `onProgress` playback callback. Seeking needs a controllable player handle that the current fire-and-forget `playMpeg` does not expose; adding one is device-only work, so it stays out.
- **D-29-4 Fix, not just add.** Draft, project and voice-memo cards were rendered only inside the "ask with actions" branch of the message renderer, so they never appeared on their own. They now share one card list used by both paths.
