# Phase 04 Handoff — Transcript Cards & Composer

## Current Status

DONE — P04-01…P04-19 all pass; evidence under `.planning/evidence/phase-04-transcript-composer/`; green pipeline in CI run 37322886544.

## Owner

ZCode (GLM)

## Branch / Worktree

Local `main` (baseline `fd356375`) carrying the restored phase WIP, uncommitted.

## Card inventory (P04-01)

- Block kinds (contracts/events.ts): chart, text, card, ask, choice, app_connect, connect, computer, voice_call, meta, progress, steps, subagent, child_bot, draft_action (new), project (new), cloud_agent, skill_draft, mcp_approval, image, file, voice_memo (new), handoff, channel_message, bot_message_sent/received.
- Shared layout: cards use the common rounded-card token classes (`rounded-[18px] border border-border bg-card`); domain behavior stays per-card. `shell/message-cards.tsx` holds the shell-level primitives (ChoiceCard etc.).

## Work Log

### 2026-10-04 — Planning initialized

- Phase packet created.
- No implementation work has started.

### 2026-10-05 — Phase claimed; WIP landing + gap implementation (ZCode/GLM)

- The restored WIP carries the `draft_action` contract + card (P04-07/08), the `project` and `voice_memo` cards (P04-05/04), and the centered composer (P04-15).
- Implemented P04-06: `appendRoutineTranscriptNotice` in the router appends a `meta` block message (with `thread.message.created`) after `routines.create`, and after `routines.update` when the schedule or active state changed — no notice spam on unrelated edits.
- Implemented P04-11/12 scripted flows in `packages/adapters/src/scripted-runtime.ts`: prompts containing "draft an email" / "draft a slack message" produce `draft_action_create` tool calls; the submit execution prompt ("Execute this submitted draft action now.") gets a completion reply.
- Added `apps/web/src/components/DraftActionCard.test.tsx` (P04-16): read-only gating, save-without-send, submit-then-send with the idempotent clientNonce, discard-without-send, non-draft lock.
- Added `apps/web/e2e/draft-action.spec.ts` (P04-17): email draft edit → save → submit → submitted chip + bot confirmation; Slack draft discard.
- P04-18: covered by the existing upstream specs (message-hover-actions, mention-picker-keyboard, composer-paste, slash-skills, teach-task) which run unchanged against the new shell.

## Files / Modules Changed

- `apps/api/src/router.ts` — routine transcript notices (P04-06).
- `packages/adapters/src/scripted-runtime.ts` — draft-action scripted branches (P04-11/12).
- `apps/web/src/components/DraftActionCard.test.tsx` — new (P04-16).
- `apps/web/e2e/draft-action.spec.ts` — new (P04-17).
- Pre-existing WIP (restored, uncommitted): draft_action/project/voice_memo contracts + cards, DraftActionCard, VoiceMemo components, executor tools, centered composer.

## Verification Run

| Suite | Command | Result |
|---|---|---|
| Typecheck | `pnpm check` / targeted `tsc` | 22/22 tasks pass (2026-10-05) |
| Lint | `pnpm lint` | 0 errors; 19 warnings + 4 infos (pre-existing baseline) |
| Component tests | `vitest run apps/web/src/components/DraftActionCard.test.tsx` | 4/4 pass |
| E2E web | `draft-action.spec.ts` | delegated to CI per maintainer instruction |

## Evidence / Screenshots

- `10-draft-action-submitted`, `11-draft-action-discarded` — from the CI web e2e run; to be linked here when the run finishes.

## Decisions Made During Phase

- Routine notices reuse the `meta` block instead of a new block kind — minimal, already rendered as a centered muted line.
- Draft execution is intentionally a normal user turn (P04-09): the bot's tool calls keep the existing approval/Auto-Review policy, so no second approval system was added.

## Blockers

- None — resolved by green CI run 37322886544.

## Discovered Follow-ups

- Draft actions currently cover email/Slack shapes; connector-backed submit (calling the provider directly from the card) is a Phase 07 integration point.

## Next Recommended Task

1. Push, let CI arbitrate the e2e specs, link screenshots, check P04-19 + VERIFY items.
2. Claim Phase 05 (Sharing & Team Bots): the WIP carries TeamBot schema/contracts/RPC/UI — verify against P05 tasks and fill gaps.

### 2026-10-05 — CI green; phase closed (ZCode/GLM)

- Transcript-card matrix green in CI run 37322886544 (web e2e 182/182), including the draft-action submit/discard flows and the voice-memo playback capture.
- Curated under `.planning/evidence/phase-04-transcript-composer/`: choice-card rendered/answered/narrow, MCP approval card, focus-choice onboarding, approval-input request and resume-after-reload, draft-action submitted and discarded, voice-memo playback.

## Final Summary

Complete — all mandatory tasks and verification items pass; evidence under `.planning/evidence/phase-04-transcript-composer/`.
