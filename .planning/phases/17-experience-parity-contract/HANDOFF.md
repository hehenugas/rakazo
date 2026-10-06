# Phase 17 Handoff — Experience Parity Contract & Journey Baseline

## Current Status

DONE — all 15 tasks and 4 verification items pass (2026-10-06).

## Owner

ZCode (GLM)

## Branch / Worktree

Local `main` (fork).

## Work Log

### 2026-10-06 — Journey baseline executed (ZCode/GLM)

- Captured all six official sources (docs overview/bots/skills-routines/team-bots/mobile + changelog v0.17.0–v0.66.0). Key pins: composer lists (v0.62.0), Add to prompt (v0.62.0), immediate send + 2s progress rule (v0.57.0), Failed to send with Resend/Delete (v0.62.0), voice transcript word-sync + click-to-seek (v0.57.0), Team Bot draft→Publish→Unpublish with Copy/Start fresh and Managers (v0.61–v0.64 + team-bots doc), Project as Cloud Agent that plans/runs its own agents + stop cascade (v0.57.0), Connect apps featured logos + Search plugins (v0.60/v0.63), one-sentence approval summary behind "View the full request" (v0.56.0), chat-form/Secure-Form credential handoff (v0.44/v0.64).
- Ground-truth audit of the fork (three parallel code surveys, `file:line` evidence recorded in `JOURNEY-MATRIX.md`) covering routines, team bots/connect apps, and composer/transcript/voice/approvals/projects/Main Bot, web + mobile.
- Deliverables: `JOURNEY-MATRIX.md` (11 journeys × Entry/Steps/Result/Ownership/Error-Cancel/Mobile, gap register with severities, pinning decisions, requirement→phase mapping); M2-historical scope notes on `UI-SPEC.md`/`VISUAL-DIFF.md`; `REFERENCES.md` capture precision.
- No product code changed.

## Files / Modules Changed

- `.planning/phases/17-experience-parity-contract/JOURNEY-MATRIX.md` (new)
- `.planning/phases/10-reference-visual-contract/UI-SPEC.md`, `VISUAL-DIFF.md` (scope notes)
- `.planning/REFERENCES.md` (M3 capture precision)
- This CHECKLIST/HANDOFF; `STATE.md`

## Verification Run

Documentation/audit phase — no test suites affected. Working tree contained no product-code changes; CI green on the code baseline (run 37400135980).

## Decisions Made During Phase

- Gap severities follow EXPERIENCE-SPEC: no P0 found (security posture of secrets/approvals is intact); 14 P1 journey gaps, all with owning phases (18: routines next-run/confirm/mobile/presets; 19: publish lifecycle/copy-fresh/owner-gate/team secrets; 20: lists/add-to-prompt/optimistic send/failed-send; 21: voice transcript/approval disclosure/plugin terminology; 22: project orchestration/stop cascade/event-aware attention+dedup).
- Team Bot shared-secret direction for phase 19: team-bot-scoped secret store reusing the BotSecret ciphertext/redaction machinery — stricter than nothing, aligned with the reference's `[REDACTED]` model.
- Voice seek (VOICE-002) requires segment-timing transcription data; current API returns text only, so phase 21 must extend the transcription adapter (provider-neutral) before UI sync can exist.

## Blockers

None.

## Discovered Follow-ups

- Fork delete-Bot flow should be verified to remove routines with the Bot (docs say deleting removes profile, conversation, and routines) — assigned to phase 18/23 verification.
- Event-trigger routine runs are invisible in run history (trigger=webhook without routineId) — phase 18 history completeness.

## Next Recommended Task

Execute Phase 18 (Routines & Scheduling Experience Parity) — it carries the largest concentration of P1 gaps on a high-frequency learned workflow: next-run/timezone confirmation (ROUT-004), Once/Yearly presets + editable timezone (ROUT-003), mobile routine management (ROUT-007), and creation-confirmation clarity (ROUT-001/002/005).

## Final Summary

DONE — the M3 acceptance model is fully grounded: current official references captured and pinned, the fork's real journey state audited with file:line evidence, every gap classified and owned by phases 18–23, and no M3 gate depends on pixel identity.
