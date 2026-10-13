# M4 Execution Plan — Grok Bot Feature & Experience Parity

Status: EXECUTED ON LOCAL BRANCH `m4-execution` (2026-10-12), NOT COMPLETE — see `.planning/phases/31-m4-release-gate/HANDOFF.md`
Prepared: 2026-10-11
Baseline fork: `ca1dc816` on `main`
Owners: future executing agents (claim work explicitly)
Reference: public Grok Bot documentation and changelog (pin version/date during Phase 24)
Execution entry point: this document, then phase `SPEC.md`, `CHECKLIST.md`, `HANDOFF.md` created by the executing agent.

## Objective

Bring Rakazo closer to Grok Bot's *learned product experience*, including newer public changes after the M3 reference capture, while completing the remaining validated M3 issues. Preserve self-hosting, provider-neutral AI/runtime, shared cross-platform contracts, privacy, and upstream-syncability. Exact pixels, proprietary assets, and copying private source code are explicitly out of scope.

**Important:** M3 Phase 23 remains DOING. This document does **not** mark M3 or M4 complete, reset `.planning/STATE.md`, replace M3 `.planning/REQUIREMENTS.md`, or waive any unchecked Phase 23 gate. Before executing implementation phases, resolve Phase 23 or have the maintainer explicitly approve a documented, narrowly scoped dependency exception. Phase 24 reference/baseline audit may run before Phase 23 closes, read-only.

## Inputs and evidence

Read in this order:

1. `AGENTS.md`, `.planning/PROJECT.md`, `.planning/ROADMAP.md`, `.planning/STATE.md`, `.planning/AGENT-PROTOCOL.md`, `.planning/DECISIONS.md` if present.
2. `.planning/phases/17-experience-parity-contract/EXPERIENCE-SPEC.md` and `JOURNEY-MATRIX.md`.
3. `.planning/phases/23-experience-release-gate/JOURNEY-AUDIT.md`, `CHECKLIST.md`, `HANDOFF.md`.
4. Current public primary references: `https://docs.x.ai/grok-bot/overview`, `https://docs.x.ai/grok-bot/bots`, `https://docs.x.ai/grok-bot/skills-routines-and-automations`, `https://docs.x.ai/grok-bot/team-bots`, `https://docs.x.ai/grok-bot/mobile`, `https://x.ai/changelog/bot`.
5. Actual implementation and tests. Never infer missing functionality from a planning checkbox or a grep miss.

### Initial findings (audit seeds, **not** verified absence)

- M3 Phase 23 audit says Electron, mobile on-device, accessibility, measured performance, and green full CI verification remain open.
- Project child work can serialize behind Team Computer execution leases; Cloud Agents are not included in parent-stop cascade. Main Bot event attention can take about 30 seconds.
- Mobile lacks voice memo recording, playback transcript seek/highlight, project status cards in thread, and full Team Bot management (recorded as P2).
- Web `DraftActionCard.tsx`, `pages/shell/command-palette.tsx`, `PluginsOverlay.tsx`, `RoutineEditor.tsx`, and `project-control.ts` already exist. Inspect and extend these first.
- Official changelog changes from after the M3 pinned v0.66.0 reference should be audited individually; possible targets: slide decks with export, formatted email drafting/delivery, Gmail send-as, plugin search from command palette, routine context menu, accent/message color treatments, Slack user-group mention, composer slash behavior, Gmail Spam handling. **Do not claim any specific feature is currently missing or promise exact semantics until Phase 24 verifies current official sources.**
- Historical upstream merge-tree audit predicted 29 conflicting paths; redo calculation against current upstream before integrating, never blindly merge.

## Severity and acceptance language

P0: security/privacy/data loss or unauthorized act; P1: primary Grok journey cannot be completed or materially wrong ownership/cancel/send behavior; P2: friction, secondary functionality or presentation; P3: cosmetic.
MUST: required release gate; SHOULD: expected barring documented constraints; MAY: optional/provider-dependent feature.
Each gap must have: dated primary source, exact reference behavior, local code pointers, status (absent/partial/different/present/unverified), severity, owner phase, platform matrix, reproduction/test, and documented security/provider exceptions.

## Cross-cutting engineering rules

- Keep shared API contracts, orchestration, provider translation, and authorization in packages/backend. Web/Electron share UI. Expo uses native patterns and may deliberately differ where platform conventions require it.
- Reuse existing features before building new subsystems. `DraftActionCard` is the starting point for editable drafts; command palette and `PluginsOverlay` for plugin search; existing Routines for context actions; Project and Cloud Agent models for orchestration.
- No direct provider-specific credentials in UI or tests; use OAuth/secure form, existing secret boundaries, user scope and least privilege. Multi-user isolation tests are mandatory for every new team/agent action.
- No xAI-only dependencies. No mandatory hosted vendor. Provider-specific export/email/transcription availability must degrade explicitly and safely.
- No fake controls. Actionable entry points must have success, blocked, loading, retry, offline/reconnect and destructive-confirmation states. Keyboard, focus, screen reader and mobile touch targets matter.
- No hidden unattended destructive actions. Approvals remain authoritative. Cancellation is idempotent and actor-scoped; background work cannot escape a stop through orphan child runs.
- Produce real end-to-end evidence for main journeys and representative screenshots for changed web UI; screenshots document hierarchy, not pixel-perfect diffs. Do not invent reference imagery.
- Minimize invasive edits to `Shell.tsx` / `router.ts` / schema; extract cohesive modules where justified. Track upstream conflicts per phase.
- Do not run real Electron desktop e2e on maintainer workstation; use CI virtual display. No test or CI claim without recorded command/commit/result.
- Before any PR, review tracked diffs for secrets/personal data; do not push without maintainer direction. No implementation changes in the planning-only task that created this document.

## Phase map

| Phase | Title | Depends | Deliverable | Initial priority |
|---|---|---|---|---|
| 24 | Current Reference, Baseline & Scope Lock | read-only; 23 for final scope sign-off | dated source matrix, code audit, requirements, zero-assumption backlog | P0 |
| 25 | M3 Completion & Runtime Reliability | 23, 24 | completed release gates, delegation/cancel/performance reliability | P0/P1 |
| 26 | New Composer, Navigation & Routine UX | 24, 25 | command palette, routine actions, slash/input, accents | P2 |
| 27 | Structured Email Actions & Gmail Parity | 24, 25 | formatted draft, preview/edit/approve/send, send-as/spam where supported | P1 |
| 28 | Slides & Artifact Export Workflow | 24, 25 | create/preview/export editable slides; provider-neutral formats | P1 |
| 29 | Mobile Capability & Voice Gap Closure | 24, 25; relevant 26–28 contracts | native voice memos, project/Team Bot UX and verified mobile journeys | P1/P2 |
| 30 | Messaging/Integration Edge Parity | 24, 25, 27 | Slack mentions and remaining provider-specific behaviors | P2 |
| 31 | M4 Cross-Platform Release & Upstream Gate | 25–30 | full CI/E2E/security/accessibility/perf/migration evidence and approval | P0 |

Phase ordering is a proposed execution sequence, not permission to mark tasks done. Execute phases 26–28 in parallel only if file and migration ownership is disjoint and Phase 25 stability gate is met.

## Phase 24 — Reference lock and baseline (audit only)

**Goal:** Prevent speculative parity work.

- [ ] P24-01 Record dated official Grok Bot changelog/documentation versions and exact URLs. Look at changes **after** the M3 v0.66.0 snapshot through latest publicly available at audit time, not only a remembered version.
- [ ] P24-02 Make `REFERENCE-MATRIX.md`: each concrete change, steps/labels/state/ownership, platform applicability, source+date and strength of evidence. If docs are unclear label `unverified`, not `missing`.
- [ ] P24-03 Compare every matrix entry to local implementation, test and screenshot evidence; classify present/partial/absent/not-applicable/provider-dependent. Audit the command palette, routine menu, message colors, draft action, email, slide artifacts, Gmail, Slack.
- [ ] P24-04 Capture canonical UI journeys on local web/Electron where feasible, mobile evidence on a simulator/device where available. Use user-owned authorized references only; never copy proprietary assets.
- [ ] P24-05 Create `M4-REQUIREMENTS.md` and `M4-ACCEPTANCE-MATRIX.md` with one acceptance test per MUST; include policy choices for unsupported integrations.
- [ ] P24-06 Read current Phase 23 gate results and refresh git/upstream divergence/conflict analysis; no merge in this phase.
- [ ] P24-07 Obtain scope confirmation or record reference uncertainties; prioritize verified P0/P1 before P2/P3.

**Exit:** every implementation item has a source+code evidence pair; no unsupported feature assumptions remain in mandatory scope.

## Phase 25 — Finish M3 and harden work orchestration

**Goal:** Close known operational gaps without replacing existing Project engine.

- [ ] P25-01 Resolve Phase 23 pending keyboard/Electron, device, accessibility, performance, CI, and maintainer review. Link actual artifacts; keep M3 status truthful.
- [ ] P25-02 Reproduce same-Team-Computer child serialization; choose minimal safe scheduler/lease design; preserve isolation and fair resource limits. Verify parent + child complete/block/retry without deadlock.
- [ ] P25-03 Audit project stop cascade across task, run, subagent, Cloud Agent; make stop follow **owned** descendants, never unrelated work. Add cancel races, authorization, idempotency and orphan-child tests.
- [ ] P25-04 Add canonical project/run/transcript state consistency and reconnect tests, including stuck/failed partial delegation and approval-pending.
- [ ] P25-05 Measure Main Bot event latency and project-card reconciliation (including current scan over recent messages). Optimize only with before/after metrics; retain dedup and actor isolation.
- [ ] P25-06 Fix inherited CI blockers where needed or document maintainers' approved baseline waivers; no blanket green claim. Check migration upgrade from populated pre-M3 schema.
- [ ] P25-07 Recheck upstream changes for overlapping fixes; minimize future merge conflict surfaces.

**Exit:** stable parent/child work lifecycle; Phase 23 gate closed or explicit recorded exception; full relevant regression evidence; zero known P0/P1.

## Phase 26 — Daily UX: palette, routines, composer, message theme

**Goal:** Make high-frequency shortcuts and controls behave like the verified reference.

- [ ] P26-01 Extend existing `pages/shell/command-palette.tsx` with search plugins and accessible results/navigation if reference verifies it, reusing `PluginsOverlay.tsx`.
- [ ] P26-02 Audit routine row context interactions and add real right-click menu only when supported by the reference; options (pause/resume, test, edit, delete) must reuse existing routines endpoints and protect destructive operations.
- [ ] P26-03 Verify slash key, mention, skill, list, IME and Enter behavior against latest docs. Avoid resurrecting superseded slash-to-skill UI; add keyboard tests.
- [ ] P26-04 Implement validated bot-themed user bubble and Accent-to-Black behavior via semantic `@rakazo/ui-tokens`, not hardcoded product colors; preserve contrast and dark mode.
- [ ] P26-05 Test mouse, keyboard and narrow desktop states for menu focus/escape/close, disconnected/error/pending state, localization.
- [ ] P26-06 Evidence: screenshot and web/Electron E2E for each actionable flow; no pixel matching mandate.

**Exit:** all documented high-frequency UX journeys supported with accessible interactions; no existing composer regressions.

## Phase 27 — Email action parity and Gmail-specific extensions

**Goal:** Reuse draft action system for edit/approve/send, with true rich-content fidelity and strict credential permissions.

- [ ] P27-01 Inspect `DraftActionCard.tsx`, actions data contracts and current email integration. Map current draft/preview/send behavior before designing new schema.
- [ ] P27-02 When supported by Grok reference, use structured email payload (To/Cc/Bcc/subject, plain+sanitized rich body, attachments, account/sender identity) with editable accessible preview and safe fallback.
- [ ] P27-03 Ensure a human-verified final payload equals the delivered payload; plain-text fallback, HTML sanitization, no silent formatting loss, no provider-specific HTML exposure to other users.
- [ ] P27-04 Verify Gmail send-as aliases; show only addresses returned/authorized by provider, handle denied/invalid alias and reconnect. Treat unsupported providers as capabilities, never fake a send-as field.
- [ ] P27-05 Verify any new Spam handling behavior from official source; scope read/search/move appropriately, obtain approval for consequential actions.
- [ ] P27-06 Test recipient mutations, draft edits, provider failures, partial delivery, idempotency, malicious HTML, OAuth scope, reconnect/retry and mobile presentation.

**Exit:** user edits + approves formatted draft and sent email reflects approved content, or capability clearly states unsupported; no unauthorized sending.

## Phase 28 — Slide decks and artifact export

**Goal:** Make slides an end-to-end artifact workflow rather than a decorative preview.

- [ ] P28-01 Pin exact public Grok slide-deck interaction and supported PowerPoint/Google Slides export semantics from Phase 24, including editability and permissions.
- [ ] P28-02 Design a format-neutral `PresentationArtifact` model/version lifecycle within existing artifact infrastructure (not a second storage system). Reuse project/agent runtime to produce editable structured slides.
- [ ] P28-03 Provide readable in-chat/deck preview, progress, failure/retry, and accessible edit/download affordances. No fake export buttons.
- [ ] P28-04 PowerPoint `.pptx` generation must preserve editable text/shapes to the extent supported; verify openability and layout with deterministic tests. Avoid claiming pixel-identical export.
- [ ] P28-05 Google Slides requires explicit user connection, authorized upload/create, link return, error recovery, and no silent public sharing. If unavailable, disable with honest state, not a placeholder integration.
- [ ] P28-06 Test export of 1 and many slides, fonts/images, overflow, provider outage, storage quota, access control, and mobile viewing; ensure artifact ownership and retention rules.

**Exit:** real slide-deck creation/preview/export to at least the source-verified, supported destinations with compatibility and security tests; explicit, approved provider-dependent exclusions.

## Phase 29 — Mobile functionality and voice experience

**Goal:** Reach documented mobile capability split with native UI rather than compressing desktop.

- [ ] P29-01 Verify native voice memo recording + microphone permission/denial, send/play/retry, secure file upload and lifecycle across backgrounding.
- [ ] P29-02 Show transcript and synchronized highlight/seek when timings exist; provide plain transcript or audio-only fallback when provider has no timing. Add timing-shape contract tests and, where available, real provider validation.
- [ ] P29-03 Surface Project plan/status/progress/blocker/cancel in mobile thread; match parent-child ownership and avoid contradictory status.
- [ ] P29-04 Complete mobile Team Bot actions **only** when documented as mobile supported; keep publish/config owner authorization safe, use native sheets/actions.
- [ ] P29-05 Verify mobile Routine, approvals, Connect apps, composer drafts, app background/reconnect and private Team Bot conversations end to end.
- [ ] P29-06 Test on actual iOS/Android simulator/device CI with evidence for permission prompts, VoiceOver/TalkBack, dynamic text and gesture behavior; do not mark done on typecheck alone.

**Exit:** every mobile reference journey is tested on device/simulator or marked blocked with reason and cannot pass release gate.

## Phase 30 — Integrations and messaging edge cases

**Goal:** Close independently verified newer Grok behaviors without letting vendor logic leak into core.

- [ ] P30-01 Verify Grok's Slack user-group mention behavior; map team/user-group authorization, visibility, API requirements, ambiguous names and approval gates.
- [ ] P30-02 Extend messaging adapters with capability-based user-group mention, escaping/injection protection and fallback; avoid treating a display label as an authorized ID.
- [ ] P30-03 Reassess remaining plugin behavior changes discovered in Phase 24 (discovery, login continuation, error/reconnect, Spam workflows) and implement only unowned gaps.
- [ ] P30-04 Integration tests for missing scopes, disconnected accounts, personal/team ownership, recipients and replay/idempotency.
- [ ] P30-05 Capture provider capability and security documentation so unavailable account features have explicit disabled/alternative paths.

**Exit:** validated integration behavior with tested authentication, actor scoping, and graceful unsupported-provider behavior.

## Phase 31 — Final release gate

- [ ] P31-01 Every approved reference-matrix MUST mapped to a green test/evidence and all P0/P1 defects closed.
- [ ] P31-02 Full typecheck, lint, unit, Postgres integration, E2E, migration-upgrade and platform CI green (or specific maintainer-approved pre-existing waiver).
- [ ] P31-03 Electron E2E on CI virtual display; mobile critical journeys on supported devices; security, accessibility and performance evidence.
- [ ] P31-04 Verify failure/recovery cases: reconnect, app restart, duplicated events, timed out sends, cancellations, interruption and approval race.
- [ ] P31-05 Upstream merge-tree checked; sync strategy explicitly approved; any conflicts resolved with test coverage and no regressions.
- [ ] P31-06 Screenshot documentation for all material UI changes; no exact-pixel requirement.
- [ ] P31-07 Release notes, migrations, known unsupported capabilities, provider requirements and roll-back notes updated.
- [ ] P31-08 Maintainer end-to-end experience approval documented and only then update `.planning/STATE.md` / phase statuses to DONE.

**Exit:** feature + journey parity is independently demonstrable; no false DONE state.

## Executing-agent protocol

For **each** phase (24–31):

1. Before coding, create `.planning/phases/NN-slug/SPEC.md`, `CHECKLIST.md`, and `HANDOFF.md` with tasks above translated into small deliverable slices; include current discovered constraints and requirement IDs. Follow `.planning/AGENT-PROTOCOL.md` and `AGENTS.md`.
2. Claim owner, branch/worktree and active task. Keep Phase 23 unchanged unless actually closing it. Use separate commits/PRs per coherent slice; don't interleave agents editing the same shared files.
3. For each task, record `code path → user journey → automated test → verification result`. Checkbox means *verified*, not “code written.”
4. Test main/negative paths and authorization boundaries. Capture screenshot links if UI changed; CI-generated Electron screenshots instead of local focus-stealing tests.
5. Update `HANDOFF.md` before stopping with changes, tests, evidence, blockers, follow-ups and precise next action. Mark DONE only after acceptance gate passes and update state + handoff in same commit.
6. If reference behavior contradicts this plan, current official primary sources and user-approved experience goals win; update requirement/matrix before implementation. Do not guess proprietary implementation details.
7. If unable to finish, leave clearly labeled unchecked tasks, not optimistic statuses. Never self-approve the maintainer release gate.

## Work-start recommendation

1. Review/finish existing Phase 23 release blockers (do not redefine them as M4 done).
2. Start **Phase 24, read-only** to lock newest Grok behavior and confirm actual local gaps.
3. Implement **Phase 25** for orchestration/cancellation reliability.
4. Split **26–28** into independently reviewable workstreams, then 29–30.
5. Close only with Phase 31 and actual CI/device/maintainer evidence.

## Source links

- https://docs.x.ai/grok-bot/overview
- https://docs.x.ai/grok-bot/bots
- https://docs.x.ai/grok-bot/skills-routines-and-automations
- https://docs.x.ai/grok-bot/team-bots
- https://docs.x.ai/grok-bot/mobile
- https://x.ai/changelog/bot

This is a **planning artifact**, not a completion claim. No implementation, test execution, release approval, or upstream merge is implied.
