# Phase 03 Handoff — Routines, Library & Search

## Current Status

DOING — P03-01…P03-16 implemented and code-verified; P03-17 (screenshots) pending CI artifacts.

## Owner

ZCode (GLM)

## Branch / Worktree

Local `main` (baseline `fd356375`) carrying the restored phase WIP, uncommitted.

## Inventory (P03-01)

- Routines: contracts (`RoutineSchema`, crons/timezone/notify/webhook/github/messageProvider), RPC (`routines.create/update/list/delete/testRun`), UI (`RoutineEditor`, `RoutineListHeader`, `RoutineListRow` with active/paused + trigger summary), execution via the existing worker. Everything reusable — Phase 03 only repositions the entry point.
- Library: `artifacts.listSpace` (space+user scoped raw query with cursor pagination, bot filter) existed; the WIP adds the Bot-scoped `bot-library` panel with chronology buckets.
- Search: `search.query` (conversation/message/file/link/routine) with debounced sidebar search and jump-to-hit; the WIP keeps the contract and adds grouping.

## Work Log

### 2026-10-04 — Planning initialized

- Phase packet created.
- No implementation work has started.

### 2026-10-05 — Phase claimed; repositioning + gap implementation (ZCode/GLM)

- Details hub entry points for Routines and Library were already in the restored WIP (P03-02).
- Implemented P03-11: `SpaceSearchResults` renders grouped sections in Grok order (Bots → Routines → Messages → Files & links). Actions and Settings stay in the command palette, which is the existing Grok-equivalent actions surface — result kinds and jump behavior unchanged (P03-12).
- Implemented P03-10: Library items open the artifact page as before; artifacts sourced from a group chat gain an Open-chat affordance navigating to `/app/g/{groupId}`.
- Added `apps/api/src/library.test.ts` (P03-14): foreign-bot Library refusal; owner listing returns grouped family rows with version counts and no cursor when exhausted.
- Added `apps/web/e2e/routines-library-search.spec.ts` (P03-15/16): Details → Routines create/edit/Test run; Library Today bucket + artifact navigation; grouped search results.

## Files / Modules Changed

- `apps/web/src/pages/SpaceSearch.tsx` — grouped section rendering + `bot-search-results` testid.
- `apps/web/src/pages/Shell.tsx` — Library group-chat affordance (P03-10).
- `apps/api/src/library.test.ts` — new (P03-14).
- `apps/web/e2e/routines-library-search.spec.ts` — new (P03-15/16).

## Verification Run

| Suite | Command | Result |
|---|---|---|
| Typecheck | `pnpm check` / targeted `tsc` | 22/22 tasks pass (2026-10-05) |
| Lint | `pnpm lint` | 0 errors; 19 warnings + 4 infos (pre-existing baseline) |
| New API tests | `vitest run apps/api/src/library.test.ts apps/api/src/projects.test.ts` | 9/9 pass |
| E2E web | `routines-library-search.spec.ts` | delegated to CI per maintainer instruction |

## Evidence / Screenshots

- `07-routines-through-details`, `08-library-today-bucket`, `09-search-grouped-order` — from the CI web e2e run; to be linked here when the run finishes.

## Decisions Made During Phase

- Search section order covers the kinds the backend produces; Actions/Settings intentionally remain in the command palette rather than duplicating command entries into search results.
- Library item click keeps the artifact page as primary destination (stable across versions); the group-chat jump is a secondary affordance.

## Blockers

- P03-17 needs the CI web e2e artifacts after this work is pushed.

## Discovered Follow-ups

- Message-search hits could gain an inline snippet highlight in a later polish pass.

## Next Recommended Task

1. Push, let CI arbitrate the e2e specs, link screenshots, check P03-17 + VERIFY items.
2. Claim Phase 04 (Transcript Cards & Composer): the WIP already carries DraftActionCard, VoiceMemo components, and block contracts — verify against P04 tasks and fill gaps.

## Final Summary

Not complete — pending CI artifacts for P03-17.
