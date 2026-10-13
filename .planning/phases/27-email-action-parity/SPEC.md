# Phase 27 — Email Action Parity

## Objective

Make a submitted email draft go out exactly as the user approved it, with typed, validated fields and a safe formatted preview, on top of the existing `DraftActionCard`/`draft_action` block. No new storage and no schema migration.

## Maintainer directive

All M4 phases were requested in one run; documented exception to the M3 Phase 23 dependency.

## Findings that shaped the design

- Before this phase, Send persisted `submitted` and then asked the client to send an execution *prompt*; the Bot re-interpreted the fields, so the delivered email could differ from the approved card, and a double click could start two runs (the nonce had a timestamp).
- Gmail runs through Composio/Pipedream connector tools; the app does not call Gmail directly, and the tool schemas live with the provider.

## Design

- **Typed email view in `@rakazo/core` (`email-draft.ts`).** Conventional field keys (`to`, `cc`, `bcc`, `subject`, `body`) get validation (recipient syntax, subject line breaks = header injection, required fields) and a plain-text body language (`#` headings, `**bold**`, `-`/`1.` lists, paragraphs). The body parses into a small tree rendered as React elements in the card and as escaped HTML for delivery; no raw HTML is ever accepted or rendered.
- **Server-side submit (`threads.submitDraftAction`).** Validates, freezes the fields with `submitted`, and starts the run from a server-built message with a stable nonce (`draft-action:<draftId>`), so the approved content is what the Bot is told, a repeat call is a no-op, and a failed start returns the card to a draft. `updateDraftAction` now refuses edits to submitted or discarded cards.
- **Delivery check at the tool boundary (`draft-binding.ts` + one executor hook).** A run that started from a submitted draft may only send that email: an email send/reply/forward connector call whose recipients, subject or body differ from the frozen draft (or whose arguments cannot be verified) is refused with an error before approval or execution. The check does not rewrite arguments, so approval and replay keys are unaffected. Other runs are unconstrained.
- **Provider-dependent items stay out.** No provider exposes send-as aliases or Spam handling through a contract here, so no From picker and no Spam action were added (never a fake control). Policy: add them as capabilities when a connector reports them.
