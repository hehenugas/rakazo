# M5 — Grok Bot Feature & Experience Completion

**Status:** CODE COMPLETE — phases 32–36 implemented and statically reviewed; runtime/UI/tests NOT VERIFIED
**Baseline:** fork `main` at `50c87b33`, 2026-10-13.
**Authority:** user-requested follow-up to M4; existing M3/M4 release gates remain open.
**Scope:** finish working production code, preserve Rakazo's modular/provider-neutral architecture, match Grok Bot's interaction semantics rather than pixels.

## Agent instructions / definition of CODE COMPLETE

- Read `AGENTS.md`, `.planning/PROJECT.md`, `ROADMAP.md`, `STATE.md`, `AGENT-PROTOCOL.md`, then this plan. Inspect HEAD before touching files: a previously identified gap may already be solved.
- **Do not run apps, tests (unit/integration/E2E), CI, Electron, simulators, screenshots, benchmarks, or manual UI checks.** Do not add tests just to satisfy a gate. Owner will do manual verification.
- Allowed verification: code reading, caller/callee tracing, static diff review, and optional lint/typecheck if convenient. Record `runtime: NOT VERIFIED` honestly. M5 may reach **CODE COMPLETE**, not `release verified` under the repository's normal gates. Do not mark M3/M4 done.
- Implement actual wired code, not placeholders, dead buttons, simulated success, or optimistic "delivered" labels. Prefer additive contracts/adapters and reuse existing backend ownership, approval, idempotency and event infrastructure.
- Maintain security boundaries, per-user credentials, account selection, provider capabilities, and private-by-default artifacts. Do not commit secrets or personal data. No push, merge, release or upstream sync without explicit permission.
- Agent marks checkboxes only after source-level implementation/review and documents changed paths, known limits and owner manual-check notes.

## M5 phases

### 32 — Multi-account email and action lifecycle (P1)
**Owner:** Codex; branch `main`.
**Starting points:** `apps/api/src/draft-actions.ts`, `packages/adapters/src/draft-binding.ts`, `packages/core/src/email-draft.ts`, `apps/web/src/components/DraftActionCard.tsx`.

- [x] M5-32-01 Replace the `matchingConnections.length !== 1` blocker with explicit account selection in draft UI and server-validated connection binding. Zero connections → connect prompt; one → default; multiple → selection; never choose another user's account.
- [x] M5-32-02 Implement verified sender/alias selection **only where provider capability supports it**. Validate against connected provider identities; keep sender and selected connection immutable in approved snapshot. If provider unsupported, show an honest limitation.
- [x] M5-32-03 Trace real Gmail Spam listing/search/restore (and any existing emulator implementation); wire through actual connector capability and approval policy without claiming emulator parity.
- [x] M5-32-04 Connect submitted draft to authoritative execution/delivery outcomes (queued, executing, sent, failed, unknown), server-driven reconnect and safe retry. Preserve the M4 atomic submit/idempotency guarantees; distinguish provider delivery from run completion.
- [x] M5-32-05 Prefer structured provider action for approved email when possible, rather than relying on a natural-language Bot message; retain agent assistance for drafting. Preserve exact-payload binding, actor authorization, consequential-action approval and failure recovery.
- [x] M5-32-06 Static-review both web/Electron and mobile paths; implement relevant missing wiring or explicitly degrade unsupported capability.

**Code acceptance:** multiple accounts can be selected without the current rejection, approved sender is verified, Spam is real-provider-backed where supported, and statuses reflect actual execution receipts rather than button clicks.

### 33 — Rich presentation and Google Slides (P1)
**Starting points:** `packages/core/src/presentation.ts`, `packages/adapters/src/presentation-pptx.ts`, `apps/api/src/presentation-export.ts`, `apps/web/src/components/DeckCard.tsx`, `apps/web/src/pages/Artifacts.tsx`.

- [x] M5-33-01 Extend versioned Deck schema **additively** for layout variants, theme, images and charts/diagrams as needed. Existing title/bullets/notes decks must continue to parse and export.
- [x] M5-33-02 Provide a small set of professional presentation design presets/reference choices before generation; persist the selected style as deck metadata. No speculative template marketplace.
- [x] M5-33-03 Render rich content to editable PPTX where practical; define graceful fallbacks for unsupported elements. Keep a single structured Deck source of truth, not independent slide models.
- [x] M5-33-04 Add actual deck preview in Artifact Library and maintain in-chat preview/download. Version/ownership permissions must match artifact storage.
- [x] M5-33-05 Implement deterministic Google Slides delivery from the stored deck using a scoped provider adapter (Slides API or PPTX import/convert as supported), **not a prompt asking the Bot to recreate the deck**. Bind actor, account, artifact version, idempotency, and external file receipt.
- [x] M5-33-06 Display pending/delivered/failed/unsupported accurately and only show a link when the external file exists. Do not automatically share publicly; keep provider optional.

**Code acceptance:** rich Deck works through schema → artifact → preview → PPTX and Google delivery where configured; no false-success export UI.

### 34 — Grok Bot daily interaction semantics (P2)
**Starting points:** `apps/web/src/pages/Shell.tsx`, `apps/web/src/pages/RoutineEditor.tsx`, `apps/web/src/pages/shell/routine-context-menu.tsx`, `apps/mobile/app/thread.tsx`, shared composer contracts.

- [x] M5-34-01 Align slash behavior with the **current pinned Grok Bot reference**: review whether typing `/` should remain plain text instead of opening Skills/Actions. Change web and mobile together only after confirming current reference semantics in documentation; retain an explicit alternative route for Skills/Actions.
- [x] M5-34-02 Align Routine row primary click versus context-menu actions (Pause, Resume, Test, Edit, Delete). Avoid a default click opening the editor if the current reference opens another destination; preserve accessibility and keyboard actions.
- [x] M5-34-03 Trace command palette, Bot Details, Routine scheduling and main navigation for dead actions, inconsistent entry points or duplicate state. Fix **confirmed code gaps**, not pixel styling.
- [x] M5-34-04 Web/Electron and mobile should share domain behavior while respecting native mobile interaction patterns. Keep UI minimal; do not add decorative chrome.

**Code acceptance:** action targets, navigation, keyboard/menu semantics and backend commands are wired and consistent with the chosen reference; visuals remain owner-reviewed.

### 35 — Mobile and artifact continuity (P2)
**Starting points:** `apps/mobile/lib/voice-memo.ts`, `apps/mobile/app/thread.tsx`, `apps/mobile/lib/voice.ts`, `apps/web/src/pages/Artifacts.tsx`.

- [x] M5-35-01 Recover a locally recorded-but-unsent voice memo after app restart where platform storage allows; store recoverable metadata and clean up only after confirmed submission/discard.
- [x] M5-35-02 Preserve artifact/message nonce and uploaded artifact identity across retries and reconnect; avoid orphan uploads and duplicate sends.
- [x] M5-35-03 Keep transcript playback/seek, retry states, attachment preview and error recovery consistent with shared contracts. Do not create separate domain logic per surface.
- [x] M5-35-04 Review deck/draft/project cards across mobile/web for status semantics and missing handler wiring. Unsupported platform features must be explicit rather than appearing successful.

**Code acceptance:** interruption and retry paths have durable ownership and clear outcomes; source-level lifecycle is complete.

### 36 — Code hygiene and M5 handoff (P2)
- [x] M5-36-01 Review changed code for authorization bypass, cross-tenant resource IDs, unapproved external actions, private artifact leakage, duplicate sends and misleading status.
- [x] M5-36-02 Remove new dead code, duplicated state and provider-specific coupling. Keep large shell/router files as thin as feasible without unnecessary refactors.
- [x] M5-36-03 Document differences that are **deliberate** (self-hosted Computer management, unavailable provider capabilities, native UX). Extra locales and Remove Computer are optional, **not required M5 scope**.
- [x] M5-36-04 Update this plan's log and M5 status in `STATE.md` when implementation begins/completes. Preserve M3/M4 release-gate statuses and historical checkboxes.
- [x] M5-36-05 Final code review only: inspect `git diff`, check integration call sites and error/permission paths, record limitations and a concise manual-check list for the owner. No tests or UI verification.

## Sequence and dependency

`32 → 33 → 34 → 35 → 36`. Phases 34/35 may be parallelized after shared contracts stabilize. Avoid simultaneous edits to `Shell.tsx`, `thread.tsx` or backend routing.

## Explicit exclusions

- No release/CI/E2E/device/test requirements in this M5 code-only plan.
- No pixel parity mandate, UI screenshots or automated visual comparisons.
- No rewrite of M1–M4, no automatic upstream merge, no new hosted vendor dependency.
- No claiming Grok Bot parity is runtime-proven.

## Implementation log (agent fills this during execution)

| Phase | State | Files changed / code evidence | Limitations |
|---|---|---|---|
| 32 Email | CODE COMPLETE | `draft-actions.ts`, `email-senders.ts`, `DraftActionCard.tsx`, mobile thread, `draft-binding.ts`, `executor.ts`, Composio/Pipedream adapters; actor-scoped account selection, Gmail capability validation, structured exact-payload send, receipt lifecycle and idempotent retry | Gmail send-as only where the live adapter can verify it. Dynamic Gmail tools provide Spam search/restore; restore remains approval-gated. Runtime/provider outcomes not verified. Emulator send receipts remain unknown. |
| 33 Presentations | CODE COMPLETE | `contracts/core presentation`, `presentation-pptx.ts`, `presentation-artifacts.ts`, `presentation-export.ts`, Google Slides adapter, delivery migration, web/mobile deck cards and Artifact Library preview | No embedded-image or freeform-diagram schema. Google Slides Markdown delivery does not preserve speaker notes or PPTX chart editability; provider may apply its own layout. Only a confirmed external file receipt yields a link. |
| 34 Daily UX | CODE COMPLETE | Web/mobile composer slash menus, `RoutineListRow`, `RoutineContextMenu`, Shell command palette and conversation details traced | Saved-skill slash picker remains; Settings and chat settings keep their existing routes. Mobile uses native routines/actions. Docs and changelog describe slash details differently; see handoff. |
| 35 Mobile continuity | CODE COMPLETE | `voice-memo.ts`, mobile thread recovery/send flow, native deck card, shared web deck/draft cards | Local memo recovery depends on app-private document storage surviving OS cleanup/uninstall. Runtime interruption/retry paths are not verified. |
| 36 Hygiene | CODE COMPLETE | Static diff and caller/callee review across changed API, adapter, contract, UI, and Prisma paths; Prisma client generated; typechecks passed | No unit/integration/E2E tests, CI, app, device, screenshot, or provider run was performed by design. M3 Phase 23 and M4 Phase 31 remain open. |

**Owner manual review later:** multi-account selection, Gmail send-as verification, Spam search/restore approval, explicit success/failure/unknown delivery receipts and duplicate prevention; legacy and chart decks in PPTX plus Google Slides delivery/versioning; routine click/context-menu keyboard actions and slash picker behavior; voice memo restart, transcript, retry/discard, and target switching; Artifact Library previews and card status across web/Electron/mobile. M5 is code-complete only; no runtime parity claim is made.
