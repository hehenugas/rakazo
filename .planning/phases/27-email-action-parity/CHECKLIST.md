# Phase 27 Checklist — Email Action Parity

## Status

DOING — Claude Code (Sonnet 5.5), branch `m4-execution`, 2026-10-12. Verified locally (unit, executor-level mock, web e2e). No CI, no real Gmail.

## Tasks

- [x] P27-01 Map current draft/preview/send behavior. (Generic `fields`; Send = persist `submitted` then client-built prompt via `threads.send`; see SPEC findings.)
- [x] P27-02 Structured email payload with editable accessible preview and safe fallback. (Typed view of to/cc/bcc/subject/body in `email-draft.ts`; card shows per-field errors with `aria-invalid`, a formatted Preview when the body uses formatting, plain text otherwise. Attachments and a sender field are not modelled: no provider contract for them.)
- [x] P27-03 Approved payload equals delivered payload; no silent formatting loss; no HTML exposure. (`submitDraftAction` + `draft-binding.ts` executor check; unit tests in `draft-actions.test.ts`, `draft-binding.test.ts`, `email-draft.test.ts`; executor-level mock tests in `executor-readonly-approval.test.ts`. Limitation: a message that steers an already-running run is not bound, since that run did not start from the draft.)
- [ ] P27-04 Gmail send-as. — NOT DONE (provider-dependent): no connector contract in this repo reports aliases, so no From picker exists. Unblock: a connector capability that lists authorized send-as addresses.
- [ ] P27-05 Spam handling. — NOT DONE (provider-dependent): the Composio tool set is provider-owned; the offline emulator only filters the `SPAM` label. Unblock: confirm the provider tool and keep the inbox move behind the existing email approval policy.
- [x] P27-06 Tests for recipient mutation, draft edits, idempotency, malicious HTML, retry. (Unit + component + e2e `draft-action.spec.ts` incl. invalid recipient, one `submitDraftAction` request, frozen card; parity screenshot unchanged. Not covered: partial delivery, OAuth scope and reconnect (provider-side), mobile presentation beyond switching to the same RPC.)

## Phase Verification

- [ ] VERIFY-01 P27-04 and P27-05 open (provider-dependent).
- [ ] VERIFY-02 No CI, no real provider.

## DONE

- [ ] Phase not DONE.
