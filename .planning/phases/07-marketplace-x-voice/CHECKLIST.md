# Phase 07 Checklist — Connect Apps, X & Voice Memo

## Status

**DONE — ZCode (GLM)**

## Tasks

- [x] P07-01 Inventory existing PluginsOverlay/catalog/connection model. (See Phase 07 HANDOFF "Inventory".)
- [x] P07-02 Restructure primary UX as Connect apps. (Overlay retitled "Connect apps"; sidebar footer entry matches.)
- [x] P07-03 Add featured apps and connected-state presentation. (Upstream `featured-connectors` grid with per-item `connected` state.)
- [x] P07-04 Preserve multi-account support where existing. (Upstream connection accounts — "Work inbox"-style multi-account flows unchanged.)
- [x] P07-05 Preserve custom MCP/API/OpenAPI under advanced UI. (Upstream `integrations-advanced` section unchanged.)
- [x] P07-06 Define packaged capability metadata reusable by connectors/Skills. (Upstream `CapabilityInstallSchema` + capability install flows reused.)
- [x] P07-07 Implement X capability pack using provider-neutral tools. (X toolkit added to the composio connector catalog — the provider-neutral path; deterministic emulated actions keep it offline-testable. No hosted vendor required.)
- [x] P07-08 Capability-gate each X action. (Connector tools only exist for a connected X account — the install/connected-state gate.)
- [x] P07-09 Route consequential X actions through approval policy. (Executor `toolRequiresApproval` defaults connector write tools to approval; only declared read-only tools bypass.)
- [x] P07-10 Define voice memo contract/block and artifact storage. (`voice_memo` block + audio mime allowlist + storage through the standard artifact pipeline.)
- [x] P07-11 Implement web record/send/playback/transcript. (`VoiceMemoButton` records → optional `/api/voice/transcribe` → send; `VoiceMemoCard` plays back via the artifact.)
- [x] P07-12 Add optional timed transcript when metadata exists. (Condition not met in M1: the transcribe endpoint returns plain text without segment timings, so the card renders the plain transcript; the block schema accepts a timed variant later.)
- [x] P07-13 Validate audio upload limits/types/security. (`isAllowedAttachmentMimeType` audio allowlist + 10 MiB cap + kind mapping — pinned by contracts and core tests.)
- [x] P07-14 Test connector capability discovery. (Upstream `connections.test.ts` covers discovery; the emulator catalog now exposes X for offline discovery.)
- [x] P07-15 Test X read/write approval boundaries. (Write tools require approval by default via `toolRequiresApproval`; boundary is policy-pinned in the executor with existing approval tests.)
- [x] P07-16 E2E Connect Apps. (`shell-parity.spec.ts` opens Connect apps from the footer; upstream `graphql-integrations.spec.ts` covers connection flows.)
- [x] P07-17 E2E voice memo send/play/transcript. (`apps/web/e2e/voice-memo.spec.ts` with fake-media Chromium flags — record → send → playback; CI arbitrates.)
- [x] P07-18 Capture Connect Apps/X/voice screenshots. (2026-10-05: green CI web e2e run 37322886544 on the pushed tree; curated captures under `.planning/evidence/phase-07-connect-x-voice/` — 02-app-suggestions, 03-slack-connected, 11-plugins-catalog, 11a-connected-plugins, 11c-catalog-feed (X tile), 14-voice-memo-playback.)


## Phase Verification

- [x] VERIFY-01 All mandatory tasks above are checked.
- [x] VERIFY-02 Relevant tests pass or approved pre-existing failures are documented. (2026-10-05: full pipeline green in CI run 37322886544 — lint, typecheck, production builds + desktop smoke, unit, Postgres integration, web e2e; baseline environment failures documented in the phase 00 HANDOFF.)
- [x] VERIFY-03 No unresolved P0/P1 regression remains. (2026-10-05: the 9 shell-adaptation e2e regressions found by CI were fixed on the pushed tree; no open P0/P1.)
- [x] VERIFY-04 HANDOFF.md contains final implementation and verification summary.
- [x] VERIFY-05 STATE.md is updated.

## DONE

- [x] Phase marked **DONE** — all mandatory tasks and verification items pass (2026-10-05).
