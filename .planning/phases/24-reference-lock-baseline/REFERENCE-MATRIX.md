# M4 Reference Matrix

Audit date: 2026-10-12. Baseline: `ca1dc816` on `main` (branch `m4-execution`).

Reference: public Grok Bot changelog and docs. Verbatim quotes and URLs live in `REFERENCE-SOURCES.md` (same folder). Latest version seen: **v0.68.1 (2026-10-07)**; the M3 pin was v0.66.0 (2026-10-02). `https://x.ai/changelog/bot` returned HTTP 403 live, so the changelog was read from a Wayback capture dated 2026-10-10 and is unverified for anything published after that. The five docs pages are undated.

Evidence vocabulary: **docs** = explicit text on a docs page; **changelog** = one changelog line only (no docs corroboration); **unverified** = sources are silent or conflict. Local status: present / partial / absent / different / n/a (not applicable) / provider-dependent. Local pointers come from a read-only code audit on `ca1dc816` and were spot-checked (command palette is bot-only; no `sendAs`, `pptx`, or `subteam` code in repo source; no cloud-agent reference in `project-control.ts`).

## Mandatory-scope candidates

| ID | Reference behavior (version, evidence) | Platform | Local status and pointers | Sev | Owner |
|---|---|---|---|---|---|
| R-01 | Command palette also finds plugins; Enter opens the plugin page (v0.68.0, changelog) | web/desktop | **partial**: `apps/web/src/pages/shell/command-palette.tsx` lists bots only (`CommandPalette`, `botSearchText`); `PluginsOverlay.tsx` has catalog/list RPCs and a `detailKey` state but no initial-detail prop. Test: `e2e/command-palette.spec.ts` (bot switch only) | P2 | 26 |
| R-02 | Right-click a routine in the details pane: Pause, Resume, Test, Edit, Delete; clicking a routine no longer opens its detail view (v0.68.0, changelog) | desktop/web pointer | **absent** for the row: `RoutineListRow` (`RoutineEditor.tsx`) is a plain button; actions exist only inside `RoutineEditor`. Endpoints present: `routines.update` (`active`), `routines.testRun`, `routines.remove`. Bot rows already use `onContextMenu` + `BotContextMenu.tsx`; no `ContextMenu` primitive in `packages/ui-web` | P2 | 26 |
| R-03 | Mobile: routines can be paused, resumed, deleted; editing and testing need desktop (docs) | mobile | not re-audited here; unchanged by M4 (see Phase 18 evidence) | n/a | – |
| R-04 | Your messages in a 1:1 Bot chat take that Bot's color; Settings → General "Accent to Black" turns it off (v0.68.1, changelog; group/Team Bot behavior not stated) | all (inferred) | **absent**: user bubble uses semantic `chatUser` tokens (`packages/ui-tokens/src/index.ts`, `tokens.css`, Shell `message-user-bubble`); bot color only drives avatars and speaker names (`bot-avatar-colors.ts`). No appearance setting. Mobile bubbles use `tokens.muted` | P3 | 26 |
| R-05 | Typing "/" in the composer no longer opens a menu of skills and actions (v0.68.1, changelog) **but** the skills docs still say skills are referenced with "/" | web/desktop | **different / unverified**: Shell `updateDraft` opens a slash picker (`slashSkillOptions`, `SLASH_ACTIONS` in `packages/core/src/composer-slash.ts`); picker has **no keyboard navigation** (only `@` does, via `resolveMentionPickerKey`). IME and Enter handling present (`isComposing`). Tests: `composer-mention-picker.test.ts`, `mention-picker-keyboard.spec.ts`, `slash-skills.spec.ts` (click only) | P2 (behavior unverified) | 26 |
| R-06 | Bots can send formatted emails from a draft card (headings, bold, lists) (v0.68.1, changelog) | chat | **partial**: `DraftActionCard.tsx` + `draft_action` block (`packages/contracts/src/events.ts`) carry generic `fields[{key,label,value,multiline}]`; no typed to/cc/bcc/subject/html/attachments/sender. Send is a **re-prompt to the agent** (`executionPrompt`; `threads.send`), so the delivered email is not guaranteed to equal the approved fields. Gmail runs through Composio/Pipedream (`GMAIL_SEND_EMAIL` has `is_html` in the emulator); no HTML preview/sanitization in UI | P1 (approved≠delivered risk) | 27 |
| R-07 | Draft-card email content is editable (not stated: docs say card offers send or discard) | chat | **unverified** reference; local edit/save/discard exists (`draft-action.spec.ts`) | n/a | 27 (keep existing edit) |
| R-08 | Gmail send-as: drafts can go out from a verified send-as address, From picker when >1 (v0.68.0, changelog) | chat, Gmail | **absent**: no send-as code anywhere; provider-dependent (Composio/Pipedream tool support unknown offline) | P2, provider-dependent | 27 |
| R-09 | Gmail draft cards include signature; failed send says "Couldn't send this draft"; failed reply-all says "Message not delivered" (v0.67.0–0.68.0, changelog) | chat | not audited per-state; send failure is surfaced via agent reply today | P2 | 27 |
| R-10 | Bots can search Gmail Spam and move a message back to the inbox (v0.68.1, changelog) | chat | **absent** in app code; Composio emulator filters `SPAM` label only. Provider-dependent; consequential move must stay behind approval (`action-approval.ts`) | P2, provider-dependent | 27/30 |
| R-11 | Slide decks: Bot builds decks with you, shows sample slides to choose, delivers as PowerPoint files or Google Slides (v0.68.1, changelog; no docs page) | all (artifact) | **absent** as a type; generic `Artifact` model with versions/storage exists (`schema.prisma` `Artifact`, `ArtifactStore`, `apps/web/src/pages/Artifacts.tsx` previews html/md/pdf/image only; export = download). No pptx library in any package | P1 | 28 |
| R-12 | Team Bots can mention a Slack user group; @here/@channel still ping no one (v0.68.1, changelog) | Slack, Team Bots | **absent**: `enrichSlackTeamRoom` recognises only `<@botUserId>`/`app_mention`; no `<!subteam^…>` or user-group handling, no repo-level outbound escaping (delegated to `@chat-adapter/slack`) | P2 | 30 |
| R-13 | Team Bots usable from desktop, mobile app, and Slack; **create, setup, publish are desktop-only** (team-bots docs) | mobile | **present / exceeds reference**: mobile can list/create/open (`apps/mobile/app/new-team-bot.tsx`). Publish/unpublish UI is absent on mobile and is **not required** | n/a | 29 (no work) |
| R-14 | Mobile plays a voice memo a Bot sent (docs). Recording a memo on mobile: not described anywhere | mobile | playback **partial** (`VoiceMemoRow` plays audio but ignores `block.transcript`); recording in thread **absent**; recorder exists only for calls/dictation (`call-session.ts`, `dictation.ts`). Recording = **unverified** reference → MAY | P2 (transcript), MAY (record) | 29 |
| R-15 | Project status visible in thread | mobile | **partial**: `thread.tsx` project block shows title/status/objective, ignores `block.progress`, not tappable; `project.tsx` has Stop/Retry | P2 | 29 |
| R-16 | Stop or a new message ends a stuck Bot within ~30 s (v0.68.1, changelog) | all | **partial**: Stop cascades to project **runs only**; cloud agents are not in the cascade (`apps/api/src/project-control.ts` `stopProjectWork`; `cloud_agent_cancel` is a separate tool). Not a reference item per se, an M3 residual (P25) | P1 | 25 |

## Local-only gaps (from M3 Phase 23, not reference items)

| ID | Gap | Pointers | Sev | Owner |
|---|---|---|---|---|
| L-01 | Same-bot children on a Team Computer: per-bot lease → `ComputerBusyError`, no queueing | `computer-lifecycle.ts` `acquireComputerExecutionLease`; `startProjectTask` caps only count | P1 | 25 |
| L-02 | Cloud agents not stopped by project stop | see R-16 | P1 | 25 |
| L-03 | Main Bot attention up to ~30 s (hard-coded `DEFAULT_INTERVAL_MS`), card sync scans 200 messages per open project per pass | `job-reconciler.ts`, `project-orchestration.ts` `syncProjectCard` | P2 | 25 |
| L-04 | 2 biome format errors in `team-bots.test.ts` and `thread-events.ts` (found again 2026-10-12) | repo root `pnpm exec biome check .` | P3 | 25 |
| L-05 | No upgrade-from-populated-schema migration test | Phase 23 P23-15 | P1 | 25 |

## Other changelog items (v0.67.0–v0.68.1) — not in mandatory M4 scope

Not audited against local code in this phase. Candidates for a later milestone, each `unverified` locally: approval-card wording naming the Bot and quoting its instruction; "Bot is waiting for you" notification wording; reconnect card when X/Vercel sign-in expires; Team Bots excluded from primary-Bot picker; Settings → Computer Remove; PR link hover card; draggable Unassigned section; copy keeps line breaks/URLs; working-status phrases; larger/faster Bot computer; browser recovery; Secure Forms for checkout. Recorded so they are not lost; no claim is made that any is missing.

## Exit check (P24 exit)

Every item in the mandatory table has a source row (here or `REFERENCE-SOURCES.md`) and a code pointer. R-05 and R-07 and R-14 (recording) have unresolved reference uncertainty and are therefore kept out of MUST in `M4-REQUIREMENTS.md`.
