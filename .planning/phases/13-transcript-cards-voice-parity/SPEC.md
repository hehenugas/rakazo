# Phase 13 — Transcript, Cards & Voice Parity

## Objective

Make the conversation timeline itself feel like the pinned Grok Bot reference: content-first, heterogeneous when needed, and progressively disclosing technical machinery.

This phase inherits Phase 10 UI-SPEC.md.

## Scope

- user/assistant message geometry and metadata
- streaming and working states
- tool/activity disclosure
- approvals and full-request disclosure
- editable action drafts
- failed-send / retry / delete state
- attachments and artifact cards
- replies, reactions, quotes, mentions
- voice memo card with transcript, playback highlighting, and seek behavior
- error/loading/empty states

## Known Deltas To Recheck

- current voice memo card is primarily a native audio control without synchronized transcript highlighting
- current failed-send handling does not expose the same learned Resend/Delete treatment
- approval cards may expose more machinery than the current Grok reference
- M1 accepted the presence of transcript card types without exact card geometry/state parity

## Acceptance Criteria

Transcript states match the reference scorecard and technical activity remains progressively disclosed.

## DONE Gate

All canonical transcript cards pass screenshot, interaction, reload-persistence, and accessibility verification.
