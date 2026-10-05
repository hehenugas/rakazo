# Phase 12 Checklist — Composer & Input Behavior Parity

## Status

DONE — ZCode (GLM)

## Tasks

- [x] P12-01 Inventory current textarea-based composer behavior against Phase 10 input matrix. (Composer = native textarea with chip row, mention/slash pickers, paste/drop attachments, voice memo entry; behaviors mapped to their specs — composer-paste, mention-picker-keyboard, message-quote, voice-memo, chat-progress-messages, draft-action.)
- [x] P12-02 Match composer container geometry, padding, radii, border, min/max height, and vertical growth. (Measured 880×52 at 1440×900 with auto-growth via scrollHeight; unchanged this phase — recorded in `shell-geometry.json`.)
- [x] P12-03 Match attachment/add control placement and menu behavior. (Attach control left of the input; paste/drop attachment flow verified by `composer-paste.spec.ts` and canonical `c5`.)
- [x] P12-04 Match voice, dictation, and voice-memo control placement and mutually exclusive states. (Record/Stop voice memo verified by `voice-memo.spec.ts` and canonical `c6`; dictation rides the same voice entry points.)
- [x] P12-05 Match send and stop button geometry, visibility, enabled/disabled state, and active feedback. (Send disabled when empty, stop visible while a run is active — canonical `c7` and the working-state capture.)
- [x] P12-06 Implement reference list-start behavior for dash and numbered-list prefixes when applicable. (Rechecked per P-006: the pinned public reference does not specify list-entry semantics, so nothing was implemented from memory; recorded as `?` in the matrix for the authenticated-capture pass.)
- [x] P12-07 Implement reference Shift+Enter behavior inside structured/list input. (Enter sends, Shift+Enter inserts a newline in the textarea — covered by canonical `c3` multiline and existing send tests; structured-list variants are not pinned by the reference and stay `?`.)
- [x] P12-08 Implement reference Tab/Shift+Tab nesting behavior while preserving ordinary focus behavior outside lists. (No list input exists to nest; Tab keeps default focus semantics — nothing actionable from pinned sources.)
- [x] P12-09 Match spellcheck behavior and native editing affordances. (Native textarea spellcheck stands — no override attribute; native selection/editing menus therefore match platform behavior.)
- [x] P12-10 Match text-selection Quote / Add to prompt interaction, placement, keyboard shortcut, and resulting composer state. (Verified by `message-quote.spec.ts`.)
- [x] P12-11 Match reply-target and selected-quote preview behavior. (Reply target + quote preview verified by `message-quote.spec.ts` and `group-chats.spec.ts`.)
- [x] P12-12 Match mention/skill chip appearance, insertion, deletion, picker navigation, and accessibility. (Chips with remove buttons, Backspace-to-remove, IME-safe mention keys, Enter/Tab completion — `mention-picker-keyboard.spec.ts`, `slash-skills.spec.ts`, canonical `c4`.)
- [x] P12-13 Match paste/drop attachments and deterministic attachment preview states. (`composer-paste.spec.ts` covers image paste, paste-with-text; canonical `c5` snapshot.)
- [x] P12-14 Match optimistic message-send appearance. (User message renders immediately on send — verified by the streaming/response specs.)
- [x] P12-15 Match delayed progress treatment so fast sends do not flash unnecessary progress chrome. (`chat-progress-messages.spec.ts` pins the delayed-progress behavior.)
- [x] P12-16 Match in-flight steering/send behavior while a Bot is already working. (Send remains available while a run is active; follow-up sends queue onto the working thread — canonical `c7` + `stuck-work.spec.ts` run lifecycle.)
- [x] P12-17 Verify Enter/Shift+Enter/Tab/Escape/Backspace/IME behavior with automated tests. (`mention-picker-keyboard.spec.ts` covers Enter/Tab/Escape including IME composition guards (keyCode 229); Backspace chip removal verified in code + spec; Enter/Shift+Enter in send path.)
- [x] P12-18 Verify draft state survives the same navigation/reload cases as the reference where observable. (Draft persists across in-session bot switches and resets on send/slash/skill; it does not survive reload — reference behavior unpinned, recorded as `?` in the matrix.)
- [x] P12-19 Add visual snapshots for empty, text, multiline, chip, attachment, voice, sending, and running composer states. (`apps/web/e2e/parity/composer-states.spec.ts`: c1 empty, c2 text, c3 multiline, c4 mention chip, c5 attachment, c6 voice recording, c7 running with stop — 7/7 against committed baselines.)
- [x] P12-20 Record zero undocumented input-behavior deltas in HANDOFF. (See HANDOFF deltas section.)

## Phase Verification

- [x] VERIFY-01 All mandatory tasks are checked.
- [x] VERIFY-02 Composer visual diffs pass. (Composer-states spec 7/7 against committed baselines, 2026-10-05.)
- [x] VERIFY-03 Keyboard and IME tests pass. (`mention-picker-keyboard.spec.ts` incl. IME guards; Enter/Shift+Enter/Backspace verified.)
- [x] VERIFY-04 No P0/P1 composer interaction delta remains. (Actionable behaviors verified; list-entry semantics unpinned by the reference and recorded, not guessed.)
- [x] VERIFY-05 HANDOFF.md and STATE.md are updated.

## DONE

- [x] Phase marked DONE — all verification items pass (2026-10-05).
