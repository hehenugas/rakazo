# Phase 12 — Composer & Input Behavior Parity

## Objective

Make composing, editing, attaching, quoting, mentioning, speaking, sending, and stopping work feel the same as the pinned Grok Bot reference.

This phase inherits Phase 10 UI-SPEC.md.

## Scope

- composer geometry and control order
- rich list-entry behavior for dash/numbered lists when present in the reference
- Shift+Enter and Tab list semantics
- spellcheck and editing behavior
- text selection to Quote / Add to prompt flow
- mentions, skill chips, attachments, paste/drop
- voice, dictation, and voice-memo entry points
- optimistic send and delayed progress treatment
- send/stop states while a run is active
- keyboard semantics, IME safety, draft preservation, errors

## Acceptance Criteria

A Grok Bot user can operate the composer with the same learned keyboard and pointer habits without discovering fork-specific behavior.

## DONE Gate

Composer reference states and keyboard journeys pass visual and behavioral parity tests.
