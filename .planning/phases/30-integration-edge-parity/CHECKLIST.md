# Phase 30 Checklist — Messaging & Integration Edge Parity

## Status

DOING — Claude Code (Sonnet 5.5), branch `m4-execution`, 2026-10-12. Offline tests only; no real Slack workspace.

## Tasks

- [x] P30-01 Verify the Slack user-group mention behavior and map authorization, visibility, API requirements, ambiguous names, approval gates. (Reference is one changelog line; see SPEC. Authorization = Slack's own group list; API requirement = `usergroups:read`; ambiguous names are never resolved to ids; no approval gate added because posting already runs through the Bot's normal message path.)
- [x] P30-02 Capability-based user-group mention in the messaging adapter with escaping/injection protection and fallback. (`slack-mentions.ts` + `sanitizeOutbound` hook; tests for broadcasts, authorized/unauthorized ids, labels never used as ids, fail-closed lookup, cache, surface applies the rewrite.) Note: only `<!…>` special tokens are rewritten; `&`/`<`/`>` in ordinary text is left to the vendor adapter, so generic escaping of arbitrary text was not added.
- [ ] P30-03 Reassess remaining plugin behavior changes from Phase 24. — Not done: the other changelog items are not in mandatory scope (`REFERENCE-MATRIX.md`, "Other changelog items"); none was audited locally.
- [x] P30-04 Integration tests for missing scopes, disconnected accounts, ownership, replay. (Missing scope, malformed reply and network failure covered in `slack-mentions.test.ts`; disconnected accounts, personal/team ownership and replay are not touched by this change and not re-tested.)
- [x] P30-05 Provider capability and security documentation. (`docs/self-host.md` paragraph; the SPEC records the policy.)

## Phase Verification

- [ ] VERIFY-01 P30-03 open.
- [ ] VERIFY-02 No real Slack run.

## DONE

- [ ] Phase not DONE.
