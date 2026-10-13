# Phase 27 Handoff — Email Action Parity

## Current Status

DOING — 2026-10-12 (Claude Code, Sonnet 5.5). Core flow verified locally; send-as and Spam are provider-dependent and not done.

## Branch

`m4-execution` (local, not pushed).

## Changes

- Core: `packages/core/src/email-draft.ts` (+test), `isEmailSendTool` in `action-approval.ts`.
- Contracts: `threads.submitDraftAction`; shared `DraftActionFieldsInput` in `rpc.ts`.
- API: `apps/api/src/draft-actions.ts` (+test); `router.ts` handlers delegate to it; `updateDraftAction` freezes non-draft cards.
- Adapters: `draft-binding.ts` (+test); one hook in `executor.ts` before the approval decision; `draft_action_create` tool text names the email keys; scripted runtime gets a formatted-email case.
- Web: `DraftActionCard.tsx` (typed validation, Preview, server submit); mobile `thread.tsx` now calls `threads/submitDraftAction` and no longer builds the prompt.

## New visible copy (AGENTS.md copy rule)

- "Preview": labels the rendered body, shown only when the body uses formatting; without a label the second rendering of the same text would read as a duplicate.
- "Required", "Invalid address", "No line breaks": per-field validation on an email draft; Send is disabled, so the reason must be next to the field.
- Existing: To/Cc/Subject/Body come from the Bot's field labels.
- Not extracted into `messages.po` (see Phase 26 D-26-5).

## Verification (local, `m4-execution` working tree)

- Unit: `email-draft.test.ts` (core), `draft-actions.test.ts` (api, 8), `draft-binding.test.ts` (adapters, 6), `DraftActionCard.test.tsx` (6), executor mock suite `executor-readonly-approval.test.ts` 46/46 including three new email-binding cases.
- Web e2e (harness): `draft-action` (3, incl. new formatted-email flow) and `parity/canonical-states` passed 22/22 together.
- Typecheck: all packages pass except `@rakazo/mobile#check`, which fails only in `expo install --check` (installed Expo patch versions; unrelated); `tsc --noEmit` for mobile is clean.
- Lint 0 errors. Unit failures in the touched packages are the 4 known host-dependent `computer-idle` / `desktop-runtime` tests.
- Not verified: real Gmail/Composio behavior (all provider calls are emulated or mocked).

## Known limits

- The binding is bypassed when the submit message steers an already-running run (that run's source message is not the draft message). The approval policy still applies there.
- Providers whose send tools use an argument shape the check does not recognize are refused ("not verifiable") for runs started from a draft; extend `emailArgsMismatch` keys per provider as needed.

## Upstream surface

`router.ts` (conflict file) lost the old handler body and gained two small handlers; `rpc.ts` gained a schema constant and one procedure; `executor.ts` (conflict file) gained one import and one hook; `events.ts` unchanged.

## Next recommended task

Phase 28 (slide decks and export).

## Code-first parity hardening follow-up — 2026-10-13

- `apps/api/src/draft-actions.ts` now requires exactly one actor-owned connection matching the draft provider and pins its connection id plus an opaque provider-account snapshot into the submitted card. `packages/adapters/src/draft-binding.ts` checks that account and snapshot are still valid; the executor narrows that run's connector context to the pinned account.
- Email draft fields are limited to `to`, `cc`, `bcc`, `subject`, and `body`; sender selection defaults to the provider account. Reply/forward drafts are rejected until their thread context is part of the approved snapshot. The binding rejects account, sender, attachment, reply/thread, alternate body, and unknown delivery arguments.
- `apps/api/src/thread-target.ts` now commits the submitted card, user message, task, run, and event atomically. The reserved draft nonce cannot be used by ordinary thread sends. A draft run must start a new run rather than steer an unrelated active one; ordinary non-draft runs are unchanged.
- In submitted-email runs, other consequential connector calls and browser/computer/shell actions require a fresh approval. Gmail label mutations also remain behind the consequential-action policy.
- Verification for this follow-up: source review and TypeScript checks only. No provider, unit, integration, E2E, CI, or device verification was run. Send-as aliases remain unsupported; default sender is used.
