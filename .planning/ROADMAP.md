# Roadmap

## Milestone M1 — Grok Bot Parity Foundation

| Phase | Name | Depends On | Status |
|---|---|---|---|
| 00 | Bootstrap & Baseline | — | DONE |
| 01 | Desktop Shell Parity | 00 | DONE |
| 02 | Conversation Details, Tasks & Projects | 01 | DONE |
| 03 | Routines, Library & Search | 01, 02 | DONE |
| 04 | Transcript Cards & Composer | 01, 02 | DONE |
| 05 | Sharing & Team Bots | 00, 02, 04 | DONE |
| 06 | Main Bot & Proactivity | 02, 05 | DONE |
| 07 | Connect Apps, X & Voice Memo | 03, 04 | DONE |
| 08 | Mobile Parity | 02–07 | DONE |
| 09 | Hardening & Release | 00–08 | DOING (release-candidate approval pending) |

## Phase Outcomes

### Phase 00 — Bootstrap & Baseline

Initialize the fork, preserve upstream remote, document baseline architecture, establish test commands, and capture before-state screenshots.

### Phase 01 — Desktop Shell Parity

Make the desktop app immediately feel Grok-like through navigation and layout changes without changing deep domain behavior.

### Phase 02 — Conversation Details, Tasks & Projects

Move Bot controls into a details hub and introduce first-class Tasks/Projects orchestration.

### Phase 03 — Routines, Library & Search

Reposition existing capabilities into the Grok mental model and add Bot-scoped Library views.

### Phase 04 — Transcript Cards & Composer

Turn the timeline into a first-class interactive workspace and add the generic draft-action system.

### Phase 05 — Sharing & Team Bots

Implement Bot template sharing and the multi-user Team Bot domain model.

### Phase 06 — Main Bot & Proactivity

Add one Main Bot per Space, proactive check-ins, and coordination behavior.

### Phase 07 — Connect Apps, X & Voice Memo

Productize integrations, add a first-class X capability pack, and ship voice memos.

### Phase 08 — Mobile Parity

Bring the new IA and key workflows to Expo mobile without forcing desktop layouts onto small screens.

### Phase 09 — Hardening & Release

Complete migration tests, security review, accessibility, performance, docs, release notes, and upstream-sync validation.

## Parallelization Notes

After Phase 01:

- Phase 03 and Phase 04 may run partially in parallel.
- Phase 05 can begin domain/schema design while Phase 04 UI cards are being finished.
- Phase 07 connector work can begin before Phase 06 if it does not touch Main Bot orchestration.
- Phase 08 should start only after the relevant desktop/domain contracts stabilize.

## Milestone Exit

M1 is complete only when:

- all phase checklists are fully checked
- all acceptance criteria pass
- `STATE.md` shows every M1 phase as DONE
- Phase 09 release checklist is complete

---

## Milestone M2 — Grok Bot UI/UX Parity

M2 closes the remaining “it has the feature, but it does not feel like Grok Bot” gap. Reference fidelity is measured from pinned public Grok Bot states rather than judged from memory.

| Phase | Name | Depends On | Status |
|---|---|---|---|
| 10 | Reference Lock & Visual Diff Foundation | 01–08 | DONE |
| 11 | Shell, Roster & Navigation Parity | 10 | DONE |
| 12 | Composer & Input Behavior Parity | 10, 11 | DONE |
| 13 | Transcript, Cards & Voice Parity | 10, 12 | DONE |
| 14 | Details, Connect Apps & Team Bot Parity | 10, 11, 13 | DONE |
| 15 | Main Bot & Work-Flow Feel Parity | 10, 13, 14 | DONE |
| 16 | Responsive Parity & M2 Release Gate | 11–15 | DOING (maintainer parity-review approval pending) |

## M2 Phase Outcomes

### Phase 10 — Reference Lock & Visual Diff Foundation

Pin the current public Grok Bot reference, build the canonical state matrix, measure geometry/interaction behavior, and establish deterministic screenshot + visual-diff gates.

### Phase 11 — Shell, Roster & Navigation Parity

Match the shell people see first: Search/New chat, coworker roster, Bot identity/status, avatars, conversation header, centered content geometry, sidebar states, and Connect apps entry.

### Phase 12 — Composer & Input Behavior Parity

Match composer geometry plus learned editing behavior: lists, keyboard semantics, selection/quote/add-to-prompt, mentions, attachments, voice controls, optimistic send, progress, and send/stop states.

### Phase 13 — Transcript, Cards & Voice Parity

Match message geometry, streaming/activity disclosure, approvals, editable drafts, failed-send retry/delete, artifacts, replies, and synchronized voice-memo transcript/playback.

### Phase 14 — Details, Connect Apps & Team Bot Parity

Match Conversation Details hierarchy, plugin discovery, Team Bot step flow/publish/managers, draft policy, and secure credential-request UX while preserving authorization and provider neutrality.

### Phase 15 — Main Bot & Work-Flow Feel Parity

Close user-visible orchestration gaps: event-aware Main Bot attention, message priority, delegated work status, Project/Task flow, stop cascading, retry/reopen, and notification deduplication.

### Phase 16 — Responsive Parity & M2 Release Gate

Verify the complete reference matrix across web, Electron, narrow desktop, and mobile; remove obsolete diff exceptions; run accessibility/performance/security/full-regression gates; obtain maintainer parity approval.

## M2 Exit

M2 is complete only when:

- phases 10–16 are DONE
- every canonical reference state has current evidence
- stable visual diffs are inside documented tolerances
- zero undocumented P0/P1 parity deltas remain
- keyboard and responsive flows match the pinned reference or have an explicit security/accessibility/native-platform exception
- Phase 16 full verification and maintainer parity review pass
