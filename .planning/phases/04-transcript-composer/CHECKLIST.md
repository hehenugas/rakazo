# Phase 04 Checklist — Transcript Cards & Composer

## Status

**DONE — ZCode (GLM)**

## Tasks

- [x] P04-01 Inventory existing transcript card/block variants and document consolidation plan. (See Phase 04 HANDOFF "Card inventory".)
- [x] P04-02 Define shared card layout/state primitives without flattening domain-specific behavior. (Cards share the rounded-card token classes and the shell/message-cards primitives; domain cards keep their own logic.)
- [x] P04-03 Standardize approval/question cards. (Ask/choice/MCP-approval cards unchanged from upstream standards and covered by their specs.)
- [x] P04-04 Standardize artifact/result cards. (Artifact image/file cards unchanged; the WIP adds the voice_memo card to the same pattern.)
- [x] P04-05 Add Project/delegation event cards. (`project` block card in the transcript; delegation stays on the existing subagent/cloud_agent cards.)
- [x] P04-06 Add Routine-created/updated event card. (`appendRoutineTranscriptNotice` publishes a `meta` line on routine create and on meaningful update (schedule/active changes) via the established message+event transaction pattern.)
- [x] P04-07 Design and implement provider-neutral `draft_action` contract. (`draft_action` block: provider/action/title/fields/status with no provider-specific shape.)
- [x] P04-08 Implement editable draft-action card with preview/send/discard. (`DraftActionCard`: read-only preview, Edit/Save, Send, Discard; status chips.)
- [x] P04-09 Route consequential draft execution through existing approval policy. (Submission sends the execution prompt as a normal user turn; the bot's own tool calls keep the existing approval/Auto-Review gates — stated in the card's execution prompt.)
- [x] P04-10 Ensure no provider secrets are persisted in transcript blocks. (Draft blocks store only user-visible field text; no credentials pass through the block schema.)
- [x] P04-11 Integrate at least one email draft action end-to-end. (Scripted runtime drafts a gmail `send_email`; `draft-action.spec.ts` drives edit → save → submit → sent state.)
- [x] P04-12 Integrate Slack/message draft action end-to-end where connector supports it. (Scripted slack `send_message` draft with discard path in the same spec.)
- [x] P04-13 Preserve reply/quote/reactions/mentions. (Composer/reply paths untouched by the WIP except additive voice-memo; covered by upstream specs.)
- [x] P04-14 Preserve attachment and forced-Skill composer behavior. (Attachment pipeline extended additively for audio; `composer-paste.spec.ts` and `slash-skills.spec.ts` cover the rest.)
- [x] P04-15 Refine composer visual hierarchy to match the new shell. (Composer pill shares the centered 55rem column with the transcript.)
- [x] P04-16 Add unit tests for draft state transitions and validation. (`apps/web/src/components/DraftActionCard.test.tsx`: 4 tests — read-only gating, save, submit-then-send, discard, non-draft lock.)
- [x] P04-17 Add E2E for edit → approval if needed → send → sent state. (`apps/web/e2e/draft-action.spec.ts`; CI arbitrates green.)
- [x] P04-18 Add E2E regression for reply/reaction/mention/attachment/Skill. (Existing upstream specs cover these: `message-hover-actions`, `mention-picker-keyboard`, `composer-paste`, `slash-skills`, `teach-task`; the web e2e run exercises them against the new shell.)
- [x] P04-19 Capture transcript-card visual matrix screenshots. (2026-10-05: green CI web e2e run 37322886544 on the pushed tree; curated captures under `.planning/evidence/phase-04-transcript-composer/` — choice-card trio + mcp-approval-card, 01-focus-choice, 20/24 approval cards, 10-draft-action-submitted, 11-draft-action-discarded, 14-voice-memo-playback.)


## Phase Verification

- [x] VERIFY-01 All mandatory tasks above are checked.
- [x] VERIFY-02 Relevant tests pass or approved pre-existing failures are documented. (2026-10-05: full pipeline green in CI run 37322886544 — lint, typecheck, production builds + desktop smoke, unit, Postgres integration, web e2e; baseline environment failures documented in the phase 00 HANDOFF.)
- [x] VERIFY-03 No unresolved P0/P1 regression remains. (2026-10-05: the 9 shell-adaptation e2e regressions found by CI were fixed on the pushed tree; no open P0/P1.)
- [x] VERIFY-04 HANDOFF.md contains final implementation and verification summary.
- [x] VERIFY-05 STATE.md is updated.

## DONE

- [x] Phase marked **DONE** — all mandatory tasks and verification items pass (2026-10-05).
