# Reference captures — source registry

## Authenticated Grok Bot captures — NOT YET PROVIDED

Decision P-006 (2026-10-05): M2 phases proceed from the pinned public reference set
(docs.x.ai Grok Bot overview + release notes, captured 2026-10-05) and the recorded
delta observations in each phase SPEC until captures are added here.

## Procedure for the maintainer

1. Sign in to the public Grok Bot product.
2. For each canonical state in `PARITY-MATRIX.md`, set the viewport to
   1440×900 (desktop), 1024×768 (narrow), or 390×844 (mobile) and capture PNGs.
3. Store captures in this directory named `<state-id>.png` (state ids from the matrix).
4. Record in this file: the capture date, the product version/URL, and the account
   context (no credentials).
5. Phases 11–16 then diff reference-vs-fork with
   `node scripts/visual-diff.mjs <reference.png> <fork.png> --mask ... --tolerance 0.01`.
