# Phase 17 Checklist — Experience Parity Contract & Journey Baseline

## Status

DONE — ZCode (GLM)

## Tasks

- [x] P17-01 Re-read current official Grok Bot docs/changelog and record capture date/version. (2026-10-06: all six sources captured; changelog v0.17.0–v0.66.0, latest v0.66.0 Oct 2 2026 — record in `JOURNEY-MATRIX.md` → Reference capture record and `REFERENCES.md`.)
- [x] P17-02 Replace pixel-perfect language in active parity rules with journey/structural parity. (Active rules — REQUIREMENTS/EXPERIENCE-SPEC/README/ROADMAP/STATE — were authored journey-first in the M3 setup; the M2 artifacts `10-reference-visual-contract/UI-SPEC.md` and `VISUAL-DIFF.md` now carry explicit historical/regression-only scope notes.)
- [x] P17-03 Create a journey matrix with Entry → Steps → Result → Ownership → Error/Cancel → Mobile columns. (`JOURNEY-MATRIX.md` — 11 journeys, each with reference quotes, fork-today `file:line` evidence, gap, severity, owning phase.)
- [x] P17-04 Re-audit M2 pending-reference items against current official docs/changelog. (`JOURNEY-MATRIX.md` → Pinning decisions + M2 re-audit conclusion; per D-014 no documented behavior stays pending-reference.)
- [x] P17-05 Mark composer list behavior as pinned where current changelog documents it. (v0.62.0: "- or 1. … Shift+Enter adds an item, Tab nests it, and Enter still sends"; plus Add-to-prompt Cmd/Ctrl+L and v0.57.0 send-timing — pinned → phase 20.)
- [x] P17-06 Mark failed-send Resend/Delete as pinned where current changelog documents it. (v0.62.0: "Failed to send with Resend and Delete" — pinned → phase 20.)
- [x] P17-07 Mark voice transcript highlight/seek as pinned where current changelog documents it. (v0.57.0: word-level sync highlight + click-to-seek — pinned → phase 21, requires segment-timing transcription.)
- [x] P17-08 Mark Team Bot setup/publish lifecycle as pinned from current docs/changelog. (team-bots doc + v0.61.0/v0.63.0/v0.64.0: draft→Publish→Unpublish, Copy/Start fresh, Managers — pinned → phase 19.)
- [x] P17-09 Mark Project-as-Cloud-Agent semantics as pinned from current changelog. (v0.57.0: "a Cloud Agent that plans the work and runs its own agents"; stop cascade same entry — pinned → phase 22.)
- [x] P17-10 Mark Connect apps Search plugins / featured-plugin treatment as pinned where documented. (v0.60.0 featured logos beside Connect apps; v0.63.0 "Search plugins" — pinned → phase 21.)
- [x] P17-11 Document Routine creation/management/mobile behavior from current official docs. (skills-routines doc + mobile doc captured in `JOURNEY-MATRIX.md` journeys 2/11: conversational creation, schedule+timezone confirmation, next run, Test run, management home, 50-routine/20-run limits, mobile inspect/pause/delete with edit/test desktop-only.)
- [x] P17-12 Classify every known gap P0/P1/P2/P3 and assign phases 18–23. (Gap register across all 11 journeys: no P0; 14 P1 gaps mapped to phases 18–22; P2/P3 polish items assigned; every MUST/SHOULD requirement owned — see mapping table.)
- [x] P17-13 Keep screenshot regression tests, but remove Grok-vs-fork pixel ratio as an M3 release gate. (M2 harness untouched as regression tooling; `VISUAL-DIFF.md`/`UI-SPEC.md` scope notes added; grep confirms phases 18–23 packets contain no pixel-identity gates; P23-21 re-verifies at release.)
- [x] P17-14 Update README/PROJECT/STATE/DECISIONS/REFERENCES for M3 rules. (README/PROJECT/STATE/DECISIONS D-013…D-017 updated in the M3 planning commit; `REFERENCES.md` M3 section extended with capture date/version range + matrix pointer.)
- [x] P17-15 Record exact next recommended task in HANDOFF. (Below.)

## Phase Verification

- [x] VERIFY-01 Every M3 requirement maps to at least one phase/checklist item. (Mapping table in `JOURNEY-MATRIX.md`: EXP/ROUT/TEAM/COMP/VOICE/APPR/APP/PROJ/MAIN/REL → phases 17–23, each with a checklist anchor.)
- [x] VERIFY-02 No official documented behavior is incorrectly labeled pending-reference. (All behavioral `?` items pinned by the 2026-10-06 capture; only presentation-level unknowns remain and no MUST/SHOULD depends on them.)
- [x] VERIFY-03 Pixel identity is not required by any M3 DONE gate. (EXPERIENCE-SPEC + ROADMAP M3 exit + P17-02/P17-13 evidence.)
- [x] VERIFY-04 HANDOFF.md and STATE.md are updated.

## DONE

- [x] Phase marked DONE only after all verification items pass.
