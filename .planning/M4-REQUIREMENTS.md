# Requirements — M4 Grok Bot Feature & Experience Parity

Derived from `M4-EXECUTION-PLAN.md` and `phases/24-reference-lock-baseline/REFERENCE-MATRIX.md` (2026-10-12). M3 `REQUIREMENTS.md` stays authoritative for M3. This file does not close or waive any M3 gate.

Vocabulary: **MUST** release gate; **SHOULD** expected unless a documented constraint prevents it; **MAY** optional or provider-dependent. Each MUST has one acceptance test in `M4-ACCEPTANCE-MATRIX.md`.

Scope policy: only items with a source row and a local code pointer are MUST. Anything whose reference is `unverified` is at most SHOULD/MAY. Provider-dependent items (Gmail send-as, Spam, Google Slides) MUST degrade to an explicit unsupported state, never a fake control.

## Orchestration reliability (Phase 25)

- **M4-ORCH-001 (MUST)** Project stop cascades to every task, run, subagent and cloud agent the project owns, never to unrelated work; idempotent and actor-scoped. (R-16, L-02)
- **M4-ORCH-002 (MUST)** Child project work on the same Team Computer queues or fails with a recoverable state instead of surfacing a raw busy error or deadlocking. (L-01)
- **M4-ORCH-003 (MUST)** A populated pre-M3 schema upgrades cleanly through the current migration chain. (L-05)
- **M4-ORCH-004 (SHOULD)** Main Bot attention and card-sync latency are measured; the reconciler interval and scan window are configurable with unchanged defaults. (L-03)
- **M4-ORCH-005 (MUST)** `biome check .` is clean. (L-04)

## Daily UX (Phase 26)

- **M4-UX-001 (MUST)** The command palette also finds Connect apps / plugins; Enter opens that plugin's page in `PluginsOverlay`; keyboard accessible. (R-01)
- **M4-UX-002 (MUST)** Right-clicking (and keyboard-opening) a routine row opens Pause/Resume, Test, Edit, Delete using existing endpoints; Delete confirms. A plain click stays click-to-edit (the reference does not say what a click does instead; see Phase 26 D-26-1). (R-02)
- **M4-UX-003 (SHOULD)** User bubbles in a 1:1 Bot chat take that Bot's color via semantic tokens with an "Accent to Black" appearance setting that restores the neutral bubble; contrast holds in light and dark. (R-04)
- **M4-UX-004 (SHOULD)** The slash picker is keyboard operable (arrows, Enter, Escape) or is removed consistently with the changelog; the chosen behavior is recorded as a decision. (R-05, unverified)

## Email (Phase 27)

- **M4-EML-001 (MUST)** The approved draft payload is the delivered payload: Send uses the stored fields, not a model re-interpretation, or verifies equality. (R-06)
- **M4-EML-002 (MUST)** Email drafts have typed to/cc/bcc/subject/body fields and a sanitized rich-text body with a plain-text fallback; malicious HTML never executes. (R-06)
- **M4-EML-003 (SHOULD)** A From picker shows only provider-authorized send-as addresses; when the provider does not expose them, no picker is shown. (R-08, provider-dependent)
- **M4-EML-004 (SHOULD)** Gmail Spam search/restore is available through the connector with approval for the move. (R-10, provider-dependent)
- **M4-EML-005 (SHOULD)** Failed sends say so on the card and are retryable. (R-09)

## Slides (Phase 28)

- **M4-SLD-001 (MUST)** A Bot can produce a slide deck as a versioned artifact with an in-chat preview and a PowerPoint (.pptx) download that opens with editable text. (R-11)
- **M4-SLD-002 (MAY)** Google Slides delivery when the user has connected Google; otherwise not shown. (R-11, provider-dependent)
- **M4-SLD-003 (MUST)** Deck artifacts are owner-scoped like all artifacts; no public sharing.

## Mobile (Phase 29)

- **M4-MOB-001 (SHOULD)** The mobile voice-memo row shows the transcript and highlights/seeks when timings exist, with a plain transcript fallback. (R-14)
- **M4-MOB-002 (SHOULD)** The mobile thread project card shows progress and opens the project. (R-15)
- **M4-MOB-003 (MAY)** Voice-memo recording from the mobile thread (reference unverified).
- Team Bot create/setup/publish on mobile is **not required** (R-13).

## Integrations (Phase 30)

- **M4-INT-001 (MUST)** A Team Bot's outbound Slack text may notify a user group only when Slack lists that group; `@here`, `@channel` and `@everyone` never notify; display labels are never treated as ids; failures fall back to plain text. (R-12; corrected in Phase 30: the reference is about sending, not recognizing, mentions.)
- **M4-INT-002 (SHOULD)** Outbound Slack text cannot forge special mentions. (R-12; ordinary `&`/`<`/`>` escaping stays with the vendor adapter.)

## Release gate (Phase 31)

- **M4-REL-001 (MUST)** Every MUST above has a green recorded test or an explicit documented waiver; zero known P0/P1.
- **M4-REL-002 (MUST)** Full typecheck, lint, unit, Postgres integration and web e2e results are recorded with commands; failures are either fixed or listed as pre-existing with baseline proof.
- **M4-REL-003 (MUST)** Electron e2e and device checks run in CI/on devices only; until then they stay open.
- **M4-REL-004 (MUST)** Upstream merge surface re-analysed; no merge executed without maintainer approval.
- **M4-REL-005 (MUST)** Maintainer approval is recorded by the maintainer, never by an agent.
