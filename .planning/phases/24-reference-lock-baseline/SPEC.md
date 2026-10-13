# Phase 24 — Current Reference, Baseline & Scope Lock

## Objective

Pin the current public Grok Bot reference after the M3 snapshot (v0.66.0) and map every candidate gap to local code, so M4 implementation starts from evidence instead of assumptions. Audit only: no product code changes.

## Maintainer directive

The maintainer instructed that all M4 phases (24–31) be completed in one run. This stands in for the scope confirmation (P24-07) and for the documented dependency exception to M3 Phase 23. Phase 23 files are not edited; the gate stays open.

## Deliverables

- `REFERENCE-SOURCES.md` — dated source matrix with verbatim quotes.
- `REFERENCE-MATRIX.md` — change → local status, pointers, severity, owner phase.
- `../../M4-REQUIREMENTS.md`, `../../M4-ACCEPTANCE-MATRIX.md`.

## Exit

Every mandatory item has a source row and a code pointer; unverified reference behavior is kept out of MUST.
