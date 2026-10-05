# M2 Parity Matrix — Canonical State Reference

Phase 10 deliverable. One row per canonical state from `SPEC.md`, mapping the pinned
public Grok Bot reference, the local implementation, evidence, the verification method,
and the known delta. Scorecard columns use:

- `✓` verified match (against pinned reference or green CI evidence)
- `△` intentional delta (see `INTENTIONAL-DELTAS.md`)
- `✗` known gap (work for phases 11–16)
- `?` reference not yet pinnable without an authenticated Grok capture

Scorecard order: **G**eometry · **T**ypography · **C**opy · **I**nteraction · **T**iming ·
**R**esponsive · **A**ccessibility.

## Reference registry (P10-01)

| Source | Captured | What it pins |
|---|---|---|
| https://docs.x.ai/grok-bot/overview | 2026-10-05 | Product surfaces: bots with roles + memory, one shared cloud computer, connectors, skills/routines on a schedule, group chats, voice ("Type, dictate, or start a voice chat", "voice memos and drafts you approve before they are sent"), desktop + mobile platforms, setup framing ("Setup is a message, not a workflow builder"), approvals ("approve consequential steps"). |
| https://docs.x.ai (release notes) | 2026-10-05 | "Grok Bot is now available. Durable AI teammates that work on a persistent cloud computer, with messaging, approvals, connectors, and routines. Team admins can …" |
| Authenticated Grok Bot app states | not yet captured | Live UI geometry/copy/timing per state. **Procedure**: maintainer signs in to the public product, sets the viewport to 1440×900 (desktop) / 1024×768 (narrow) / 390×844 (mobile), captures each canonical state, and stores PNGs under `.planning/evidence/phase-10-reference/reference/` with a `SOURCE.md` (URL, capture date, account context). Phases 11–16 diff against those with `scripts/visual-diff.mjs`. |

Public marketing/help pages and the docs above are the only sources an agent can pin
without a Grok account; nothing in this matrix guesses geometry "from memory".

## Canonical states

| # | State | Reference source | Fork implementation | Fork evidence | Verification method | Known delta | G · T · C · I · T · R · A |
|---|---|---|---|---|---|---|---|
| 1 | Empty/idle Bot conversation | docs overview; auth capture pending | `Shell.tsx` chat + onboarding choice card | `parity/canonical-states` → `01-idle-conversation` (baseline) | screenshot diff (tolerance 0.02, masks: `time`, `roster-time`) | Card copy is fork-authored; Grok's empty-state copy unverified | ? · ? · △ · ✓ · ? · ✓ · ✓ |
| 2 | Working Bot | docs ("Bots work on a persistent cloud computer") | run status chip + transcript activity; scripted runtime | `15-working-bot` (capture-only) | behavioral: `response-streaming.spec.ts`, `stuck-work.spec.ts` | Timing profile differs (scripted runtime is faster than live computer work) | ? · ? · ? · ✓ · ✗→11-16 · ✓ · ✓ |
| 3 | Waiting-for-user Bot | docs ("Bots hand human-required steps back") | `computer-card` protected input + takeover | `16-waiting-for-user` (capture-only) | behavioral: `golden.spec.ts` takeover flow, `host-computer-prompt.spec.ts` | Card copy re-pinnable only from live capture | ? · ? · ? · ✓ · ? · ✓ · ✓ |
| 4 | Unread/attention in roster | auth capture pending | roster row unread dot + sr-only label + preview | `14-roster-unread` (baseline) | screenshot diff (masks: `time`, `roster-time`) | Preview text = scripted reply, not live agent output | ? · ? · ? · ✓ · ? · ✓ · ✓ |
| 5 | Search open | docs overview nav; auth capture pending | on-demand `sidebar-search` overlay | `02-search-open` (baseline) | screenshot diff | Query-result grouping parity checked in phase 11 | ? · ? · △ · ✓ · ? · ✓ · ✓ |
| 6 | New chat open | auth capture pending | `create-menu-trigger` picker (Bot / Team Bot / group / space) | `03-new-chat-open` (baseline) | screenshot diff | Picker taxonomy is fork's M1 model | ? · ? · △ · ✓ · ? · ✓ · ✓ |
| 7 | Conversation Details home | docs overview; auth capture pending | details hub (`conversation-details`) via identity pill | `04-conversation-details-home` (baseline) | screenshot diff | Section inventory (Computer/Tasks/Routines/Library/Bot settings/Share/Main Bot) is M1 scope | ? · ? · △ · ✓ · ? · ✓ · ✓ |
| 8 | Tasks list + Project detail | docs overview does not describe projects; auth capture pending | `bot-tasks` list + `project-detail` (status, goal, plan, tasks) | `05-tasks-list`, `06-project-detail` (baselines) | screenshot diff | Projects may not exist in Grok Bot — confirm during reference capture; if absent, this becomes an intentional fork feature | ? · ? · △ · ✓ · ? · ✓ · ✓ |
| 9 | Routines list/editor | docs ("demonstrate once → saved as skill → rerun on a schedule") | routines list + editor (cron/timezone/webhook/GitHub) | `07-routines-list` (baseline) | screenshot diff | "Skill" wording vs fork "Routine" — reconcile in phase 11 copy pass | ? · ? · △ · ✓ · ? · ✓ · ✓ |
| 10 | Library | auth capture pending | details hub Library (space artifacts) | `08-library` (baseline, empty state) | screenshot diff | Populated-state diff needs seeded artifact evidence | ? · ? · ? · ✓ · ? · ✓ · ✓ |
| 11 | Connect apps / plugin search | docs ("Bots use connectors where available") | Connect apps overlay: featured tiles, catalog search, connection detail | `09-connect-apps-catalog`, `10-connect-apps-search` (baselines) | screenshot diff | Catalog composition is emulator-driven; live connector list differs per account | ? · ? · △ · ✓ · ? · ✓ · ✓ |
| 12 | Team Bot setup/published state | docs release notes ("Team admins can…"); setup steps not public | create-team-bot form → private instance → Share template row | `11-team-bot-setup`, `12-team-bot-instance` (baselines) | screenshot diff | Grok publish/manager surfaces have no fork equivalent yet — phase 14 | ? · ? · ✗→14 · ✓ · ? · ✓ · ✓ |
| 13 | Main Bot selected + proactive check-in | auth capture pending | roster star, details "Make Main Bot" toggle, proactive check-ins routine | `13-main-bot-selected` (baseline); check-in capture in `phase-06` evidence | screenshot diff + `main-bot.spec.ts` | Check-in cadence (every 4h) is fork default | ? · ? · △ · ✓ · △ · ✓ · ✓ |
| 14 | Normal assistant response | auth capture pending | transcript message + scripted runtime reply | `17-normal-response` (capture-only) | behavioral: transcript contains deterministic reply; `response-streaming.spec.ts` | Reply copy differs (different model/provider) | ? · ? · △ · ✓ · ✗→12 · ✓ · ✓ |
| 15 | Tool/activity disclosure | auth capture pending | collapsible activity rows in transcript | `phase-04` evidence; `tool-activity.spec.ts` | behavioral spec | Disclosure trigger copy unverified | ? · ? · ? · ✓ · ? · ✓ · ✓ |
| 16 | Approval request | docs ("approve consequential steps") | approval cards + user-settings confirmation policy | `phase-04` evidence `20-approval-input-request`, `24-approval-resumed-after-reload` | behavioral: `approval-resume.spec.ts`, `consequential-approval.spec.ts` | Approval wording re-pinnable from live capture | ? · ? · ? · ✓ · ? · ✓ · ✓ |
| 17 | Editable action draft | docs ("drafts you approve before they are sent") | `draft-action-card` edit/save/submit/sent + discard | `18-editable-draft` (capture-only); `phase-04` evidence `10/11` | behavioral: `draft-action.spec.ts` | Field labels (To/Subject/Body) verified; Grok's exact draft chrome unverified | ? · ? · △ · ✓ · ? · ✓ · ✓ |
| 18 | Failed message | auth capture pending | failed-send banner + retry/delete in transcript | existing `run-failure.spec.ts` | behavioral spec | Retry wording unverified | ? · ? · ? · ✓ · ? · ✓ · ✓ |
| 19 | Voice memo with transcript/playback | docs ("Type, dictate, or start a voice chat") | voice memo record/send/playback + transcription | `phase-04` evidence `14-voice-memo-playback` | behavioral: `voice-memo.spec.ts` | Transcript-highlight timing unverified | ? · ? · △ · ✓ · ✗→13 · ✓ · ✓ |
| 20 | Attachments/artifacts | auth capture pending | attachment pipeline + artifact preview/library | `artifact-preview.spec.ts`, `artifacts-tab.spec.ts` | behavioral specs | Preview chrome unverified | ? · ? · ? · ✓ · ? · ✓ · ✓ |
| 21 | Narrow desktop | auth capture pending | responsive shell (collapsed sidebar, fluid column) | `19-narrow-desktop-idle` (baseline) | screenshot diff | Breakpoint values are fork's; measure reference during capture | ? · ? · ? · ✓ · ? · ✓ · ✓ |
| 22 | Mobile equivalents | docs (iOS/iPadOS/Android apps) | Expo mobile app (native-first) | `phase-08-mobile` evidence (35 captures) | behavioral + curated captures | Native platform conventions intentionally diverge — see deltas doc | △ · △ · △ · ✓ · △ · ✓ · ✓ |

## Measured fork geometry (P10-09/P10-10)

Authoritative numbers live in `shell-geometry.json` (`.planning/evidence/phase-10-reference/`),
emitted by the `geometry and typography measurements` test in
`parity/canonical-states.spec.ts` at the 1440×900 desktop viewport. Headline values
(2026-10-05, fork `main`):

| Surface | Measured |
|---|---|
| Bots sidebar width | 316 px |
| Roster row (fixture bot) | 295 × 58 px, 10 px inset |
| Conversation header height | 65 px (identity pill centered, 36 px tall) |
| Transcript region | full width under header; centered 55 rem column on wide screens via max() padding |
| Composer | 880 × 52 px, horizontally centered under the transcript column |
| Roster name typography | 14 px / 600 / 21 px line-height, foreground ink |
| Identity pill typography | 16 px / 400 / 24 px |
| Side panel | opens at 384 px (`--panel-width`), full-height right rail |

The JSON carries rect + computed styles (border-radius, border, background,
box-shadow, padding, gap) for sidebar, roster, header, transcript, composer, side
panel, primary panel buttons, and dialogs, plus font-size/weight/line-height/
letter-spacing/color for the key text nodes.

Grok-side geometry is recorded **only** from authenticated captures (pending, see
registry); nothing in this phase is filled from memory.

## State/timing/keyboard records (P10-11…P10-13)

- **Interaction states** (hover/pressed/focus/disabled/loading/error/unread/working/
  waiting): the fork implements them through `ui-web` primitives with token-driven
  states; every changed surface passed the P09-12/13 a11y pass. Live-reference state
  colors/contrast still need the authenticated capture before scoring.
- **Timing classes**: optimistic send (immediate), scripted runs (fast, deterministic),
  delayed progress indicators (documented per surface in M1 phase handoffs), panel
  open/close transitions (CSS `duration-150`), voice transcript highlighting (covered by
  `voice-memo.spec.ts`). Live Grok timing needs the capture pass — flagged `✗→12/13`
  where a phase owns the fix.
- **Keyboard**: shortcut set (Cmd/Ctrl+N new chat, Cmd/Ctrl+B sidebar, Cmd/Ctrl+F search,
  command palette) verified by `shell-parity.spec.ts`; composer Enter-to-send and roster
  reorder via Alt+Arrow verified by e2e. Focus traversal uses real buttons/links
  throughout (a11y audit P09-12).

## Baseline deltas (P10-18) and intentional deltas (P10-19)

See `INTENTIONAL-DELTAS.md` for the full list; the `✗→NN` markers above name the phase
that owns each gap. Nothing in this phase fixes a delta — phase 10 only records them.
