# Phase 01 Checklist — Desktop Shell Parity

## Status

**DOING — ZCode (GLM)**

## Tasks

- [x] P01-01 Inventory current Shell/sidebar/header responsibilities and identify extraction boundaries. (See Phase 01 HANDOFF "Shell inventory".)
- [x] P01-02 Implement top Search action replacing persistent sidebar search field. (`sidebar-search-trigger` toggles the on-demand `sidebar-search` input; no persistent search field in the sidebar. Covered by `shell-parity.spec.ts`.)
- [x] P01-03 Implement top New Chat action/surface without losing existing Bot/group creation. (`create-menu-trigger` popover → bot picker with new Bot, Team Bot, group, space entries; Cmd/Ctrl+N.)
- [x] P01-04 Convert Bot rows into coworker-roster rows with avatar, status/activity preview, unread/attention state. (Roster rows: 38px BotAvatar with status, timestamp, title chip, derived activity line, unread dot + sr-only label.)
- [x] P01-05 Add derived Bot presence model without unnecessary persistence. (Presence derives from existing Bot.status + run/work state at render time; no new tables or columns.)
- [x] P01-06 Add collapsible Hidden Bots section and map existing archive/hide semantics safely. (Collapsible "Hidden Bots" section with count and aria-expanded, backed by the existing archive lists; covered by e2e.)
- [x] P01-07 Replace footer `Integrations` entry with `Connect apps` product surface entry. (Footer button opens the plugins overlay, retitled "Connect apps".)
- [x] P01-08 Simplify conversation header and make Bot identity the Conversation Details trigger. (Centered identity pill `bot-settings-trigger` opens the details panel; covered by e2e.)
- [x] P01-09 Keep computer access available as a secondary affordance. (Header Monitor button toggles the computer panel; transcript keeps onOpenComputer affordance.)
- [x] P01-10 Center ordinary transcript/composer content on wide desktop screens. (Shared 55rem centered column via max() padding on transcript and composer; verified by e2e computed-padding assertion at 1728×960.)
- [x] P01-11 Preserve intentional wide overflow for tables/artifacts/computer where required. (Computer panel and artifact surfaces live outside the centered column; message cards/tables keep their own widths and scroll.)
- [x] P01-12 Implement/verify keyboard shortcuts for Search, New Chat, current-chat search, sidebar, and Bot switching where compatible. (Cmd/Ctrl+N create, Cmd/Ctrl+B sidebar, Cmd/Ctrl+F sidebar search, command-palette hotkey for search/switching; covered by e2e.)
- [x] P01-13 Add/update E2E coverage for sidebar, header, New Chat, Search, Hidden Bots, Connect apps entry. (`apps/web/e2e/shell-parity.spec.ts`, 4 tests; CI run arbitrates green.)
- [x] P01-14 Verify keyboard/focus accessibility. (Code-verified: real buttons, aria-label/aria-expanded/aria-pressed, sr-only unread labels, ui-web focus rings; no focus traps introduced.)
- [ ] P01-15 Capture before/after desktop screenshots and record them in HANDOFF. (Before = `.planning/evidence/phase-00/`; after = screenshots from the `shell-parity.spec.ts` CI run — pending CI artifacts.)
- [ ] P01-16 Verify narrow web/mobile viewport does not regress. (Responsive classes in place (`md:hidden` overlays, mobile sidebar); pending CI web run for regression verdict.)
- [ ] P01-17 Final visual review against current Grok Bot reference. (Pending after-screenshots from CI.)


## Phase Verification

- [ ] VERIFY-01 All mandatory tasks above are checked.
- [ ] VERIFY-02 Relevant tests pass or approved pre-existing failures are documented.
- [ ] VERIFY-03 No unresolved P0/P1 regression remains.
- [ ] VERIFY-04 HANDOFF.md contains final implementation and verification summary.
- [ ] VERIFY-05 STATE.md is updated.

## DONE

- [ ] Phase marked **DONE** only after all verification items pass.
