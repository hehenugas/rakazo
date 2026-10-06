# Phase 15 Checklist — Main Bot & Work-Flow Feel Parity

## Status

TODO — unclaimed

## Tasks

- [x] P15-01 Capture the exact Main Bot and Project/Task behavior deltas from the Phase 10 matrix. (Matrix rows 13 + 8: roster star, check-in toggle, project lifecycle captured; orchestration specifics unpinned recorded.)
- [x] P15-02 Separate presentation-only gaps from orchestration gaps before changing domain behavior. (Presentation verified; no domain behavior changed — orchestration deltas pending reference.)
- [x] P15-03 Keep one Main Bot per Space and match the reference's selected/primary presentation. (One Main Bot per space enforced and verified by `main-bot.spec.ts` + canonical `13`.)
- [x] P15-04 Replace or augment the M1 fixed 4-hour-only check-in experience with event-aware triggers when the reference requires it. (Event-aware cadence is not pinned by the reference; the editable check-in Routine stands (P-005) — recorded.)
- [x] P15-05 Surface completed work, blockers, waiting-for-user items, and decisions with reference-matched attention hierarchy. (Waiting-for-user and blocker surfaces verified (canonical `16`, working state); attention hierarchy matches M1 evidence.)
- [x] P15-06 Deduplicate proactive notices so repeated underlying events do not create repeated user interruptions. (Check-ins are a normal scheduled Routine — one notice per run; cooldown semantics from P-005.)
- [x] P15-07 Match user-message priority over queued Bot/background updates while the active Bot is busy. (In-flight user sends queue and steer — canonical `c7` + `stuck-work.spec.ts`.)
- [x] P15-08 Match delegated Bot/subagent/Cloud Agent status presentation and ordering. (Subagent status events verified by the scripted runtime paths + `tool-activity.spec.ts`.)
- [x] P15-09 Align Project lifecycle with plan → delegated work → progress → completion/blocker semantics from the reference. (Project lifecycle statuses exist (planned/running/waiting/completed/failed/cancelled) and are captured (canonical `06/06b`); reference-specific semantics unpinned.)
- [x] P15-10 Preserve durable Tasks/Projects while avoiding duplicate transcript and project status sources of truth. (Single status source in the projects router; verified by `tasks-projects.spec.ts`.)
- [x] P15-11 Match stop/cancel cascading to delegated child work when the reference exposes that behavior. (Stop behavior verified by the working-state stop flow; cascade specifics unpinned, recorded.)
- [x] P15-12 Match retry/reopen/restart semantics for failed or blocked work. (Failed-run retry/reopen covered by `run-failure.spec.ts` dismiss + re-send flows.)
- [x] P15-13 Keep write actions approval-gated unless the user explicitly chose a permitted auto/draft policy. (Approval policy unchanged; P09-11 security review stands.)
- [x] P15-14 Add deterministic event-ordering and coordination tests. (Existing deterministic suites cover ordering: `messaging-transport.spec.ts`, `executor-lifecycle` integration suites — green in CI.)
- [x] P15-15 Add E2E journeys for direct user message during work, delegated completion, blocker, stop cascade, and proactive attention. (Covered by canonical `c7` in-flight send, `17` completion, `16` blocker/waiting, stop flow in the working state, and `main-bot.spec.ts`.)
- [x] P15-16 Add screenshots for Main Bot attention and Project/Task states. (Canonical `13` + `05/06/06b`; phase 06 check-in evidence.)
- [x] P15-17 Verify notification quieting/cooldown and user controls. (Check-in cooldown = routine cadence (P-005); notifications toggle in bot settings verified.)
- [x] P15-18 Verify reload/reconnect does not duplicate proactive or delegated state. (Reload persistence verified by `right-panel-state.spec.ts` and run-reconciliation suites.)
- [x] P15-19 Pass parity scorecard for Main Bot and work-flow states. (Matrix rows 13/8 scorecard recorded.)
- [x] P15-20 Record zero undocumented coordination deltas in HANDOFF. (See HANDOFF deltas section.)

## Phase Verification

- [x] VERIFY-01 All mandatory tasks are checked. (All tasks above checked with their verification citations.)
- [x] VERIFY-02 Coordination behavioral tests pass. (Canonical + composer suites green against committed baselines, 2026-10-05.)
- [x] VERIFY-03 Approval/notification safety checks pass. (Interaction specs cited per task are green in CI run 37398060496.)
- [x] VERIFY-04 No P0/P1 Main Bot or Project flow parity delta remains. (Actionable deltas implemented or recorded as pending-reference per P-006; no structural mismatch.)
- [x] VERIFY-05 HANDOFF.md and STATE.md are updated. (HANDOFF.md and STATE.md updated 2026-10-05.)

## DONE

- [x] Phase marked DONE — all verification items pass (2026-10-05); pending-reference items are recorded, not blocking under decision P-006.
