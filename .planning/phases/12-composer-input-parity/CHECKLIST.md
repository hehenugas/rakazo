# Phase 12 Checklist — Composer & Input Behavior Parity

## Status

TODO — unclaimed

## Tasks

- [ ] P12-01 Inventory current textarea-based composer behavior against Phase 10 input matrix.
- [ ] P12-02 Match composer container geometry, padding, radii, border, min/max height, and vertical growth.
- [ ] P12-03 Match attachment/add control placement and menu behavior.
- [ ] P12-04 Match voice, dictation, and voice-memo control placement and mutually exclusive states.
- [ ] P12-05 Match send and stop button geometry, visibility, enabled/disabled state, and active feedback.
- [ ] P12-06 Implement reference list-start behavior for dash and numbered-list prefixes when applicable.
- [ ] P12-07 Implement reference Shift+Enter behavior inside structured/list input.
- [ ] P12-08 Implement reference Tab/Shift+Tab nesting behavior while preserving ordinary focus behavior outside lists.
- [ ] P12-09 Match spellcheck behavior and native editing affordances.
- [ ] P12-10 Match text-selection Quote / Add to prompt interaction, placement, keyboard shortcut, and resulting composer state.
- [ ] P12-11 Match reply-target and selected-quote preview behavior.
- [ ] P12-12 Match mention/skill chip appearance, insertion, deletion, picker navigation, and accessibility.
- [ ] P12-13 Match paste/drop attachments and deterministic attachment preview states.
- [ ] P12-14 Match optimistic message-send appearance.
- [ ] P12-15 Match delayed progress treatment so fast sends do not flash unnecessary progress chrome.
- [ ] P12-16 Match in-flight steering/send behavior while a Bot is already working.
- [ ] P12-17 Verify Enter/Shift+Enter/Tab/Escape/Backspace/IME behavior with automated tests.
- [ ] P12-18 Verify draft state survives the same navigation/reload cases as the reference where observable.
- [ ] P12-19 Add visual snapshots for empty, text, multiline, chip, attachment, voice, sending, and running composer states.
- [ ] P12-20 Record zero undocumented input-behavior deltas in HANDOFF.

## Phase Verification

- [ ] VERIFY-01 All mandatory tasks are checked.
- [ ] VERIFY-02 Composer visual diffs pass.
- [ ] VERIFY-03 Keyboard and IME tests pass.
- [ ] VERIFY-04 No P0/P1 composer interaction delta remains.
- [ ] VERIFY-05 HANDOFF.md and STATE.md are updated.

## DONE

- [ ] Phase marked DONE only after all verification items pass.
