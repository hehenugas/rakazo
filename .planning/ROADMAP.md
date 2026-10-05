# Roadmap

## Milestone M1 — Grok Bot Parity Foundation

| Phase | Name | Depends On | Status |
|---|---|---|---|
| 00 | Bootstrap & Baseline | — | TODO |
| 01 | Desktop Shell Parity | 00 | TODO |
| 02 | Conversation Details, Tasks & Projects | 01 | TODO |
| 03 | Routines, Library & Search | 01, 02 | TODO |
| 04 | Transcript Cards & Composer | 01, 02 | TODO |
| 05 | Sharing & Team Bots | 00, 02, 04 | TODO |
| 06 | Main Bot & Proactivity | 02, 05 | TODO |
| 07 | Connect Apps, X & Voice Memo | 03, 04 | TODO |
| 08 | Mobile Parity | 02–07 | TODO |
| 09 | Hardening & Release | 00–08 | TODO |

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
- `STATE.md` shows every phase as DONE
- Phase 09 release checklist is complete
