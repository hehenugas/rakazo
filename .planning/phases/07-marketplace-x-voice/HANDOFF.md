# Phase 07 Handoff — Connect Apps, X & Voice Memo

## Current Status

DONE — P07-01…P07-18 all pass; evidence under `.planning/evidence/phase-07-connect-x-voice/`; green pipeline in CI run 37322886544.

## Owner

ZCode (GLM)

## Branch / Worktree

Local `main` (baseline `fd356375`) carrying the restored phase WIP, uncommitted.

## Inventory (P07-01)

- Connect apps: `PluginsOverlay` (featured grid + per-item connected state + advanced MCP/API/OpenAPI), connection model (composio/pipedream providers, multi-account), capability install metadata (`CapabilityInstallSchema`).
- Voice: `/api/voice/transcribe` (upstream), `voiceStatus` catalog; the WIP adds the memo pipeline.
- X: no first-party connector existed; X arrives provider-neutrally through the composio connector.

## Work Log

### 2026-10-04 — Planning initialized

- Phase packet created.
- No implementation work has started.

### 2026-10-05 — Phase claimed; X pack + voice memo verification (ZCode/GLM)

- The restored WIP carries the Connect apps retitle (P07-02) and the full voice memo pipeline (P07-10/11): audio mime allowlist in contracts, `voice_memo` block, `VoiceMemoButton` (record → optional transcribe → send), `VoiceMemoCard` (playback via the artifact), composer mic wiring.
- P07-07/08/09: added `X` to the composio connector catalog so the X capability pack is provider-neutral (tools exist only for a connected account; deterministic `X_EMULATED_ACTION` keeps flows offline-testable). Consequential X writes keep the executor's `toolRequiresApproval` default-approval boundary.
- P07-13: pinned the audio allowlist and `voice_memo` kind mapping with tests — `packages/contracts/src/attachments.test.ts` (mime allowlist incl. video/mp4 rejection) and `packages/core/src/attachments.test.ts` (`attachmentKindForMimeType` + block mapping).
- P07-17: added `apps/web/e2e/voice-memo.spec.ts` and fake-media Chromium flags in `apps/web/playwright.config.ts` so recording is deterministic headlessly.
- P07-12: condition not met — the transcribe endpoint returns plain text (no segment timings), so the card shows the plain transcript; noted for a future timed variant.

## Files / Modules Changed

- `packages/adapters/src/composio-emulator.ts` — X toolkit entry (P07-07).
- `packages/contracts/src/attachments.test.ts`, `packages/core/src/attachments.test.ts` — audio validation tests (P07-13).
- `apps/web/playwright.config.ts` — fake-media launch flags (P07-17).
- `apps/web/src/components/VoiceMemoCard.tsx` — `voice-memo-card` testid.
- `apps/web/e2e/voice-memo.spec.ts` — new (P07-17).
- Pre-existing WIP (restored, uncommitted): Connect apps retitle, voice memo components + contracts + composer wiring.

## Verification Run

| Suite | Command | Result |
|---|---|---|
| Typecheck | `pnpm check` / targeted `tsc` | 22/22 tasks pass (2026-10-05) |
| Lint | `pnpm lint` | 0 errors; 19 warnings + 4 infos (pre-existing baseline) |
| Contract/core tests | `vitest run packages/contracts/src/attachments.test.ts packages/core/src/attachments.test.ts` | 8/8 pass |
| E2E web | `voice-memo.spec.ts` | delegated to CI per maintainer instruction |

## Evidence / Screenshots

- `14-voice-memo-playback` — from the CI web e2e run; to be linked here when the run finishes.

## Decisions Made During Phase

- X ships as a connector toolkit (provider-neutral, no first-party vendor dependency) rather than a bespoke API client — matches D-002 and the no-hosted-vendor rule.
- Voice memo transcript is plain text in M1; a timed-transcript block variant awaits segment timings from a provider.

## Blockers

- None — resolved by green CI run 37322886544.

## Discovered Follow-ups

- First-party X API client only if a vendor-less direct integration becomes a requirement.

## Next Recommended Task

1. Push, let CI arbitrate the e2e specs, link screenshots, check P07-18 + VERIFY items.
2. Claim Phase 08 (Mobile Parity): map the new IA onto Expo navigation and the shared contracts.

### 2026-10-05 — CI green; phase closed (ZCode/GLM)

- Connect apps / X / voice flows green in CI run 37322886544 (web e2e 182/182).
- Capture matrix completed: app suggestions, connected-after-reload, plugins catalog, connected plugins, catalog feed (X tile visible), and voice-memo playback. Curated under `.planning/evidence/phase-07-connect-x-voice/`.
- The offline X capability pack is pinned by the Composio emulator catalog unit test (7 slugs incl. X), which CI now runs green.

## Final Summary

Complete — all mandatory tasks and verification items pass; evidence under `.planning/evidence/phase-07-connect-x-voice/`.
