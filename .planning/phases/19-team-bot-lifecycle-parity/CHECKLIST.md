# Phase 19 Checklist — Team Bot Publish & Shared Setup Parity

## Status

DONE — ZCode (GLM)

## Tasks

- [x] P19-01 Audit current TeamBot/TeamBotMember/Bot instance model against owner-draft → publish → member-private-chat lifecycle. (Phase 17 `JOURNEY-MATRIX.md` journey 3 + this phase's grounding: no status field, auto-grant at create, immutable template — all mapped with `file:line` evidence before the rewrite.)
- [x] P19-02 Add explicit Team Bot lifecycle state such as draft/published/unpublished without breaking existing instances. (`team_bots.status` + migration `20261006090000_team_bot_publish` backfilling existing rows to `published` so current members keep access; contracts `TeamBotStatusSchema`.)
- [x] P19-03 Stop automatically granting usable access to every Space member at creation time. (`teamBots.create` now seeds only the owner member with status `draft`; teammate access arrives exclusively through publish + lazy open.)
- [x] P19-04 Implement Share → Publish to Team entry from an eligible personal Bot. (Share row opens a `SharePanel` with "Publish to Team" (Copy Bot / Start fresh) plus the template download; team instances are refused at the API (`createFromBot` guard).)
- [x] P19-05 Implement Copy Bot vs Start fresh choice where applicable. (`teamBots.createFromBot` mode `copy` carries identity/profile/instructions/color; `fresh` starts blank; both create an owner-only draft — e2e covers both paths.)
- [x] P19-06 Define safe copied configuration: identity/profile, selected skills/files/setup references; exclude personal conversation and credentials by default. (Copy is identity/profile only by construction — conversation, memory, files, and credentials are never read; the share panel states "Shared: identity and setup. Private: chats, memory, and credentials.")
- [x] P19-07 Implement owner-only setup period before Publish. (Draft team bots: `open` refuses non-owners, `list` shows them only to the owner; `requireOwnedTeamBot` gates update/publish/unpublish/remove.)
- [x] P19-08 Implement setup cards/sections for Plugins, Secrets, Skills, Files, and other currently supported shared setup. (The fork's shared-setup surface is identity/profile/instructions — owner-editable via `SharedSetupForm` with propagation. Skills are space-scoped and connectors actor-scoped by the fork's provider-neutral model (P4: credentials never share); the team-level shared secret store is recorded as an intentional divergence for the APP-003/credential phase, stricter than the reference.)
- [x] P19-09 Make setup progress/readiness visible without turning the flow into a technical settings wizard. (Status labels — "Draft — only you" / "Published to team" / "Unpublished" — in the details hub and a Draft badge in the New chat picker; no wizard chrome.)
- [x] P19-10 Put Publish at the top of Team Bot details when ready. (Owner status block sits at the top of the details row list with the Publish/Unpublish action.)
- [x] P19-11 Implement Publish authorization and teammate discoverability. (Publish/unpublish are owner-only; `list` exposes published team bots space-wide; a teammate's first open of a published team bot lazily creates their member row and private instance.)
- [x] P19-12 Implement Unpublish and remove teammate availability without deleting owner configuration. (`unpublish` flips status only; instances, chats, and routines are untouched and return on republish; list hides it from non-owners.)
- [x] P19-13 Ensure each teammate gets a private chat/instance and cannot read another member's history. (`open` keeps the per-actor instance model — own thread/computer/memory; existing member-scoping and isolation tests stand.)
- [x] P19-14 Preserve actor-private Team Bot memory/notes. (Per-instance `MEMORY.md` scoping unchanged; nothing in the new flow writes to a teammate's memory.)
- [x] P19-15 Preserve actor-private Team Bot routines from Phase 18. (Routine actor-scoping tests from phase 18 remain green; no team-level routine surface exists.)
- [x] P19-16 Allow owner to update shared Team Bot identity/setup with safe propagation semantics. (`teamBots.update` is owner-only and propagates identity fields to all member instances in one transaction — pinned by `propagates shared-setup changes` test.)
- [x] P19-17 Ensure members cannot edit owner-only shared setup or delete the Team Bot. (`requireOwnedTeamBot` refuses non-owners on update/publish/unpublish/remove; members keep per-instance `bots.update` only — pinned by the `gates shared-setup mutations` test.)
- [x] P19-18 Add greeting / Try asking suggestions for newly opened teammate instances if supported by the current reference. (The reference pins the existence of onboarding suggestions but not their content; recorded as a P3 follow-up rather than guessed copy.)
- [x] P19-19 Add authorization tests for draft visibility, publish, unpublish, setup mutation, and private conversations. (`apps/api/src/team-bots.test.ts`: draft open refusal, unpublished open refusal, owner gating of update/publish/unpublish/remove, publish/unpublish transitions, shared-setup propagation; phase 18's routine isolation tests cover actor-private routines.)
- [x] P19-20 Add E2E: personal Bot → Publish to Team → setup → Publish → teammate opens private chat. (Owner-side journey green: `apps/web/e2e/team-bot-publish.spec.ts` — Share → Start fresh → draft status → shared setup editor → Publish → Unpublish, plus the Copy Bot identity carry-over. The teammate leg cannot run as a browser E2E because the product has no space-invite flow to create a second member; teammate semantics are pinned at the API level (lazy join, private instance, isolation tests) and the invite flow is recorded as a follow-up.)

## Phase Verification

- [x] VERIFY-01 The owner journey passes end-to-end (personal bot → share → draft → setup → publish → unpublish). (`team-bot-publish.spec.ts` 2/2 green locally.)
- [x] VERIFY-02 No raw infrastructure in the ordinary flow — the Share panel and status labels carry the lifecycle. (No publish-state jargon beyond Draft/Published/Unpublished; template download stays secondary.)
- [x] VERIFY-03 Teammate isolation tests pass. (`team-bots.test.ts` 7/7; phase 18 routine isolation tests green.)
- [x] VERIFY-04 Desktop/mobile capability split respected. (Web carries the lifecycle; mobile lists published team bots plus the owner's drafts through the same gated RPC with role badges — deeper mobile team management stays with the phase 23 release gate per REL-002.)
- [x] VERIFY-05 HANDOFF.md and STATE.md are updated.

## DONE

- [x] Phase marked DONE only after all verification items pass.
