# Phase 26 — Daily UX: palette, routines, composer, message color

## Objective

Make the high-frequency controls behave like the verified reference (v0.68.0–0.68.1) without new subsystems: reuse `CommandPalette`, `PluginsOverlay`, the routines endpoints, the existing composer pickers, and bot identity colors.

## Maintainer directive

All M4 phases were requested in one run; documented exception to the M3 Phase 23 dependency.

## Decisions

- **D-26-1 Routine click stays click-to-edit.** The changelog says right-click gives Pause/Resume/Test/Edit/Delete and that "clicking a routine no longer opens its detail view", but does not say what a click does instead. A plain click remains Edit so touch and keyboard users keep a path; the row menu is additive. M4-UX-002 is read as "the menu exists and works", not "click does nothing".
- **D-26-2 Slash picker kept, made keyboard operable.** The changelog says "/" no longer opens a menu; the skills docs still say skills are referenced with "/". With the semantics unverified, the existing picker stays (docs-compatible) and gains arrow/Enter/Tab/Escape handling so it can no longer swallow Enter into a literal "/…" message.
- **D-26-3 Bot-colored bubbles are web-only for now.** The reference does not state mobile applicability; the setting and the tint live on web/Electron. Mobile keeps neutral bubbles.
- **D-26-4 Contrast by construction.** Bubble text is black or white, whichever contrasts more with the Bot color, so body text is always ≥ 4.5:1 (unit-tested for every palette color in both themes). The bot color is identity data (like avatars), not a product token; no hex was added to `@rakazo/ui-tokens`.
- **D-26-5 No catalog extraction.** New strings are not extracted into the ten `messages.po` files to avoid widening the upstream merge-conflict set; Lingui falls back to the source text. Run `pnpm --filter @rakazo/web intl:extract` when the merge is planned.
