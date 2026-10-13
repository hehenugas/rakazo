# Phase 29 Checklist — Mobile Capability & Voice

## Status

DOING — Claude Code (Sonnet 5.5), branch `m4-execution`, 2026-10-12. Unit and typecheck only; no simulator or device.

## Tasks

- [ ] P29-01 Native voice memo recording, permissions, send/play/retry, lifecycle. — Recording code exists and received source-level lifecycle/retry hardening (2026-10-13); remains unchecked because reference behavior and device lifecycle are unverified (MAY, D-29-1).
- [x] P29-02 Transcript with synchronized highlight when timings exist; plain fallback otherwise. (`VoiceMemoRow` shows timed segments with the active one emphasized, or the plain transcript text, or nothing; `playMpeg(bytes, {onProgress})` for both the HTML-audio and native paths; unit test for progress reporting; timing-shape tests already exist in core. Seek was not part of this verified item at the time; D-29-3.)
- [x] P29-03 Project plan/status/progress/blocker/cancel in the mobile thread, consistent ownership. (Thread project card now renders (D-29-4), shows localized status and `done of total` progress, and opens the existing project screen, which already has Stop and Retry. Typecheck and i18n catalog test pass; not run on device.)
- [x] P29-04 Mobile Team Bot actions only where documented. (No change required, D-29-2; recorded as R-13 in the reference matrix.)
- [ ] P29-05 Verify mobile Routine, approvals, Connect apps, drafts, background/reconnect and private Team Bot conversations end to end. — BLOCKED: needs a device or simulator.
- [ ] P29-06 Simulator/device evidence for permission prompts, VoiceOver/TalkBack, dynamic text, gestures. — BLOCKED: needs a device or simulator and CI Maestro (`apps/mobile/.maestro`).

Code-only follow-up (2026-10-13): timed transcript seek is now wired to the active HTML Audio or Expo Audio player in source. It is not recorded as verified here because the seek behavior was not exercised on a device.

## Phase Verification

- [ ] VERIFY-01 P29-01/05/06 open.
- [ ] VERIFY-02 No device evidence.

## DONE

- [ ] Phase not DONE.
