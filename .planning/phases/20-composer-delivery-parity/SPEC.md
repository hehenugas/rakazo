# Phase 20 — Composer & Message Delivery Experience Parity

## Objective

Make composing, editing, sending, retrying, and steering a Bot feel like Grok Bot without requiring an identical visual implementation.

## Target Behavior

- `-` and `1.` start bulleted/numbered list editing
- Shift+Enter adds an item/new line in the expected structured context
- Tab nests a list item; Shift+Tab outdents where appropriate
- Enter still sends when the learned Grok behavior says it should
- misspelling uses native/browser spellcheck semantics
- selected transcript text can be added to the prompt with the learned action/shortcut
- sent messages appear immediately
- delayed delivery progress appears only when delivery is not quick
- failed sends expose Failed to send with Resend and Delete
- user can continue messaging while a Bot is working without corrupting ordering

## Constraints

Preserve IME safety, mentions, skill chips, attachments, replies/quotes, voice/dictation, and accessibility.

## DONE Gate

Common Grok composer habits work without relearning, and failed/slow/in-flight delivery states have equivalent action semantics.
