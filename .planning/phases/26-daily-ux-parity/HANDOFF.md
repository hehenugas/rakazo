# Phase 26 Handoff — Daily UX

## Current Status

DOING — 2026-10-12 (Claude Code, Sonnet 5.5). Implementation verified locally on web; P26-05 and CI open.

## Branch

`m4-execution` (local, not pushed).

## Changes

- Palette: `apps/web/src/pages/shell/command-palette.tsx`, `command-palette-plugins.ts(+test)`, `PluginsOverlay.tsx` (`initialDetail`), Shell wiring (`loadPluginCatalog`, `pluginsDetail`).
- Routines: `shell/routine-context-menu.tsx`, `RoutineEditor.tsx` (`onContextMenu` on the row), Shell (`routineMenu`, `runRoutineMenuAction`, list error line).
- Bubble color: `packages/core/src/bot-avatar-colors.ts` (`botBubbleColors`, `contrastRatio`), `apps/web/src/lib/accent-to-black.ts`, `styles.css` (`.bot-bubble`), `AccountSettingsOverlay.tsx` switch, Shell `chatAccent` → `Transcript` → `MessageView`.
- Slash picker keyboard handling in the Shell composer (reuses `resolveMentionPickerKey`).

## New visible copy (AGENTS.md copy rule)

- "Connect apps" (palette group heading): existing product term; needed to say what the plugin rows are; hiding it would leave bare app names mixed with bots.
- "Resume" (row menu): the paired action to the existing "Pause"; removing it would leave a paused routine with no way back from the menu.
- "Accent to Black" (settings switch): the reference's own label for turning the Bot color off; it is the only control for the feature.
- "Could not update routine": error shown in the routines list when a menu action fails; silent failure would be worse.
- Existing strings reused: Pause, Test run, Edit, Delete, "Actions for …".
- Not extracted into `messages.po` (D-26-5).

## Verification (local, commit `m4-execution` working tree)

- `pnpm --filter @rakazo/web check` clean; `pnpm exec biome check .` 0 errors.
- Unit: `bot-avatar-colors.test.ts` (4), `command-palette-plugins.test.ts` (3), `accent-to-black.test.ts` (3), existing `apps/web/src/pages/shell` tests pass.
- Web e2e (harness, Chromium): the related set (composer, routine, command-palette, ui-appearance, slash, accent, mention, parity, draft, avatar specs) passed 60 of 61 on the first run; the one failure was my new routine-menu test (waiting on a stale list); after adding a wait for the list to reflect the pause, `routine-crud`, `command-palette`, `slash-skills` and `message-accent` passed twice (12/12 each).
- Full e2e suite not re-run in this phase.

## Open

- P26-05 narrow desktop, non-English locale, screen-reader checks.
- Electron e2e (CI virtual display).
- Mobile bubble color/menu not done (D-26-3; mobile routine actions are already pause/resume/delete per docs).

## Upstream surface

`Shell.tsx` (conflict file) gained ~120 lines across new state, the menu mount, palette props, slash keys and bubble props; `RoutineEditor.tsx` (conflict file) gained a small prop. New logic lives in new files to keep merges small.

## Next recommended task

Phase 27 (structured email payload, approved = delivered).
