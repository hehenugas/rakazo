# Reference Map

## Product References

Use current official sources when implementation details are uncertain or may have changed.

- Rakazo upstream: https://github.com/elie222/rakazo
- Grok Bot docs overview: https://docs.x.ai/grok-bot/overview
- Grok Bot skills/routines/automations: https://docs.x.ai/grok-bot/skills-routines-and-automations
- Grok Bot Team Bots: https://docs.x.ai/grok-bot/team-bots
- Grok Bot chat/collaboration: https://docs.x.ai/grok-bot/chat-and-collaboration
- Grok Bot changelog: https://x.ai/changelog/bot
- Grok Bot design article: https://x.ai/news/designing-grok-bot

## M3 Current Product Reference — 2026-10-06

Captured 2026-10-06; changelog covers v0.17.0 (Aug 12 2026) through v0.66.0 (Oct 2 2026), the current release at capture time. Full capture record, journey matrix, and gap register: `phases/17-experience-parity-contract/JOURNEY-MATRIX.md`.

Current official sources are sufficient to pin important M3 journeys even without authenticated screenshots:

- `https://docs.x.ai/grok-bot/skills-routines-and-automations` — Routine = workflow owned by one Bot; start with a one-time task; manage via View conversation details → Routines; enable/pause, Test run, edit schedule/instruction, inspect history, delete.
- `https://docs.x.ai/grok-bot/mobile` — mobile Routine view exposes schedule, next run, instruction, Run history, Active/pause, delete; editing/testing remains desktop-only in the current reference.
- `https://docs.x.ai/grok-bot/team-bots` — Publish to Team; Copy Bot vs Start fresh; setup choices; owner-controlled shared setup; teammate-private conversations; routines are personal per member.
- `https://docs.x.ai/grok-bot/bots` — New chat/Create new Bot, View conversation details-centered management, hide/unhide, template/share mental model.
- `https://x.ai/changelog/bot` — plugin-centric Marketplace/Search plugins, Connect apps featured treatment, composer list behavior, failed-send Resend/Delete, Team Bot setup/publish lifecycle, voice transcript highlight/seek, Project as a Cloud Agent that plans and runs its own agents, and related interaction-state changes.

M3 treats those descriptions as executable behavioral references. Pixel identity is not required.

## M2 Reference Handling

M2 used public, observable Grok Bot behavior as a pinned UX reference rather than relying on memory or broad “Grok-like” descriptions.

For historical M2 Phase 10–16 work:

- record the capture date and source for each canonical state
- prefer current official product/docs/changelog/design material
- pin viewport and deterministic fixture assumptions
- store fork evidence under the matching `.planning/evidence/phase-XX-*/` directory
- document every visual-diff mask/tolerance and every intentional security/accessibility/native-platform divergence
- if Grok changes during M2, record the delta and deliberately re-pin; do not silently move the target mid-phase

## Rakazo Code Areas Already Identified

These paths existed in upstream Rakazo during initial analysis and should be revalidated after the fork is initialized.

Revalidated 2026-10-04 against baseline commit `fd3563756315da7c593ed49ee5e63d45a4005f8a`: every path listed below exists in the checked-out code.

- `apps/web/src/pages/Shell.tsx`
- `apps/web/src/pages/shell/bot-panel.tsx`
- `apps/web/src/pages/ResizableSidePanel.tsx`
- `apps/web/src/pages/RoutineEditor.tsx`
- `apps/web/src/pages/RoutineRunHistory.tsx`
- `apps/web/src/pages/PluginsOverlay.tsx`
- `apps/web/src/pages/SpaceSearch.tsx`
- `apps/web/src/components/teach/SkillDraftCard.tsx`
- `apps/web/src/components/call/CallCard.tsx`
- `apps/web/src/components/call/VoiceChatCard.tsx`
- `packages/contracts/src/domain.ts`
- `packages/contracts/src/search.ts`
- `packages/core/src/action-approval.ts`
- `packages/adapters/src/reply-context.ts`
- `packages/adapters/src/team-chat-messaging.ts`
- `packages/db/prisma/schema.prisma`
- `apps/api/src/search.ts`

## Known Existing Rakazo Capabilities

Revalidate before implementing duplicates:

- Auto Review already exists.
- Teach-by-demonstration to Skill draft already exists.
- Duplicate Bot already exists.
- Search across conversations/messages/files/links/routines already exists.
- Replies/reactions/mentions already exist.
- Routine schedule + webhook + GitHub + message trigger support already exists.
- Cloud-agent and subagent primitives already exist.
- Voice call/dictation/TTS already exist.
- Provider-neutral connectors already exist.

If code in the fork differs from this reference after initialization, trust the checked-out code and update this document.

Revalidated 2026-10-04 against baseline commit `fd3563756315da7c593ed49ee5e63d45a4005f8a`: all capabilities confirmed in code —
Auto Review (`packages/core/src/action-approval.ts`), teach-by-demonstration (`packages/core/src/teach-playbook.ts`, `apps/web/src/components/teach/SkillDraftCard.tsx`), Bot duplicate (`apps/api/src/router.ts` `bots.duplicate`), space search (`apps/api/src/search.ts`), replies/reactions/mentions (`packages/contracts/src/events.ts`), routine schedule/webhook/GitHub/message triggers (`packages/db/prisma/schema.prisma`), cloud-agent and subagent primitives (`packages/contracts/src/runs.ts`, `packages/adapters/src/builtin-tools.ts`), voice call/dictation/TTS (`apps/web/src/components/call/CallCard.tsx`), provider-neutral connectors (`packages/adapters/src/composio-*.ts`, Pipedream connector).
