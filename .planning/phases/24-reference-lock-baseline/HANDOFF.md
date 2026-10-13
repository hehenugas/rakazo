# Phase 24 Handoff — Reference Lock & Baseline

## Current Status

DONE for audit deliverables (2026-10-12, Claude Code Sonnet 5.5). P24-04 (journey capture) open.

## Maintainer directive

The maintainer asked for all of M4 (24–31) to be completed in one autonomous run; this is the approved exception to the M3 Phase 23 dependency. M3 Phase 23 remains DOING and was not edited.

## Branch / Worktree

`m4-execution` (local, not pushed), from `main` @ `ca1dc816`.

## Findings

- Reference: latest v0.68.1 (2026-10-07). Changelog live page returns 403; read via a 2026-10-10 Wayback capture.
- Largest gaps: slide decks (absent), approved≠delivered email risk (Send re-prompts the agent), project stop not reaching cloud agents, Team Computer child serialization, palette/routine-menu/user-bubble color, Slack user-group mentions, Gmail send-as/Spam (provider-dependent).
- Not required: mobile Team Bot create/publish (docs: desktop-only); mobile voice recording (reference unverified).
- Slash: changelog says "/" no longer opens a menu; skills docs still mention "/"; treated as unverified.

## Upstream merge surface (2026-10-12, dry run only)

Fork 43 ahead, upstream 146 ahead. Predicted conflicts (34): `apps/api/src/router.ts`, mobile `{bot-settings,index,_layout,routine,thread}.tsx`, mobile `locales/{de,ru,zh}.ts`, `apps/web/e2e/activity-list.spec.ts`, web `RoutineEditor.tsx`, `Shell.tsx`, `CHANGELOG.md`, `adapters/executor.ts`, `contracts/{domain,rpc,runs}.ts`, `core/{attachments,attachments.test,cron,index,run-state}.ts`, `db/prisma/schema.prisma`, `db/src/repos.ts`, and 10 web `messages.po`. M4 phases that edit `router.ts`, `Shell.tsx`, `rpc.ts`, `domain.ts`, `executor.ts`, `schema.prisma`, `repos.ts` add to these; prefer new modules.

## Next recommended task

Phase 25.
