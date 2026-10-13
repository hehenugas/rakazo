# Phase 26 Checklist — Daily UX

## Status

DOING — Claude Code (Sonnet 5.5), branch `m4-execution`, 2026-10-12. Web verified locally (Playwright, Chromium); Electron e2e not run (CI only).

## Tasks

- [x] P26-01 Command palette finds plugins; Enter opens the plugin page. (`command-palette-plugins.ts` + `CommandPalette` Connect apps group + `PluginsOverlay initialDetail`; unit `command-palette-plugins.test.ts`; e2e `command-palette.spec.ts` "finds a plugin and Enter opens its page" with screenshots.)
- [x] P26-02 Routine row context menu. (`shell/routine-context-menu.tsx`, `RoutineListRow onContextMenu`, Shell wiring; Pause/Resume/Test run/Edit/Delete reuse `routines.update/testRun/remove`; Delete goes through the existing confirm dialog; errors show in the list. e2e `routine-crud.spec.ts` "right-clicking a routine…". See D-26-1.)
- [x] P26-03 Slash/mention/skill/list/IME/Enter behavior. (Audit: mention, list and IME handling already covered by `composer-mention-picker.test.ts`, `mention-picker-keyboard.spec.ts`, `composer-delivery.spec.ts`. Added keyboard operation to the slash picker; e2e `slash-skills.spec.ts` "operable from the keyboard". Reference semantics for "/" remain unverified, D-26-2.)
- [x] P26-04 Bot-themed user bubble and Accent to Black. (`botBubbleColors`/`contrastRatio` in `@rakazo/core` with AA tests for all colors and both themes; `lib/accent-to-black.ts` + test; settings switch; CSS class `.bot-bubble`; e2e `message-accent.spec.ts`. Web only, D-26-3.)
- [ ] P26-05 Mouse, keyboard, narrow desktop states, localization. — Partial: mouse + keyboard (Escape/Enter) covered in e2e; no narrow-desktop run of the new controls, no non-English locale run, no screen-reader audit.
- [x] P26-06 Screenshots and web e2e per flow. (Screenshots: `command-palette-plugin`, `command-palette-plugin-page`, `routine-row-menu`, `message-accent-bot-color`, `message-accent-to-black`. Electron e2e is CI-only.)

## Phase Verification

- [ ] VERIFY-01 P26-05 open.
- [ ] VERIFY-02 CI not run.

## DONE

- [ ] Phase not DONE.
