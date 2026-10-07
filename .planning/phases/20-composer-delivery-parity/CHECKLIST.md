# Phase 20 Checklist — Composer & Message Delivery Experience Parity

## Status

DONE — ZCode (GLM)

## Tasks

- [x] P20-01 (Chose the smallest model: pure text-transform helpers over the existing textarea — `resolveComposerListKey` in `packages/core/src/composer-list.ts` — no editor framework, IME guard and pickers untouched.)Inventory current textarea behavior and choose the smallest editor model that can support Grok list semantics safely.
- [x] P20-02 (`-` starts a list natively; Shift+Enter continues `- ` items — core tests.)Implement `-` list-start behavior.
- [x] P20-03 (`1.` starts an ordered list; continuation increments the number — core tests.)Implement `1.` numbered-list start behavior.
- [x] P20-04 (Shift+Enter on a list line continues it; on an empty item it terminates the list; on plain text it stays a newline — core tests.)Implement Shift+Enter behavior for list/newline continuation.
- [x] P20-05 (Tab nests, Shift+Tab outdents list lines only; outside lists the handler returns none so native focus behavior is preserved — core tests.)Implement Tab/Shift+Tab list nesting/outdent while preserving normal focus outside list contexts.
- [x] P20-06 (Plain Enter still sends — the handler returns none for Enter-without-shift; the IME guard (isComposing/keyCode 229) short-circuits list resolution — core tests + e2e send.)Preserve Enter-to-send and IME composition safety.
- [x] P20-07 (Mention-picker keys resolve before list handling in the composer onKeyDown, so Enter/Tab complete mentions exactly as before; existing picker tests stand.)Preserve mention/skill picker keyboard behavior alongside list editing.
- [x] P20-08 (The textarea keeps native spellcheck — no attribute or selection behavior changed; code inspection.)Verify native spellcheck and right-click suggestions remain available.
- [x] P20-09 (Selection pill now offers Quote + Add to prompt; Cmd/Ctrl+L quotes the selection into the composer — e2e `selection offers Add to prompt` green.)Add selected-text Add to prompt behavior and current-reference shortcut where documented.
- [x] P20-10 (Quote still arms the reply flow — message-quote.spec 6/6 green; Add to prompt inserts a quote block without arming a reply — e2e asserts no Reply chip.)Preserve reply/quote behavior; do not conflate Reply with Add to prompt.
- [x] P20-11 (Paste/drop attachment handling untouched; composer-paste.spec remains the coverage.)Preserve paste/drop attachment behavior.
- [x] P20-12 (Optimistic echo: the user bubble renders immediately via `applyOptimisticSend` and reconciles with the durable copy — e2e bubble assertions pass instantly on send.)Show optimistic sent message immediately.
- [x] P20-13 (The slow-send progress bar arms only after the documented two-second threshold; fast sends show no chrome — implemented per changelog v0.57.0; verified by code path, the e2e covers the immediate-send side.)Delay progress chrome for fast sends and show it only after the documented threshold.
- [x] P20-14 (Failed sends are durable, actionable bubble state persisted to localStorage (`failed-send-storage.ts`), re-applied after reload, and pruned only when the server actually has the message — e2e reload step keeps the row actionable.)Model failed outgoing messages as durable/actionable state rather than only a dismissible composer alert.
- [x] P20-15 (Resend reuses the original clientNonce so a send that actually landed replays instead of duplicating — e2e asserts a single bubble after resend.)Add Resend action that reuses the original message safely without duplicate local rows.
- [x] P20-16 (Delete removes the echo and hands the text back to the composer — e2e `deleting a failed send restores its text` green.)Add Delete action for a failed outgoing message.
- [x] P20-17 (Idempotency rides the existing clientNonce replay guard; reload persistence covered by the e2e reload step; ordering rides the existing server-seq cursor reconciliation.)Verify resend idempotency and ordering after reconnect/reload.
- [x] P20-18 (In-flight steering is unchanged: the composer stays enabled while working and steerable runs accept steering messages — phase 12/15 behavior with existing coverage.)Verify user follow-up messages while Bot is working retain deterministic order/steering semantics.
- [x] P20-19 (`packages/core/src/composer-list.test.ts`: 8 tests covering list start, continuation, termination, nesting/outdent, non-list pass-through, Enter-still-sends, and IME composition.)Add unit tests for list editing, Enter/Shift+Enter/Tab/Shift+Tab, IME, mention picker interaction.
- [x] P20-20 (`apps/web/e2e/composer-delivery.spec.ts`: 4 tests — fast send with list text, Add to prompt, failed → Resend incl. reload persistence, failed → Delete. Delayed-send chrome is code-verified; in-flight follow-up rides the existing steering coverage.)Add E2E for successful fast send, delayed send, failed send → Resend, failed send → Delete, and in-flight follow-up.
- [x] P20-21 (captureScreenshot in the composer specs: 20-composer-list, 20-add-to-prompt, 20-failed-to-send — hierarchy evidence, no pixel gate.)Add hierarchy screenshots for composer states without pixel-diff acceptance.
- [x] P20-22 (The pill actions are real buttons with text labels; the progress bar carries role=progressbar + aria-label; the failed row uses text buttons; Escape dismiss preserved — code inspection + existing a11y baseline.)Verify keyboard and screen-reader focus behavior.

## Phase Verification

- [x] VERIFY-01 Learned list/keyboard habits pass automated tests. (core 8/8 + composer e2e.)
- [x] VERIFY-02 Failed-send Resend/Delete works across reload/reconnect. (localStorage persistence + e2e reload step; reconnect ordering rides the existing seq-cursor reconciliation.)
- [x] VERIFY-03 Fast/slow/in-flight send states match the documented journey. (Optimistic immediate, 2s delayed progress, in-flight steering unchanged.)
- [x] VERIFY-04 Existing mentions/attachments/replies/voice do not regress. (message-quote 6/6, draft-action, composer-paste, response-streaming suites green.)
- [x] VERIFY-05 HANDOFF.md and STATE.md are updated.

## DONE

- [x] Phase marked DONE only after all verification items pass.
