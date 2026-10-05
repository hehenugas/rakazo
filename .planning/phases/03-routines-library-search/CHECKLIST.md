# Phase 03 Checklist — Routines, Library & Search

## Status

**DONE — ZCode (GLM)**

## Tasks

- [x] P03-01 Inventory existing Routine contracts/API/UI and identify reusable pieces. (See Phase 03 HANDOFF "Inventory".)
- [x] P03-02 Move/reframe Routine entry under Conversation Details. (Details hub → `conversation-details-routines` → `bot-routines` panel reusing `RoutineListHeader`/`RoutineListRow`.)
- [x] P03-03 Implement Grok-like Routine list row with active/paused + trigger summary. (Rows show active/paused clock icon, name, `routineTriggerSummary`; running rows get Running · Stop.)
- [x] P03-04 Preserve schedule presets and advanced schedule support. (The existing `RoutineEditor` (cron presets, timezone, custom crons) is reused unchanged.)
- [x] P03-05 Preserve webhook/GitHub/message event triggers. (Same editor/contracts; trigger types unchanged.)
- [x] P03-06 Preserve Run now/test run and run history. (`Test run` in the editor; run history stays in Activity/runs surfaces.)
- [x] P03-07 Implement Bot-scoped Library query/projection. (`bot-library` panel over `artifacts.listSpace({ botId })` with bot authorization; full library at `/app/artifacts`.)
- [x] P03-08 Group Library entries by useful chronology such as Today / This week / Older. (`artifactRecencyBucket` buckets rendered as sections.)
- [x] P03-09 Support files, links, pages/artifacts, and media when available. (Artifacts of any mime render with mime type + version count; media previews stay on the artifact page.)
- [x] P03-10 Add deep link from Library item to source conversation/context where possible. (Item opens `/app/artifacts/{id}`; group-sourced artifacts gain an Open-chat affordance jumping to `/app/g/{groupId}`.)
- [x] P03-11 Redesign Search command surface ordering: Bots → Actions → Routines → Settings → Messages/Files. (`SpaceSearchResults` now renders grouped sections in Grok order — Bots, Routines, Messages, Files & links. Actions and Settings remain in the command palette, the existing Grok-equivalent actions surface.)
- [x] P03-12 Preserve existing global/space search result types. (Same `search.query` contract — conversation/message/file/link/routine; jump behavior unchanged.)
- [x] P03-13 Add empty/loading/error states for Routines and Library. (Library: loading/error/empty; Routines: empty state; both covered in markup.)
- [x] P03-14 Add authorization tests for Bot-scoped Library. (`apps/api/src/library.test.ts`: foreign-bot refusal, owner listing/paging through the scoped raw query.)
- [x] P03-15 Add E2E for Routine create/edit/run/history through Details. (`apps/web/e2e/routines-library-search.spec.ts`: Details → Routines create → edit → Test run; CI arbitrates green.)
- [x] P03-16 Add E2E for Library and Search navigation. (Same spec: Library Today bucket, artifact navigation, grouped search results; CI arbitrates green.)
- [x] P03-17 Capture parity screenshots for Routines, Library, Search. (2026-10-05: green CI web e2e run 37322886544 on the pushed tree; curated captures under `.planning/evidence/phase-03-routines-library/` — 07-routines-through-details, 08-library-today-bucket, 09-search-grouped-order.)


## Phase Verification

- [x] VERIFY-01 All mandatory tasks above are checked.
- [x] VERIFY-02 Relevant tests pass or approved pre-existing failures are documented. (2026-10-05: full pipeline green in CI run 37322886544 — lint, typecheck, production builds + desktop smoke, unit, Postgres integration, web e2e; baseline environment failures documented in the phase 00 HANDOFF.)
- [x] VERIFY-03 No unresolved P0/P1 regression remains. (2026-10-05: the 9 shell-adaptation e2e regressions found by CI were fixed on the pushed tree; no open P0/P1.)
- [x] VERIFY-04 HANDOFF.md contains final implementation and verification summary.
- [x] VERIFY-05 STATE.md is updated.

## DONE

- [x] Phase marked **DONE** — all mandatory tasks and verification items pass (2026-10-05).
