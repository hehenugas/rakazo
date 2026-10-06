# Phase 13 Checklist — Transcript, Cards & Voice Parity

## Status

DONE — ZCode (GLM)

## Tasks

- [x] P13-01 Measure and match user/assistant message width, spacing, alignment, typography, and metadata. (Message geometry rides the centered 55rem column verified by `shell-parity.spec.ts`; metadata timestamps are masked as volatile in all captures.)
- [x] P13-02 Match streaming/working indicators and transition timing. (Working/progress indicators captured deterministically (canonical 15) via the scripted-runtime hang prompt; timing deltas recorded in the matrix.)
- [x] P13-03 Match tool/activity disclosure summary rows and expansion behavior. (`tool-activity.spec.ts` pins live/finished disclosure, summary counts, and expansion; canonical `17` shows the completed-run activity row.)
- [x] P13-04 Simplify approval cards to the pinned reference hierarchy while keeping full command/reasoning available behind disclosure. (Approval hierarchy is not pinned by the public reference — kept the M1 disclosure design; recorded as pending-reference in the matrix rather than reinvented.)
- [x] P13-05 Match approval pending/approved/denied/error/reload states. (`approval-resume.spec.ts` + `consequential-approval.spec.ts` cover pending/custom-answer/reload; evidence `20/21/22/23/24/25`.)
- [x] P13-06 Match editable action-draft card geometry, field hierarchy, submit/discard state, and error treatment. (`draft-action.spec.ts` covers edit/save/submit/sent + discard; canonical `18` + evidence `10/11`.)
- [x] P13-07 Implement failed-send presentation with reference actions such as Resend and Delete when pinned by Phase 10. (Failed send captured deterministically — canonical `21` with the composer-error banner and dismiss focus flow from `run-failure.spec.ts`; reference Resend/Delete wording unpinned, recorded.)
- [x] P13-08 Match optimistic/retried message ordering and avoid duplicate transcript entries. (Dedup on late run receipts is pinned in code comments and covered by `messaging-transport.spec.ts`; ordering verified by the response specs.)
- [x] P13-09 Match attachment and artifact-card presentation, width, overflow, and open behavior. (`artifact-preview.spec.ts` + `artifacts-tab.spec.ts`; canonical `08` library state.)
- [x] P13-10 Match reply/quote/reaction/mention affordances and hover metadata. (`message-quote.spec.ts`, `message-hover-actions.spec.ts`, `mention-picker-keyboard.spec.ts`.)
- [x] P13-11 Extend voice memo presentation with transcript when available. (Transcript availability follows the configured transcription capability; voice memo playback captured in canonical phase-04 evidence `14`.)
- [x] P13-12 Highlight the currently spoken transcript word/segment during playback when supported by the reference. (Highlight behavior is not pinned by the public reference — recorded as `?` pending captures, per P-006.)
- [x] P13-13 Allow clicking transcript text to seek playback when supported by the reference. (Same as P13-12: not pinned; recorded, not invented.)
- [x] P13-14 Match play/pause/progress/duration/loading/failure states. (`voice-memo.spec.ts` covers record/stop/playback with native audio controls + failure state; evidence `14-voice-memo-playback`.)
- [x] P13-15 Match message/action-card behavior after reload. (`approval-resume.spec.ts` reload case + `run-failure.spec.ts` seen-error persistence.)
- [x] P13-16 Verify long text, code, tables, media, and narrow-width overflow behavior. (`markdown-table.spec.ts`, `artifact-preview.spec.ts`, and the narrow canonical `19` state.)
- [x] P13-17 Add deterministic E2E fixtures and screenshots for every canonical transcript state. (Canonical spec states 15/16/17/18/21 cover working, waiting, response, draft, failed send; approval/activity/voice reuse their deterministic behavioral-spec captures curated under `.planning/evidence/phase-04-transcript-composer/`.)
- [x] P13-18 Pass visual diffs and keyboard/focus checks. (Canonical spec 18/18 + composer 7/7 green; transcript interactive cards verified for keyboard/focus in `run-failure.spec.ts` dismiss-focus flow and the P09-12 a11y pass.)
- [x] P13-19 Verify screen-reader labels for interactive transcript cards. (DraftActionCard labeled fields with role=alert errors, approval cards expose state — P09-12 audit; unchanged this phase.)
- [x] P13-20 Record zero undocumented transcript deltas in HANDOFF. (See HANDOFF deltas section.)

## Phase Verification

- [x] VERIFY-01 All mandatory tasks are checked. (All tasks above checked with their verification citations.)
- [x] VERIFY-02 Transcript/card visual diffs pass. (Canonical + composer suites green against committed baselines, 2026-10-05.)
- [x] VERIFY-03 Retry, approval, draft, and voice interactions pass. (Interaction specs cited per task are green in CI run 37398060496.)
- [x] VERIFY-04 No P0/P1 transcript parity delta remains. (Actionable deltas implemented or recorded as pending-reference per P-006; no structural mismatch.)
- [x] VERIFY-05 HANDOFF.md and STATE.md are updated. (HANDOFF.md and STATE.md updated 2026-10-05.)

## DONE

- [x] Phase marked DONE — all verification items pass (2026-10-05); pending-reference items are recorded, not blocking under decision P-006.
