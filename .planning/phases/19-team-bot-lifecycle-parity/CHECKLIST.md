# Phase 19 Checklist — Team Bot Publish & Shared Setup Parity

## Status

TODO — unclaimed

## Tasks

- [ ] P19-01 Audit current TeamBot/TeamBotMember/Bot instance model against owner-draft → publish → member-private-chat lifecycle.
- [ ] P19-02 Add explicit Team Bot lifecycle state such as draft/published/unpublished without breaking existing instances.
- [ ] P19-03 Stop automatically granting usable access to every Space member at creation time.
- [ ] P19-04 Implement Share → Publish to Team entry from an eligible personal Bot.
- [ ] P19-05 Implement Copy Bot vs Start fresh choice where applicable.
- [ ] P19-06 Define safe copied configuration: identity/profile, selected skills/files/setup references; exclude personal conversation and credentials by default.
- [ ] P19-07 Implement owner-only setup period before Publish.
- [ ] P19-08 Implement setup cards/sections for Plugins, Secrets, Skills, Files, and other currently supported shared setup.
- [ ] P19-09 Make setup progress/readiness visible without turning the flow into a technical settings wizard.
- [ ] P19-10 Put Publish at the top of Team Bot details when ready.
- [ ] P19-11 Implement Publish authorization and teammate discoverability.
- [ ] P19-12 Implement Unpublish and remove teammate availability without deleting owner configuration.
- [ ] P19-13 Ensure each teammate gets a private chat/instance and cannot read another member's history.
- [ ] P19-14 Preserve actor-private Team Bot memory/notes.
- [ ] P19-15 Preserve actor-private Team Bot routines from Phase 18.
- [ ] P19-16 Allow owner to update shared Team Bot identity/setup with safe propagation semantics.
- [ ] P19-17 Ensure members cannot edit owner-only shared setup or delete the Team Bot.
- [ ] P19-18 Add greeting / Try asking suggestions for newly opened teammate instances if supported by the current reference.
- [ ] P19-19 Add authorization tests for draft visibility, publish, unpublish, setup mutation, and private conversations.
- [ ] P19-20 Add E2E: personal Bot → Publish to Team → setup → Publish → teammate opens private chat.
- [ ] P19-21 Add E2E: Start fresh Team Bot → setup → publish.
- [ ] P19-22 Add E2E: owner edits shared setup; member sees allowed shared changes without history leakage.
- [ ] P19-23 Document migration/backfill semantics for existing M1 Team Bots.

## Phase Verification

- [ ] VERIFY-01 Pre-publish owner-only visibility is enforced.
- [ ] VERIFY-02 Publish/unpublish/member access journey passes.
- [ ] VERIFY-03 Shared setup and private user state are correctly separated.
- [ ] VERIFY-04 Authorization/isolation suite passes.
- [ ] VERIFY-05 HANDOFF.md and STATE.md are updated.

## DONE

- [ ] Phase marked DONE only after all verification items pass.
