# Phase 21 Handoff — Transcript, Voice, Approvals & Connect Apps Experience Parity

## Current Status

DONE — 2026-10-11 (Claude Code, Sonnet 5.5). Local verification only; CI not yet run on this work.

## Owner

Claude Code (Sonnet 5.5), continuing the partial ZCode work (search wording, featured logos, approval disclosure).

## Branch / Worktree

`main` working tree (uncommitted).

## Work Log

### 2026-10-11 — Implementation

- Voice memo transcript: structured `transcript {text, segments?}` stored on the artifact, carried on the `voice_memo` block, rendered under playback with per-segment highlight and click-to-seek; degrades to plain text without timing. The transcript is shown once (the duplicate caption bubble is skipped).
- Providers: Fish (`ignore_timestamps=false`) and ElevenLabs (word timings grouped into short segments) return timing; OpenAI returns text only; scripted returns deterministic segments for offline tests.
- Approvals: web and mobile approval cards show the one-line summary; the full request opens behind `View the full request`.
- Connect apps: `Search plugins` wording (web, mobile); sidebar logos only for resolvable featured connectors; new `request_app_connection` agent tool posts an ask + app card and pauses; connecting the app answers the ask server-side and resumes the run.

## Files / Modules

- Contracts/DB: `packages/contracts/src/events.ts`, `rpc.ts`; `packages/db/prisma/schema.prisma` + migration `20261011090000_voice_memo_transcript`.
- Core: `voice-transcript.ts`, `attachments.ts`.
- Adapters: `transcript-segments.ts`, `app-connect-card.ts`, `fish-audio-voice.ts`, `elevenlabs-voice.ts`, `scripted-voice.ts`, `builtin-tools.ts`, `pi-runtime.ts`, `executor.ts`, `scripted-runtime.ts`; adapter-kit `types.ts`/`interfaces.ts`.
- API: `artifacts.ts`, `voice.ts`, `onboarding.ts`, `router.ts`.
- Web: `VoiceMemoCard.tsx`, `VoiceMemoButton.tsx`, `AskCard.tsx`, `Shell.tsx`, `PluginsOverlay.tsx`, locale catalogs.
- Mobile: `thread.tsx` (approval disclosure), `integrations.tsx`, locale catalogs.

## Tests Run (local, offline)

- Typecheck: contracts, core, adapter-kit, adapters, api, web.
- Unit: new core/adapter tests green; full `vitest run` green except 6 tests in computer/process-lifecycle suites (`computer-idle`, supervisor browser profile, desktop runtime, computer replay) that time out spawning shells/Chromium on this host. `computer-idle` also fails one test on a clean baseline; the others were not re-checked on baseline.
- Web e2e (harness, local): `voice-memo` (3), `app-connect-resume`, `consequential-approval`, `onboarding-conversation` (3), `golden` (4), `graphql-integrations`, `parity/canonical-states` (19). All green.
- Not run: desktop (Electron) e2e (per AGENTS.md), mobile device tests.

## Evidence

Screenshots captured by the e2e specs under `test-report/` (`14-voice-memo-transcript-seek`, `60-app-connect-waiting`, `61-app-connect-resumed`).

## Decisions

- Transcript lives on the artifact row (additive JSONB) rather than a new table; invalid JSON is dropped at block build time.
- App sign-in resume is backend-owned (`markAppConnected` answers the pending ask); the ask keeps `I connected it` / `Skip` as a manual fallback.
- Approval detail collapses only for approval asks; plain question hints stay inline.

## Unresolved / Discovered follow-ups

- Mobile voice memo: no recording and no highlight/seek (native player wrapper has no position API). Journey matrix rates mobile recording P2.
- Fish/ElevenLabs timing parsing follows documented response shapes but was only tested with mocked payloads; confirm against live accounts.
- OpenAI transcription has no timing, so those memos show plain transcripts.
- Plugin timeout/error/reconnect branches are audited, not covered by a dedicated e2e.
- No separate automated accessibility (axe) run; checks are limited to roles/aria asserted in e2e.

## Next Recommended Task

Phase 22: bind a Project to an orchestrator run with one child Task and prove parent Stop affects only owned child work.
