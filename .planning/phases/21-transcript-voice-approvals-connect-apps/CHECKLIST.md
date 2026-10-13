# Phase 21 Checklist — Transcript, Voice, Approvals & Connect Apps Experience Parity

## Status

DONE — Claude Code (Sonnet 5.5)

## Tasks

- [x] P21-01 Audit current VoiceMemo artifact/message model for storing transcript timing metadata. (Audit: transcript was sent only as message text; no timing, no structured storage, no seek (`voice.ts`, `VoiceMemoCard.tsx`).)
- [x] P21-02 Preserve transcript text with voice memo message in a first-class structured form. (`Artifact.transcript` (JSONB, migration `20261011090000_voice_memo_transcript`) → `voice_memo` block `transcript {text, segments?}`; `artifacts.create` accepts it; non-audio ignores it.)
- [x] P21-03 Generate/store word or segment timing when the configured transcription provider supports it. (`VoiceTranscribeResult.segments` from Fish (`ignore_timestamps=false`) and ElevenLabs (words grouped into segments); OpenAI returns text only. Parsing/grouping unit-tested against mocked responses; real provider payloads not exercised offline.)
- [x] P21-04 Render voice memo transcript next to/under playback. (`VoiceMemoCard` renders the transcript under playback and skips the duplicate caption bubble. Mobile keeps the existing caption text (plain).)
- [x] P21-05 Highlight current word/segment during playback. (`activeTranscriptSegment` (core, unit-tested) drives `aria-current` + highlight; e2e `voice-memo.spec.ts` highlight/seek test green.)
- [x] P21-06 Clicking a transcript word/segment seeks audio to the matching point. (Segment buttons set `audio.currentTime` and play; e2e asserts `currentTime >= 0.4` after clicking the second segment.)
- [x] P21-07 Gracefully degrade to plain transcript/audio when timing metadata is unavailable. (No segments → plain `<p>` transcript, no buttons; e2e with a text-only transcribe response green. Mobile highlight/seek not built (native player wrapper has no position API) — see HANDOFF follow-ups.)
- [x] P21-08 Audit approval cards against current summary-first/reference disclosure hierarchy. (Backend already splits summary (`text`) from detail (`approval-ask.ts`); old UI showed detail always expanded (APPR-001).)
- [x] P21-09 Show a concise approval request first; put command/reason/full request behind explicit disclosure. (`AskCard`: approval asks show the one-line summary; `View the full request` / `Hide the full request` disclosure (aria-expanded) on web and mobile (`ApprovalDetail`). Non-approval asks keep inline detail.)
- [x] P21-10 Preserve approval allow/deny/custom-answer/reload behavior and security policy. (Allow once / Always allow / Deny, custom answer, and reload paths unchanged; `consequential-approval.spec.ts` green with disclosure assertions.)
- [x] P21-11 Add secure credential/login request card that never asks users to paste secrets into chat. (Audit: secret/login ask card already a masked form (`type=password`, HTTPS origin shown, value never in message text); unchanged.)
- [x] P21-12 Offer provider/password-manager convenience only when actually available; no hard dependency. (Audit: no password-manager integration exists, so none is offered; the form has no dependency on one.)
- [x] P21-13 Rename plugin discovery search to current reference wording such as Search plugins where applicable. (Web and mobile search placeholder/label now `Search plugins` (e2e specs updated); server setup page keeps `Search apps`.)
- [x] P21-14 Keep Connect apps as the primary footer/navigation entry. (Audit: Connect apps stays the sidebar footer entry (`artifacts-tab`/`golden` e2e green).)
- [x] P21-15 Add current-reference featured plugin/logo treatment without making catalog composition a hardcoded vendor dependency. (Sidebar shows logos for featured connectors only when the catalog resolves them (`resolveFeaturedCatalogItem`); nothing renders when the catalog is empty. No hard-coded vendor dependency.)
- [x] P21-16 Starting plugin sign-in from Marketplace should proceed directly into sign-in instead of stopping at an ambiguous added state. (Audit: Marketplace `Add` calls `connections.begin` and opens sign-in immediately, polls to completion, only then shows `Added` (golden e2e green).)
- [x] P21-17 Resume the interrupted Bot task automatically after successful app sign-in where the request context is still valid. (New `request_app_connection` tool pauses the run with an ask + `app_connect` card; `markAppConnected` answers the ask server-side and enqueues the run. Fallback buttons (I connected it / Skip) remain. e2e `app-connect-resume.spec.ts` green.)
- [x] P21-18 Verify loading/error/reconnect/authorization states for plugin flows. (Audit: Add shows `Adding…` while pending, `Added` when connected, a timeout message for stuck sign-in, error text for failures; Add again retries (reconnect). No automated e2e for the timeout/error branches.)
- [x] P21-19 Add E2E voice memo playback + highlight + seek. (`voice-memo.spec.ts`: transcript highlight + seek, and plain-text fallback.)
- [x] P21-20 Add E2E approval summary → full request → approve/deny. (`consequential-approval.spec.ts`: summary → View the full request → Deny / Allow once / Always allow.)
- [x] P21-21 Add E2E connector request → sign-in → task resumes. (`app-connect-resume.spec.ts`: request → Authorize → card connected → run resumes without further input.)
- [x] P21-22 Verify accessibility for transcript seeking, approval disclosure, and credential forms. (Segment buttons are focusable with `aria-current`; disclosure uses `aria-expanded` and a native button; credential inputs keep labels. Asserted in the e2e specs above; no separate axe audit run.)

## Phase Verification

- [x] VERIFY-01 Voice transcript sync/seek passes with timing and fallback cases. (3 e2e green; core + adapter unit tests green.)
- [x] VERIFY-02 Approval flow remains secure and summary-first. (Policy code untouched; e2e green.)
- [x] VERIFY-03 Plugin discovery/sign-in/resume journey passes. (`app-connect-resume`, `golden`, `onboarding-conversation`, `graphql-integrations` green.)
- [x] VERIFY-04 No credential is exposed through chat, logs, fixtures, or screenshots. (No credential code changed; fixtures use `fake-scripted-voice-key` placeholder.)
- [x] VERIFY-05 HANDOFF.md and STATE.md are updated.

## DONE

- [x] Phase marked DONE only after all verification items pass.
