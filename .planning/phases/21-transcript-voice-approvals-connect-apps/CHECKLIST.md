# Phase 21 Checklist — Transcript, Voice, Approvals & Connect Apps Experience Parity

## Status

TODO — unclaimed

## Tasks

- [ ] P21-01 Audit current VoiceMemo artifact/message model for storing transcript timing metadata.
- [ ] P21-02 Preserve transcript text with voice memo message in a first-class structured form.
- [ ] P21-03 Generate/store word or segment timing when the configured transcription provider supports it.
- [ ] P21-04 Render voice memo transcript next to/under playback.
- [ ] P21-05 Highlight current word/segment during playback.
- [ ] P21-06 Clicking a transcript word/segment seeks audio to the matching point.
- [ ] P21-07 Gracefully degrade to plain transcript/audio when timing metadata is unavailable.
- [ ] P21-08 Audit approval cards against current summary-first/reference disclosure hierarchy.
- [ ] P21-09 Show a concise approval request first; put command/reason/full request behind explicit disclosure.
- [ ] P21-10 Preserve approval allow/deny/custom-answer/reload behavior and security policy.
- [ ] P21-11 Add secure credential/login request card that never asks users to paste secrets into chat.
- [ ] P21-12 Offer provider/password-manager convenience only when actually available; no hard dependency.
- [ ] P21-13 Rename plugin discovery search to current reference wording such as Search plugins where applicable.
- [ ] P21-14 Keep Connect apps as the primary footer/navigation entry.
- [ ] P21-15 Add current-reference featured plugin/logo treatment without making catalog composition a hardcoded vendor dependency.
- [ ] P21-16 Starting plugin sign-in from Marketplace should proceed directly into sign-in instead of stopping at an ambiguous added state.
- [ ] P21-17 Resume the interrupted Bot task automatically after successful app sign-in where the request context is still valid.
- [ ] P21-18 Verify loading/error/reconnect/authorization states for plugin flows.
- [ ] P21-19 Add E2E voice memo playback + highlight + seek.
- [ ] P21-20 Add E2E approval summary → full request → approve/deny.
- [ ] P21-21 Add E2E connector request → sign-in → task resumes.
- [ ] P21-22 Verify accessibility for transcript seeking, approval disclosure, and credential forms.

## Phase Verification

- [ ] VERIFY-01 Voice transcript sync/seek passes with timing and fallback cases.
- [ ] VERIFY-02 Approval flow remains secure and summary-first.
- [ ] VERIFY-03 Plugin discovery/sign-in/resume journey passes.
- [ ] VERIFY-04 No credential is exposed through chat, logs, fixtures, or screenshots.
- [ ] VERIFY-05 HANDOFF.md and STATE.md are updated.

## DONE

- [ ] Phase marked DONE only after all verification items pass.
