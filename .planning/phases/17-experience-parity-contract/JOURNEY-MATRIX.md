# M3 Journey Matrix — Experience Parity Baseline (Phase 17)

## Reference capture record (P17-01)

Captured 2026-10-06 from current official sources:

| Source | What it pins |
|---|---|
| `https://docs.x.ai/grok-bot/overview` | Bot mental model, conversational setup, background work, approval-first attention |
| `https://docs.x.ai/grok-bot/bots` | Bot create/edit/hide/pin/duplicate/share journeys, roster model |
| `https://docs.x.ai/grok-bot/skills-routines-and-automations` | Conversational routine creation, Test run, management home, limits |
| `https://docs.x.ai/grok-bot/team-bots` | Team Bot ownership, publish lifecycle, shared-vs-private split, secrets |
| `https://docs.x.ai/grok-bot/mobile` | Mobile capability split, mobile routine management, approvals on mobile |
| `https://x.ai/changelog/bot` | Pinned interaction states v0.17.0–v0.66.0 (latest v0.66.0, Oct 2 2026) |

Changelog entries quoted below are verbatim from the capture. Fork-today evidence is `file:line` ground truth recorded during this phase's audit (2026-10-06 tree).

## Severity model (from EXPERIENCE-SPEC.md)

- **P0** security/privacy/authorization break or destructive parity error — M3 exits with zero.
- **P1** a Grok user follows the learned flow and cannot complete it, lands in the wrong lifecycle, or gets materially different action semantics — M3 exits with zero.
- **P2** terminology/hierarchy/state friction; the journey still works.
- **P3** cosmetic, no workflow impact.

## Journey 1 — Create / open / edit / hide / share a Bot

| Column | Grok reference (docs "bots", "overview") | Fork today | Gap → severity → phase |
|---|---|---|---|
| Entry | `New` in sidebar / `Cmd+N` → "Create new Bot", or type a name and create | New chat picker creates Bot/Team Bot/group/space (`bot-picker.tsx`) | Entry point equivalent. P3 → 23 |
| Steps | Grok opens "New Bot"; customize via Edit Profile; "Setup is a message, not a workflow builder" | Create form; instructions via Bot Settings panel (`bot-panel.tsx`) | Conversational setup exists (chat instructions). P3 → 23 |
| Result | Named durable teammate with memory, files, sessions | Same (`createBot` in `repos.ts`) | Parity. — |
| Ownership | Bot belongs to user; roster sections (pinned/hidden) | Same; Hidden Bots section exists | Parity. — |
| Error/Cancel | Hiding "does not pause the Bot or its routines"; delete removes profile+conversation+routines | Hide/unhide implemented; delete semantics in settings | Verify delete also removes routines in fork. P2 → 18/23 |
| Mobile | Same Bot reachable from mobile; group chats supported | Mobile roster + group chats present | Parity check. P3 → 23 |

## Journey 2 — Create / manage / test / pause / delete a Routine

| Column | Grok reference (docs "skills-routines", mobile page) | Fork today | Gap → severity → phase |
|---|---|---|---|
| Entry (create) | Conversational: ask the owning Bot ("Every weekday at 8:00 AM, run…"). No separate editor is described as the primary path | Chat tool `schedule_create` exists AND a full editor UI exists (`RoutineEditor.tsx`) | Editor is fine as management surface, but chat path must feel primary. P2 → 18 |
| Steps (confirm) | After setup confirm: owning Bot, schedule **and time zone**, input source, expected result, approval boundary; "**The Bot creates the routine and shows its next run**" | Fork posts `Routine "<name>" created` notice (`router.ts:5885-5918`); **no next run, no timezone in confirmation** | Missing next-run/timezone confirmation. **P1 → 18** (ROUT-004) |
| Result | Routine owned by the Bot; "shows its next run" | Routine row created; `nextRunAt` computed but **never rendered anywhere** (`mapRoutine` `router.ts:6616-6641`) | **P1 → 18** |
| Management home | Bot → View conversation details → Routines: enable/pause, Test run, edit schedule/instructions, inspect run history, delete | Details → Routines panel with list + editor (`Shell.tsx:4720-5062`); all five controls exist on web | Web parity. — |
| Schedule choices | Natural-language schedules; timezone part of schedule | Presets Every hour/day/Weekdays/week/month + Interval + Advanced cron (`RoutineEditor.tsx:46-54`); **no Once/Yearly presets**; one-shots chat-only; **timezone read-only, no picker** | Missing Yearly + editable timezone + Once in editor. **P1 → 18** (ROUT-003) |
| Test run | "A test run performs real work" — real run with approval boundaries | `routines.testRun` creates a real Task+Run with `routineId` (`router.ts:3500-3571`), idempotent nonce | Parity. — |
| History | "the 20 most recent runs" per routine; audit trail | `RoutineRunHistory` paginated 20/cursor (`routine-runs.ts:6-83`) — **but event-trigger runs (trigger=webhook, no routineId) are invisible in history** | History completeness. **P2 → 18** |
| Error/Cancel | "Deleting a routine is immediate and has no undo"; long-absence pause ask | Delete confirms then removes + cancels job; no long-absence pause ask | Long-absence behavior. P3 → 18 |
| Mobile | "inspect the schedule, **next run**, instruction, and Run history… use Active to pause/resume, and delete… Editing the schedule or instruction and testing currently require the desktop app" | Mobile has read-only list + detail (name, active/paused, triggers, timezone, prompt, open conversation). **No Active/pause toggle, no delete, no run history, no next run** | Mobile management missing. **P1 → 18** (ROUT-007) |

## Journey 3 — Team Bot create / copy / start-fresh / setup / publish / open / unpublish

| Column | Grok reference (docs "team-bots", changelog v0.61–v0.64) | Fork today | Gap → severity → phase |
|---|---|---|---|
| Entry | Desktop: New chat → Create new Team Bot; from a personal Bot's Share menu: "**Publish to Team**" | New chat picker → Team Bot form (name/title/description only) | Create entry exists; no publish-from-existing-Bot. **P1 → 19** (TEAM-003) |
| Copy vs Start fresh | Bot checks chat/memories; "How should your Team Bot start?" → **Copy** (keep chat and memories) or **Start fresh**; setup cards pick what the copy gets; "Memories you don't pick stay private; choose Keep private to share none" | Share = template JSON download only; **no import, no Copy/Start-fresh semantics** (`router.ts:5676-5710`) | **P1 → 19** |
| Setup | "walks you through plugins, secrets, skills, and files one card at a time"; owner edits profile/skills/plugins/secrets later | Setup form fields only; **no `teamBots.update` — template immutable after create** (`router.ts:1413-1457`) | Editable shared setup. **P1 → 19** (TEAM-004) |
| Publish lifecycle | "Until you publish it, only you can see the Team Bot"; v0.63.0: "Publish at the top of its details pane"; "Unpublish takes it away from teammates"; unpublish is temporary — "Their chats and routines come back when you do" | **No draft/published state at all** — `create` auto-adds every space member; no publish/unpublish RPC/UI (`schema.prisma:421-452`, `router.ts:1413-1523`) | Wrong lifecycle for a Grok user. **P1 → 19** (TEAM-001/002) |
| Open (member) | Teammates find it under New chat → Team Bots; each gets private conversation | `teamBots.open` creates actor-scoped instance with own thread/memory/computer (`router.ts:1458-1523`) | Parity. — |
| Shared vs private | Shared: plugins, secrets, skills, files, team memory. Private per member: conversation, notes, own connectors; "No routine runs for the whole team at once" (routines personal) | Instance-private thread/memory/computer/routines/secrets match the private side; **no shared team memory/secret namespace** | Shared setup namespace missing. **P1 → 19** (TEAM-004/006) |
| Authorization | "Only the owner can change this setup"; v0.64.0 adds **Managers** who can change profile/skills/plugins/secrets; delete by owner or admin | Any space member can create; role `editor` defined but never assigned/enforced; no manager role (`domain.ts:79`) | Owner/manager gate. **P1 → 19** (TEAM-005) |
| Credentials | Account sign-ins act as the person asking; shared keys/tokens are the Bot's own credential; secrets encrypted, `[REDACTED]` in output, "The Bot can't see a value either" | Per-instance `BotSecret` store with ciphertext, redaction registration, HTTPS-origin guards; space-level owner-gated AgentSecrets; **no team-bot-level shared store** | Team secret store with redaction. **P1 → 19** (TEAM-006, APPR-002) |
| Error/Cancel | Delete: owner/admin, confirmed by typing the exact name, permanent, removes Slack app | No delete at all for Team Bot (template immutable) | Delete journey. **P2 → 19** |
| Mobile | Teammates use published bots from desktop, mobile, or Slack | Mobile has basic list/create/open (`new-team-bot.tsx`); no settings/publish | Mobile team-bot management. P2 → 19/23 |

## Journey 4 — Composer: lists / selection / add-to-prompt / attachments / voice / send-stop

| Column | Grok reference (changelog v0.62.0, v0.57.0) | Fork today | Gap → severity → phase |
|---|---|---|---|
| Lists | "Type - or 1. to start a bulleted or numbered list in the composer; **Shift+Enter adds an item, Tab nests it, and Enter still sends**" | No list handling at all; Enter sends, Shift+Enter newline, IME-guarded (`Shell.tsx:6815-6854`, `composer-mention-picker.ts`) | **P1 → 20** (COMP-001) |
| IME/mention safety | (implied baseline) | IME guard + mention picker + slash picker + chips all exist | Parity; must not regress. — |
| Selection → Add to prompt | "Select text in a chat and press Cmd/Ctrl+L, or choose Add to prompt, to quote it in your next message" | Selection offers **Quote** only (`quote-selection.ts`); hover Reply exists; **no Add to prompt** | **P1 → 20** (COMP-003) |
| Attachments/voice entry | Type, dictate, voice memos, photos, files | Attachments + voice memo button + dictation-equivalent on mobile | Parity. — |
| Send/stop | "Messages you send show as sent right away" with progress bar **only if sending takes over two seconds** (v0.57.0); Stop while working | Draft clears immediately but the bubble waits for server ack; **no delayed progress indicator**; Stop button exists while running | Optimistic sent + delayed progress. **P1 → 20** (COMP-004) |
| In-flight steering | User keeps messaging while Bot works | Steerable runs accept `steeringMessage` mid-run (`thread-target.ts:747-754`); composer stays enabled | Parity; verify ordering in 22. — |

## Journey 5 — Failed-message retry / delete

| Column | Grok reference (changelog v0.62.0) | Fork today | Gap → severity → phase |
|---|---|---|---|
| Entry | "A message that didn't go through shows **Failed to send with Resend and Delete**, instead of being stuck on Not delivered yet" | `sendError` banner only; **no failed message state**; web clears (loses) the draft on failure (`Shell.tsx:2265-2272`, `6439`) | **P1 → 20** (COMP-005) |
| Ordering/idempotency | Resend must not duplicate | `clientNonce` replay + server guard already exist (`replayExistingSend`) | Reuse for Resend. — |
| Mobile | Same card semantics | Error text banner; draft preserved on failure | **P1 → 20** |

## Journey 6 — Approvals and credential handoff

| Column | Grok reference (changelog v0.56.0, v0.44.0, v0.64.0; team-bots doc) | Fork today | Gap → severity → phase |
|---|---|---|---|
| Approval card | Review cards "**say in one sentence what the Bot wants to do and keep the command and reasoning behind View the full request**" (v0.56.0) | `AskCard` shows summary + **detail always expanded** in a `<pre>` (`AskCard.tsx:98-110`) | Summary-first disclosure. **P1 → 21** (APPR-001) |
| Security boundary | Approval framework authoritative; expired Auto-review offers Always allow | Allow once / Always allow this tool / Deny; Auto Review toggle; confirmation policy presets | Parity; must not regress (APPR-002). — |
| Credential handoff | "it asks with a form in the chat and fills the page for you, instead of handing you its computer" (v0.44.0); v0.64.0 Secure Form window shows the site's name and icon | Secret-ask card with HTTPS origin shown, password/username input, saved state (`AskCard.tsx:95-181`) | Structural parity; icon/site-title treatment P3 → 21 (APP-003) |
| Resume | Task continues after sign-in when context remains valid | `threads.answer` → `answerRunInput` → run-continue job (`router.ts:2499-2520`) | Parity (APP-002). Verify context-expiry. — |

## Journey 7 — Connect apps / plugin discovery and sign-in

| Column | Grok reference (changelog v0.60.0, v0.63.0) | Fork today | Gap → severity → phase |
|---|---|---|---|
| Entry | "The sidebar's Marketplace button is now **Connect apps**, with **logos of featured plugins beside it**" (v0.60.0) | Sidebar "Connect apps" button is a static icon — **no featured logos** (`Shell.tsx:3709-3711`) | Featured-logo treatment. **P2 → 21** (APP-001) |
| Search | "the search box reads **Search plugins**"; "Featured Bots and Bot search results no longer appear" | Placeholder "**Search apps**" (`PluginsOverlay.tsx:695-696`); catalog is connectors-only | Terminology. **P2 → 21** |
| Catalog | Plugin-centric discovery; featured tiles | Featured tiles with logos + catalog + MCP browse | Parity. — |
| Sign-in continuation | Completing sign-in resumes the interrupted task | Resume path exists (see Journey 6) | Verify in 21. — |

## Journey 8 — Voice memo playback / transcript

| Column | Grok reference (changelog v0.57.0; mobile page) | Fork today | Gap → severity → phase |
|---|---|---|---|
| Playback | Mobile: "Play a voice memo a Bot sent" | Web `<audio controls>`; mobile play button | Parity. — |
| Transcript | "its transcript highlights each word **in sync with the audio**, and **clicking a word jumps playback there**" (v0.57.0) | Transcription returns `{ text }` only — **no timing data, no transcript display, no seek** (`voice.ts:431-448`, `VoiceMemoCard.tsx`) | **P1 → 21** (VOICE-001/002; timing requires provider segment data) |
| Mobile recording | Docs list "Full voice memos" among mobile features | **Mobile cannot record voice memos** (calls only) | **P2 → 21** (native recorder; phase-23 verification) |

## Journey 9 — Project creation / planning / delegation / status / stop

| Column | Grok reference (changelog v0.57.0) | Fork today | Gap → severity → phase |
|---|---|---|---|
| Creation | "A Bot can start a Project when you ask for one: **a Cloud Agent that plans the work and runs its own agents**" | `project_create` bot tool creates tracker + transcript card (`executor.ts:5742-5789`) | Creation entry exists. — |
| Planning/delegation | Plans work, runs its own agents, exposes progress/blockers | `project_task_add` spawns **no run**; tasks stay "planned" forever; **no delegation, no progress/blocker events** (`executor.ts:5790-5821`) | **P1 → 22** (PROJ-001/002) |
| Status truth | One coherent status across project/task/run/transcript | Run-linked tasks and project tasks are separate stores; contradictory states possible | **P1 → 22** (PROJ-003) |
| Stop | "Telling a Bot to stop **also stops the other Bots it handed work to and the Cloud Agents it started**" (v0.57.0) | `threads.stop` cancels runs + run-tasks only; project tasks untouched; **no cancel UI** (`cancel-runs.ts`) | **P1 → 22** (PROJ-004) |
| Detail | Progress/blockers/result visible | Read-only detail panel with status/plan/tasks | Enrich in 22. — |

## Journey 10 — Main Bot attention / proactivity

| Column | Grok reference (changelog v0.66.0; overview) | Fork today | Gap → severity → phase |
|---|---|---|---|
| Entry | Main Bot feature shipped v0.66.0 (Oct 2 2026); "comes back when something needs your approval"; blocked steps "handed to you rather than worked around" | Main Bot per Space + opt-in 4-hour check-in Routine (`Shell.tsx:4299-4365`) | Parity on the periodic path. — |
| Event awareness | Surfaces completion/blocker/failure/waiting events, not just a timer | **No event-driven attention** — cron only | **P1 → 22** (MAIN-001, SHOULD-grade but lifecycle-material) |
| Dedup | Repeated events must not nag | **No dedup for attention events** | **P1 → 22** (MAIN-002) |
| Mobile | Notifications: "when a Bot has a result, question, or approval request"; in-app attention states | Mobile has Main Bot toggle only, no check-in toggle | P2 → 22 |

## Journey 11 — Desktop / mobile capability split

| Capability | Desktop (reference) | Mobile (reference) | Fork mobile today | Gap → phase |
|---|---|---|---|---|
| Routine management | Full (create/edit/test/pause/history/delete) | Inspect schedule/next-run/instruction/history, Active/pause, delete; editing+testing desktop-only | Read-only list+detail | **P1 → 18** |
| Voice memos | Record + play + transcript | Record + play; "Full voice memos" | Play only | P2 → 21 |
| Approvals | Review cards, Secure Form | Cards with send/discard, takeover | Ask cards present | Parity; verify 23 |
| Team Bots | Full lifecycle | Use published bots | List/create/open only | P2 → 19 |
| Drafts persist per conversation | — | "Drafts are saved per conversation when you navigate away" | Verify | P2 → 23 |
| Share sheet / dictation / voice chat | — | Supported | Partial (calls) | P3 → 23 |

## Pinning decisions (P17-04…P17-11)

Former `pending-reference` items from the M2 parity matrix, re-audited against the 2026-10-06 capture. Per decision D-014, documented behavior may not stay `pending-reference`.

| Former pending item | Now pinned by | Re-classification |
|---|---|---|
| Composer list behavior (matrix rows 12/14 area, phase-12 residuals) | Changelog v0.62.0: "- or 1. … Shift+Enter adds an item, Tab nests it, and Enter still sends" | **Pinned** → phase 20 implements exactly this semantics |
| Add to prompt vs Reply/Quote | Changelog v0.62.0: Cmd/Ctrl+L or "Add to prompt" quotes selection into next message | **Pinned** → phase 20 |
| Failed-send retry wording | Changelog v0.62.0: "Failed to send with Resend and Delete" | **Pinned** → phase 20 uses `Resend` / `Delete` labels |
| Send feedback timing | Changelog v0.57.0: sent immediately; progress bar only after ~2 seconds | **Pinned** → phase 20 |
| Voice transcript highlight/seek | Changelog v0.57.0: word-level sync highlight + click-to-seek | **Pinned** → phase 21 (needs segment-timing transcription) |
| Team Bot setup/publish lifecycle | Changelog v0.61.0/v0.63.0/v0.64.0 + team-bots doc (draft→publish→unpublish; Copy/Start fresh; Managers) | **Pinned** → phase 19 implements the lifecycle |
| Project-as-Cloud-Agent semantics | Changelog v0.57.0: "a Cloud Agent that plans the work and runs its own agents"; stop cascade same entry | **Pinned** → phase 22 |
| Connect apps Search plugins / featured treatment | Changelog v0.60.0 ("Connect apps, with logos of featured plugins beside it") + v0.63.0 ("Search plugins") | **Pinned** → phase 21 (terminology + featured-logo treatment structural) |
| Approval summary-first wording | Changelog v0.56.0: one-sentence summary; command/reasoning behind "View the full request" | **Pinned** → phase 21 |
| Credential handoff form | Changelog v0.44.0/v0.64.0 (chat form → Secure Form window with site name/icon); team-bots doc (OAuth per actor, shared keys, `[REDACTED]`) | **Pinned** → phase 21 refines card; phase 19 team secrets |
| Routine creation/management/mobile behavior | skills-routines doc (conversational creation, confirm schedule+timezone, next run, Test run, management home, 50-routine/20-run limits) + mobile doc (inspect/pause/delete on mobile; edit/test desktop-only) | **Pinned** → phase 18 |
| Main Bot behavior | Changelog v0.66.0 entry + overview attention model | **Pinned structurally** → phase 22 (event-aware + dedup; exact cadence remains fork-default) |

Remaining genuinely-unpinned items (stay `?`, no authenticated captures exist): exact empty-state copy, avatar-shape treatment, precise featured-logo placement, live reply wording. None of these is required to execute phases 18–22 because no MUST/SHOULD requirement depends on them (D-014 verified 2026-10-06).

## Requirement → phase mapping (VERIFY-01)

| Requirement(s) | Owning phase | Checklist anchor |
|---|---|---|
| EXP-001, EXP-002 | 17 (contract) + 23 (final verification) | P17-02/03/12/13, P23-21 |
| ROUT-001…007 | 18 (+ ROUT-006 in 19) | Phase 18 CHECKLIST |
| TEAM-001…006 | 19 | Phase 19 CHECKLIST |
| COMP-001…005 | 20 | Phase 20 CHECKLIST |
| COMP-006 | 20 + 22 | Phase 20/22 CHECKLISTs |
| VOICE-001/002 | 21 | Phase 21 CHECKLIST |
| APPR-001 | 21 | Phase 21 CHECKLIST |
| APPR-002 | 19, 21, 22, 23 | Security invariants per phase |
| APP-001…003 | 21 | Phase 21 CHECKLIST |
| PROJ-001…004 | 22 | Phase 22 CHECKLIST |
| MAIN-001/002 | 22 | Phase 22 CHECKLIST |
| REL-001…004 | 23 | Phase 23 CHECKLIST |

Every M3 requirement maps to exactly one owning phase plus the phase-23 gate. No requirement is unmapped (VERIFY-01 satisfied by this table).

## M2 pending-reference re-audit conclusion (P17-04)

Of the M2 matrix's `?` rows, all rows whose gaps were behavioral (lifecycle, wording, state timing) are now pinned by the changelog/docs capture above. Only presentation-level unknowns remain unpinned, and M3's journey model (EXP-002, D-013) does not gate on them. The M2 pixel-diff harness remains as regression tooling only (P17-13): the M3 release gate (phase 23, P23-21) explicitly verifies that no M3 DONE gate depends on pixel ratios.
