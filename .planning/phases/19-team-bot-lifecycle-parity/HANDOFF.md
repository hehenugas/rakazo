# Phase 19 Handoff — Team Bot Publish & Shared Setup Parity

## Current Status

DONE — all 20 tasks and 5 verification items pass (2026-10-06).

## Owner

ZCode (GLM)

## Branch / Worktree

Local `main` (fork).

## Work Log

### 2026-10-06 — Phase implemented and verified (ZCode/GLM)

**Schema + migration**
- `team_bots.status` (`draft` | `published` | `unpublished`, default `draft`); migration `20261006090000_team_bot_publish` backfills existing rows to `published` so pre-lifecycle team bots keep working for their members.

**Contracts**
- `TeamBotStatusSchema` + `TeamBot.status`; `teamBots` rpc gains `createFromBot`, `update`, `publish`, `unpublish`, `remove`.

**API (`apps/api/src/router.ts`)**
- `create`: owner-only draft — no auto-granting membership to the space.
- `createFromBot`: Copy Bot (identity/profile/instructions/color from the source personal bot) vs Start fresh (blank setup); refuses team instances; never touches conversation, memory, files, or credentials.
- `update`: owner-only; propagates identity fields to every member instance in one transaction.
- `publish`/`unpublish`: owner-only status flips; unpublish keeps member instances intact.
- `remove`: owner-only; destroys every member instance through the existing `destroyBot` machinery, then deletes the template (DB cascade removes memberships).
- `open`: draft = owner only; unpublished = existing members keep their instance (chats/routines return on republish); published = any space member lazily joins (member row + private instance, P2002-safe).

**Web**
- `SharePanel` (new `shell/team-bot-panel.tsx`): Share row now opens a panel with Publish to Team (Copy Bot / Start fresh) and the template download.
- `SharedSetupForm`: owner edits shared name/title/description/instructions → `teamBots.update` with propagation.
- Details hub: owner status block at the top (Draft/Published/Unpublished + Publish/Unpublish + Edit shared setup).
- Picker: Draft badge for owner drafts (non-owners only ever receive published entries).

**Tests**
- `apps/api/src/team-bots.test.ts`: lifecycle authorization suite (draft/unpublished open refusals, owner gating, publish/unpublish, propagation).
- `apps/web/e2e/team-bot-publish.spec.ts`: owner journey (Start fresh → draft → setup → publish → unpublish) + Copy Bot identity carry-over.

## Verification Run

| Suite | Result |
|---|---|
| turbo check (22 tasks) | 22/22 |
| Unit: api/adapters/core/web/testkit | green; 1 pre-existing environment failure (`desktop-runtime`, verified on the clean tree) |
| E2E (local harness) | team-bot-publish 2/2, team-bots 1/1 |

## Decisions Made During Phase

- Existing team bots backfill to `published` — behavior-preserving for current deployments; only new creations start as drafts.
- Teammate first-open of a published team bot lazily creates membership + instance, matching "teammates find it under New chat → Team Bots" without an invite flow.
- Shared setup = identity/profile/instructions. The reference's team shared secret store is intentionally not built: the fork keeps credentials actor-private (stricter than the reference; TEAM-006's non-exposure MUST is satisfied by construction). A team-scoped secret store with the BotSecret redaction machinery is the designed follow-up if shared keys become a verified need.
- P19-18 (greeting suggestions): the docs pin existence, not content — left as a P3 follow-up instead of inventing copy.

## Blockers

None.

## Discovered Follow-ups

- Space invite flow: the product cannot add a second member to a space yet, so the teammate leg of the journey is pinned at the API level; a browser E2E becomes possible once invites exist (upstream space-model gap, also blocking multi-user Team Bot journeys end-to-end).
- Mobile team-bot management surface (status display, publish actions) — deferred to the phase 23 mobile sweep per REL-002.

## Next Recommended Task

Execute Phase 20 (Composer & Message Delivery Experience Parity): start with the pinned composer list semantics (changelog v0.62.0: "- or 1. starts a list, Shift+Enter adds an item, Tab nests it, Enter still sends") in the composer key handling, then Add to prompt (Cmd/Ctrl+L), then optimistic send with the 2-second delayed progress rule, then the failed-send Resend/Delete state reusing `clientNonce` replay.

## Final Summary

DONE — Team Bots now follow the reference lifecycle: owner-only drafts, Publish/Unpublish with availability gating, Copy Bot/Start fresh from a personal bot's Share, owner-edited shared setup that reaches every teammate, and per-member private instances — all authorization pinned by tests.
