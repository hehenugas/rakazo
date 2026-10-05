# Phase 01 Handoff — Desktop Shell Parity

## Current Status

DOING — tasks P01-01…P01-14 implemented and code-verified; P01-15…P01-17 pending CI artifacts (after-screenshots + regression verdict from the web e2e run).

## Owner

ZCode (GLM)

## Branch / Worktree

Local `main` (baseline `fd356375`) carrying the restored phase WIP, uncommitted; docs pushed to `origin/phase/00-bootstrap`.

## Shell inventory (P01-01)

- `apps/web/src/pages/Shell.tsx` (~7.6k lines) owns: bots sidebar (roster tree, sections, activity, Hidden Bots, footer), conversation header (window chrome, identity pill, computer button), transcript mount, right-panel routing (`right-panel-state.ts`: details/tasks/routines/library/computer/settings/routine/create/create-team-bot/create-group/group-settings), composer mount, overlays (plugins, command palette, context menus).
- Extraction boundaries used by the WIP: `shell/bot-panel.tsx` (Bot settings panel), `shell/bot-picker.tsx` (create picker), `shell/command-palette.tsx`, `shell/dialogs.tsx`, `shell/message-cards.tsx`. Deeper extraction is Phase 02+ work (Details hub) and must stay additive.
- Header responsibilities: collapsed-sidebar window chrome, navigation toggle, centered identity pill (details trigger), computer secondary affordance.

## Work Log

### 2026-10-04 — Planning initialized

- Phase packet created.
- No implementation work has started.

### 2026-10-05 — Phase claimed; WIP landing + gap implementation (ZCode/GLM)

- Claimed the phase; the restored planning WIP already implements P01-02…P01-09 and P01-12 (roster rows, Hidden Bots, top Search/New chat, header identity pill, Connect apps entry, shortcuts, derived presence).
- Implemented P01-10/P01-11: transcript and composer share a centered 55rem column on wide screens via `md:px-[max(<gutter>,calc((100%-55rem)/2))]` padding (no new DOM); computer panel and artifact surfaces stay outside the column so wide surfaces keep their width.
- Added `apps/web/e2e/shell-parity.spec.ts` (P01-13): top Search + New chat + shortcuts (Cmd/Ctrl+N/B/F), roster row + Hidden Bots archive flow, header identity → Conversation Details, footer → Connect apps dialog, and a 1728×960 computed-padding centering assertion.
- A11y pass (P01-14): roster/hidden rows and toggles are real buttons with `aria-expanded`/`aria-pressed`/`aria-label`; unread state has `sr-only` text; no new focus traps.

## Files / Modules Changed

- `apps/web/src/pages/Shell.tsx` — centered transcript/composer column (P01-10/11).
- `apps/web/e2e/shell-parity.spec.ts` — new (P01-13).
- Pre-existing WIP (restored, uncommitted) covering P01-02…P01-09/12: Shell.tsx sidebar/header, `shell/bot-picker.tsx`, `shell/bot-panel.tsx`, `PluginsOverlay.tsx`, `right-panel-state.ts`.

## Verification Run

| Suite | Command | Result |
|---|---|---|
| Typecheck | `pnpm check` | 22/22 tasks pass (2026-10-05) |
| Lint | `pnpm lint` | 0 errors; 19 warnings + 4 infos (pre-existing baseline) |
| Unit | `pnpm test` | 5829 passed / 6 failed / 174 skipped — all 6 documented baseline/environment failures, none from this phase's changes |
| E2E web | `pnpm test:e2e` | not run locally by maintainer instruction; `shell-parity.spec.ts` green verdict delegated to CI |

## Evidence / Screenshots

- Before: `.planning/evidence/phase-00/` (baseline sidebar, header, panels).
- After: `01-shell-sidebar-search`, `02-shell-hidden-bots`, `03-shell-conversation-details`, `04-shell-connect-apps`, `05-shell-centered-column` — produced by the CI web e2e run; to be linked here when the run finishes.

## Decisions Made During Phase

- Centering uses padding `calc` on the existing transcript/composer containers instead of a wrapper DOM node, so scroll behavior, existing `transcript` testid, and message percentage widths stay untouched.
- Presence (P01-05) stays derived: avatar `status` + run-derived activity line; no persistence added.

## Blockers

- P01-15…P01-17 need the CI web e2e artifacts (screenshots + green run) after this work is pushed.

## Discovered Follow-ups

- `Shell.tsx` remains very large; Phase 02's Details hub should continue extracting `shell/` modules additively.
- The archived-bot restore flow inside Hidden Bots could gain an explicit e2e once Phase 02 defines Details-level archive affordances.

## Next Recommended Task

1. Push this work, let the CI web e2e run, link the five after-screenshots, then check P01-15…P01-17 and the VERIFY items.
2. Then claim Phase 02: the planning WIP already carries Project/Task schema, contracts, and Conversation Details home — verify against P02-01…P02-18 and fill the gaps (deep links, lifecycle tests, screenshots).

## Final Summary

Not complete — pending CI artifacts for P01-15…P01-17.
