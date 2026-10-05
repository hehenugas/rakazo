# Phase 05 — Sharing & Team Bots

## Objective

Add safe Bot template sharing and a real Team Bot model with shared configuration plus actor-private interaction state.

## Template Sharing

Default M1 behavior:

- publishing creates a versioned snapshot
- importing creates an independent Bot
- snapshot contains intentional configuration only
- no credentials
- no computer state
- no private files
- no private memory
- no conversation history

## Team Bot Semantics

A Team Bot needs:

- shared identity/instructions
- owner/editor/member access
- shared Skills/files/connectors only when explicitly team-scoped
- team memory namespace
- per-user private conversation
- per-user private notes/memory
- actor-scoped personal connectors
- explicit execution/computer scope
- mappings for messaging DMs vs shared channels

Do not implement Team Bot as merely `bot.kind = team` while retaining one global visible thread.

## DONE Gate

Template security tests pass, two users can privately interact with the same Team Bot identity without conversation leakage, and shared-vs-private state boundaries are tested.
