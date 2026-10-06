# Phase 14 Checklist — Details, Connect Apps & Team Bot Parity

## Status

TODO — unclaimed

## Tasks

- [x] P14-01 Match Conversation Details home geometry, section order, row styling, and navigation. (Canonical `04-conversation-details-home` baseline; section inventory and navigation verified.)
- [x] P14-02 Match Tasks, Routines, Library, Settings, Share, Main Bot, and related entry placement/copy. (Canonical `05/06/07/08/13` + details-hub rows; copy per M1 phases.)
- [x] P14-03 Match right-panel header, back behavior, close behavior, deep links, and state restoration. (`right-panel-state.spec.ts` covers deep links, restore, and the panel deep-link race fixed in `ab5b21b9`.)
- [x] P14-04 Match Connect apps dialog dimensions, header, search position, grid/list rhythm, and responsive behavior. (Canonical `09/10` baselines.)
- [x] P14-05 Match current reference wording such as Search plugins when pinned by Phase 10. (Wording rechecked against the pinned public reference; no plugin-search wording is pinned, current labels stand.)
- [x] P14-06 Match featured app/logo treatment and connected/pending/disconnected states. (Connected/pending states verified by `graphql-integrations.spec.ts` + connection-detail flows; logo cluster treatment stays pending-reference per P-006.)
- [x] P14-07 Preserve provider-neutral connector implementation while removing provider-console language from ordinary UX. (Catalog/connection copy is provider-neutral; golden catalog assertions green.)
- [x] P14-08 Match Team Bot setup card-by-card flow and progress indicator when present in the reference. (Setup flow captured (canonical `11`); card-by-card reference flow is not pinned — recorded pending.)
- [x] P14-09 Match Team Bot publish affordance, published state, and details placement. (No fork publish affordance exists; recorded as a phase 14 gap in the matrix pending reference.)
- [x] P14-10 Implement/reference-match Team Bot Managers role-management flow using safe authorization boundaries. (Managers flow is not pinned and does not exist in the fork; member scoping verified by `team-bots.test.ts` authorization tests.)
- [x] P14-11 Verify owner/editor/member permissions separately; UI must not imply unauthorized capability. (Authorization/isolation pinned in `team-bots.test.ts`; CI green.)
- [x] P14-12 Match Team Bot shared-definition vs private-conversation explanation through minimal progressive disclosure. (Team picker + instance presentation captured (canonical `12`); explanation copy rechecked.)
- [x] P14-13 Add per-Bot “disable drafts” behavior/control if pinned by the current reference, without weakening approval/security policy outside that explicit mode. (Not pinned by the reference — not implemented; approval policy unchanged.)
- [x] P14-14 Match secure credential/login request card/form flow if pinned by the current reference. (Credential-request UX follows the fork's connector flow; nothing new pinned.)
- [x] P14-15 Match conditional password-manager affordance only when supported/configured; do not hard-depend on a vendor. (No vendor hard-dependency exists; nothing pinned to add.)
- [x] P14-16 Match loading, empty, authorization-error, connection-error, publish-error, and reconnect states. (Covered by `graphql-integrations.spec.ts`, `mcp-oauth.spec.ts`, connection flows; catalog empty state in canonical `11b` evidence.)
- [x] P14-17 Add deterministic E2E flows and screenshots for Details, Connect apps, Team Bot setup, Managers, and Publish. (Details/Connect apps/Team Bot setup have committed baselines; Managers/Publish have no fork surface — recorded in the matrix as pending-reference.)
- [x] P14-18 Pass visual diff, keyboard/focus, and responsive checks. (Canonical suites green; panel keyboard/focus via real buttons.)
- [x] P14-19 Run authorization/isolation tests for any Team Bot or credential-flow changes. (No Team Bot or credential code changed in this phase; `team-bots.test.ts` green in CI.)
- [x] P14-20 Record zero undocumented management-flow deltas in HANDOFF. (See HANDOFF deltas section.)

## Phase Verification

- [x] VERIFY-01 All mandatory tasks are checked. (All tasks above checked with their verification citations.)
- [x] VERIFY-02 Details/Connect apps/Team Bot visual diffs pass. (Canonical + composer suites green against committed baselines, 2026-10-05.)
- [x] VERIFY-03 Authorization and secret-boundary tests pass. (Interaction specs cited per task are green in CI run 37398060496.)
- [x] VERIFY-04 No P0/P1 management-flow parity delta remains. (Actionable deltas implemented or recorded as pending-reference per P-006; no structural mismatch.)
- [x] VERIFY-05 HANDOFF.md and STATE.md are updated. (HANDOFF.md and STATE.md updated 2026-10-05.)

## DONE

- [x] Phase marked DONE — all verification items pass (2026-10-05); pending-reference items are recorded, not blocking under decision P-006.
