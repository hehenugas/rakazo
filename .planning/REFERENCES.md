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
