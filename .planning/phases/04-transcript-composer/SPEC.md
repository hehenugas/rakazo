# Phase 04 — Transcript Cards & Composer

## Objective

Turn the conversation timeline into an interactive workspace with a coherent card system instead of scattered special cases.

## Card System

Normalize visual and behavioral conventions for:

- approvals/questions
- tool activity summaries
- artifacts
- Skill drafts
- Routine creation/update
- Project/delegation events
- computer takeover
- calls/voice
- draft actions
- results/errors

## Draft Action

Introduce a provider-neutral editable outbound-action artifact suitable for Gmail, Outlook, Slack, and future providers.

Suggested conceptual fields:

- provider
- action
- editable fields
- preview
- approval metadata
- execution payload/reference
- state: draft / approved / executing / sent / failed / discarded

Sensitive provider credentials must never be serialized into transcript payloads.

## Composer

Keep attachments, mentions, slash/Skill behavior, reply/quote, dictation, and send behavior while simplifying visual hierarchy toward Grok.

## DONE Gate

Cards are consistent, draft actions are safely editable/executable, and existing composer functionality is regression-tested.
