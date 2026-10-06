# Phase 20 Checklist — Composer & Message Delivery Experience Parity

## Status

TODO — unclaimed

## Tasks

- [ ] P20-01 Inventory current textarea behavior and choose the smallest editor model that can support Grok list semantics safely.
- [ ] P20-02 Implement `-` list-start behavior.
- [ ] P20-03 Implement `1.` numbered-list start behavior.
- [ ] P20-04 Implement Shift+Enter behavior for list/newline continuation.
- [ ] P20-05 Implement Tab/Shift+Tab list nesting/outdent while preserving normal focus outside list contexts.
- [ ] P20-06 Preserve Enter-to-send and IME composition safety.
- [ ] P20-07 Preserve mention/skill picker keyboard behavior alongside list editing.
- [ ] P20-08 Verify native spellcheck and right-click suggestions remain available.
- [ ] P20-09 Add selected-text Add to prompt behavior and current-reference shortcut where documented.
- [ ] P20-10 Preserve reply/quote behavior; do not conflate Reply with Add to prompt.
- [ ] P20-11 Preserve paste/drop attachment behavior.
- [ ] P20-12 Show optimistic sent message immediately.
- [ ] P20-13 Delay progress chrome for fast sends and show it only after the documented threshold.
- [ ] P20-14 Model failed outgoing messages as durable/actionable state rather than only a dismissible composer alert.
- [ ] P20-15 Add Resend action that reuses the original message safely without duplicate local rows.
- [ ] P20-16 Add Delete action for a failed outgoing message.
- [ ] P20-17 Verify resend idempotency and ordering after reconnect/reload.
- [ ] P20-18 Verify user follow-up messages while Bot is working retain deterministic order/steering semantics.
- [ ] P20-19 Add unit tests for list editing, Enter/Shift+Enter/Tab/Shift+Tab, IME, mention picker interaction.
- [ ] P20-20 Add E2E for successful fast send, delayed send, failed send → Resend, failed send → Delete, and in-flight follow-up.
- [ ] P20-21 Add hierarchy screenshots for composer states without pixel-diff acceptance.
- [ ] P20-22 Verify keyboard and screen-reader focus behavior.

## Phase Verification

- [ ] VERIFY-01 Learned list/keyboard habits pass automated tests.
- [ ] VERIFY-02 Failed-send Resend/Delete works across reload/reconnect.
- [ ] VERIFY-03 Fast/slow/in-flight send states match the documented journey.
- [ ] VERIFY-04 Existing mentions/attachments/replies/voice do not regress.
- [ ] VERIFY-05 HANDOFF.md and STATE.md are updated.

## DONE

- [ ] Phase marked DONE only after all verification items pass.
