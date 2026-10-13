# Phase 30 Handoff — Messaging & Integration Edge Parity

## Current Status

DOING — 2026-10-12 (Claude Code, Sonnet 5.5). Outbound Slack mention policy implemented and unit-tested; never exercised against real Slack.

## Branch

`m4-execution` (local, not pushed).

## Changes

- `packages/adapters/src/slack-mentions.ts` (+test); `chat-sdk-surface.ts` (`sanitizeOutbound` hook in `sendToThread`, +test); `messaging-platforms.ts` (`slackOutboundSanitizer`, Slack platform uses it, +test); `docs/self-host.md` paragraph.

## New visible copy

- None in the product UI. The rewritten text uses `@here`, `@channel`, `@everyone`, `@<label>` or `@usergroup` as plain words.

## Verification (local)

- `slack-mentions.test.ts` (12), `chat-sdk-surface.test.ts` (+1), `messaging-platforms.test.ts` (+1): 57/57 in the three files; `tsc` clean for adapters; lint 0 errors.
- Not verified: a real `usergroups.list` reply shape, rate limits, a real post.

## Known limits

- The Bot needs a group id from the user (or from its instructions); there is no tool that lists groups.
- Only Slack special tokens are rewritten; ordinary text escaping stays with the vendor adapter.
- The sanitizer runs on every Slack post, including DMs, which is intended (the rule is about what a Bot may notify).

## Upstream surface

`chat-sdk-surface.ts` and `messaging-platforms.ts` are not predicted conflict files; the new module is additive.

## Next recommended task

Phase 31 (final release gate).
