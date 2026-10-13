# M4 Acceptance Matrix

One acceptance test per MUST. "Result" stays `open` until a recorded command passes on a recorded commit. SHOULD rows list the intended test.

| Req | Test (type, file to add or extend) | Phase | Result |
|---|---|---|---|
| M4-ORCH-001 | Postgres integration: project stop cancels owned run, subagent run and cloud agent; unrelated run and other user's project untouched; second stop is a no-op (`apps/api/src/project-control.postgres.test.ts`) | 25 | pass locally 2026-10-12 (no CI); 2026-10-13 follow-up locks Project state before child scheduling/cancel and guards Cloud Agent launch (implemented / static-reviewed / runtime-unverified) |
| M4-ORCH-002 | Postgres integration: two child tasks on one Team Computer bot both finish, second queues instead of `ComputerBusyError` (`packages/adapters/src/project-orchestration.postgres.test.ts`) — verifies queue-then-run via the lease, not the full executor loop | 25 | pass locally 2026-10-12 (no CI) |
| M4-ORCH-003 | Integration: seed a pre-M3 schema with data, apply remaining migrations, assert rows intact (`packages/db/src/migration-upgrade.postgres.test.ts`, added to `harness.ts`) | 25 | pass locally 2026-10-12 (no CI) |
| M4-ORCH-004 | Postgres: card deeper than 200 messages updates (SHOULD) | 25 | pass locally; interval not made configurable |
| M4-ORCH-005 | `pnpm exec biome check .` exits 0 | 25 | pass locally 2026-10-12 |
| M4-UX-001 | Unit (result builder) + e2e: Cmd/Ctrl-K, type a connector name, Enter opens its page (`apps/web/e2e/command-palette.spec.ts`) | 26 | pass locally 2026-10-12 (web e2e; no CI/Electron) |
| M4-UX-002 | e2e: right-click row, Pause/Resume/Test/Delete (confirm) work; Escape closes; keyboard open (`apps/web/e2e/routine-crud.spec.ts`) | 26 | pass locally 2026-10-12 (web e2e; no CI/Electron) |
| M4-UX-003 | Unit: token contrast, accent-off restores neutral (`packages/ui-tokens/src/appearance.test.ts`); e2e `message-accent.spec.ts` (SHOULD) | 26 | pass locally (core AA test + web e2e) |
| M4-UX-004 | e2e: keyboard selection in slash picker (`slash-skills.spec.ts`) (SHOULD) | 26 | pass locally |
| M4-EML-001 | Integration/unit: Send publishes the stored payload; edited fields appear verbatim in the delivery call (`apps/api/src/draft-actions.test.ts`, `packages/adapters/src/draft-binding.test.ts`, `executor-readonly-approval.test.ts`) | 27 | pass locally 2026-10-12 (mocked provider); 2026-10-13 follow-up pins the actor's sole matching connection plus an opaque provider-account snapshot, fails closed on unapproved provider/operation/arguments, and requires fresh approval for alternate side-effect routes (implemented / static-reviewed / runtime-unverified) |
| M4-EML-002 | Unit: schema validation, sanitizer strips script/handlers/`javascript:`; plain-text fallback; component test + `draft-action.spec.ts` | 27 | pass locally 2026-10-12 |
| M4-EML-003 | Capability test: server-verified aliases only; otherwise use the selected account's default sender (SHOULD) | 27 | non-default sender is unsupported and stripped from new email drafts; exactly one actor-owned provider connection is pinned at submit (implemented / static-reviewed / runtime-unverified; no live alias capability) |
| M4-EML-004 | Emulator test: Spam search and restore use the consequential-action approval policy (SHOULD) | 27 | no real Spam provider capability is exposed; mutating label actions use normal approval and are forced to a fresh approval in submitted-draft runs (static-reviewed / runtime-unverified) |
| M4-EML-005 | Component test: failed send state with retry (SHOULD) | 27 | card submission and run intent now commit atomically; stable nonce replays the same run and the reconciler recovers queued work. Provider failure/unknown outcome stays in Run/ExternalEffect state; the draft is not reopened (implemented / static-reviewed / runtime-unverified) |
| M4-SLD-001 | Unit: deck model → .pptx bytes; unzip and assert slide count, title and body text present; API test: artifact created and versioned; e2e: deck card preview and download | 28 | pass locally 2026-10-12 (file not opened in an Office/Slides client) |
| M4-SLD-002 | Capability test: Google Slides control appears only for a structured create/upload capability (MAY) | 28 | control removed; the legacy API endpoint returns unsupported after artifact ownership validation (implemented / static-reviewed / runtime-unverified; no structured Slides provider) |
| M4-SLD-003 | API test: other user cannot read a deck artifact | 28 | pass locally 2026-10-12 (`presentation-export.test.ts`) |
| M4-MOB-001 | Timed transcript segments highlight and seek through the active player; device run stays blocked | 29 | HTML Audio and Expo Audio seek paths are implemented for timed segments; plain transcript remains non-seekable when timings are absent (implemented / static-reviewed / runtime-unverified on device) |
| M4-MOB-002 | Unit test on mobile project-card presentation helper (SHOULD) | 29 | partial: card shows progress and opens the project (typecheck + i18n test only) |
| M4-MOB-003 | MAY: mobile voice memo recording lifecycle and recovery | 29 | recording already exists; cleanup, pre-base64 size guard, background cancellation, and same-artifact retry within the active app session were hardened (implemented / static-reviewed / runtime-unverified on device; process-restart recovery remains unsupported) |
| M4-INT-001 | Unit: outbound policy for authorized/unauthorized/label-only group mentions and `<!here>`/`<!channel>`; surface applies it (`slack-mentions.test.ts`, `chat-sdk-surface.test.ts`) | 30 | pass locally 2026-10-12 (no real Slack) |
| M4-INT-002 | Unit: special-mention forging blocked (SHOULD) | 30 | pass locally (special tokens only) |
| M4-REL-001..005 | Recorded in Phase 31 `HANDOFF.md`; REL-003 and REL-005 need CI/devices/maintainer | 31 | open |

## Unsupported-integration policy

- A capability the provider cannot supply (send-as, Spam, Google Slides) is hidden or shown disabled with the reason; it never renders an inert control.
- Provider-specific behavior stays inside adapters/connectors; UI and contracts carry capabilities only.
