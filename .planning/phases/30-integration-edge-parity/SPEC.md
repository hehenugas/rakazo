# Phase 30 — Messaging & Integration Edge Parity

## Objective

Close the Slack user-group mention behavior from the v0.68.1 changelog ("Team Bots can mention a Slack user group so its members get notified, while @here and @channel still don't ping anyone") inside the Slack adapter, without leaking vendor logic into core or contracts.

## Maintainer directive

All M4 phases were requested in one run; documented exception to the M3 Phase 23 dependency.

## Correction to Phase 24

`M4-REQUIREMENTS.md` first described M4-INT-001 as recognizing an inbound group mention of the bot. The changelog line is about what a Team Bot may **send**. The requirement is rewritten accordingly (outbound policy).

## Findings

- All outbound text for every platform flows through `ChatSdkMessagingSurface.sendToThread`, which posted `request.body` unchanged. The vendor Slack adapter treats a plain string as raw Slack text, so a Bot writing `<!channel>` would have notified the whole channel.
- Group ids are only knowable from Slack (`usergroups.list`, scope `usergroups:read`); a display label is not an id.

## Design

- `slack-mentions.ts` (adapters only): `<!here>`, `<!channel>`, `<!everyone>` become the plain words; `<!subteam^ID>` survives only when `ID` is in the workspace's active group list, otherwise it becomes `@label` text. The list is fetched lazily (only when a group mention is present), cached for 5 minutes (30 s after a failure), and any failure yields an empty list (fail closed).
- Provider-neutral hook: `MessagingPlatform.sanitizeOutbound?` applied in `sendToThread`; only the Slack platform sets it. Contracts, core and UI are untouched.
- No environment variables, no schema changes, no model-facing prompt text (the Bot has no id source unless the user gives one; a lookup tool was deliberately not added).
