# Phase 00 — Bootstrap & Baseline

## Objective

Turn the empty local folder into a clean Rakazo fork with reproducible baseline knowledge before parity work starts.

## Scope

- initialize/clone the Rakazo fork
- configure `origin` and `upstream`
- inspect all repository agent instructions
- install dependencies using upstream-supported commands
- document architecture and package boundaries relevant to M1
- run baseline lint/typecheck/unit/integration/E2E as feasible
- capture baseline desktop/web/mobile screenshots
- record known pre-existing failures
- create a parity baseline inventory so later agents do not rebuild existing features

## Non-Goals

- no parity feature implementation
- no broad refactor
- no dependency upgrades unless required to make upstream baseline reproducible

## Acceptance Criteria

- repository is a valid git checkout
- upstream Rakazo can be fetched
- supported setup/test commands are documented
- existing failures are distinguished from fork regressions
- baseline screenshots/evidence exist
- feature inventory has been verified against checked-out code

## DONE Gate

All mandatory items in `CHECKLIST.md` are checked and baseline evidence is referenced in `HANDOFF.md`.
