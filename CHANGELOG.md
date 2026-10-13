# Changelog

Notable product changes in Rakazo. See GitHub Releases for tagged builds.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Fixed

- Fish Audio speech can use a model other than s2.1-pro. Each Fish connection can set Speech model in Voice settings; `FISH_TTS_MODEL` is the default only when that field is empty (unset still uses s2.1-pro). A failed speak, transcribe, or voice-list request logs the upstream Fish status and message, including when the error body cannot be read, and the message returned to the client does not include the API key.
- A picture attached to an earlier message is now visible to the bot when a later turn asks about it, for a model that can see images. Only the current turn carried its images; older turns arrived as a text marker, so the bot asked for the picture again. The most recent user turns now keep their images, within a fixed turn, byte, and per-model image budget. A turn whose pictures exceed the byte budget keeps the newest ones that fit. If an earlier picture cannot be read, its history marker says it is unavailable.
- A bot on a reasoning model could answer with "No response. Try again." on a harder question: thinking is billed against the same output ceiling as the reply, and the 4k default left nothing for the reply itself. Reasoning models now get a 32k output ceiling instead, still bounded by whatever the model itself allows.
- A newly created bot's thread opened empty and stayed silent until given real work, so a misread `title`/`description`/`instructions` went unnoticed until it cost a run. Creating a bot now queues one turn where it states how it understood its role and asks for anything it needs.
- A message sent while that introduction was still running was answered by the intro, which cannot use tools. The message now waits until the introduction finishes and is answered in the following turn, and the introduction does not send a finish notification. A reply to a message from a linked chat app still goes back to that app. Messages held from different chats, such as a group channel and a direct chat, are answered in separate turns.
- A message sent while one of the bot's routines (or an inbound webhook) was running in the same thread was folded into that turn as steering, so the bot answered without the conversation ("I have no earlier context"). The message now waits until that turn finishes and is answered in its own turn with the full thread. A composer reply while that run is already waiting for input still answers the ask, unless a live conversational run is active to take the message.
- Every turn failed on Claude models through Amazon Bedrock with "input_schema does not support oneOf, allOf, or anyOf at the top level": `request_secret` declares its two destinations as a root `oneOf`, and Anthropic rejects the whole request for it. Root unions in tool schemas, including ones from MCP servers, are now merged into a single object schema before they reach a provider; the executor still enforces credential or `connectionId`, not both.
- Pipedream exposed every tool of every connected app at once, so a handful of apps could fill a run's tool list. Above 20 tools the connector now offers the same lazy catalog the MCP connector uses (`pipedream_search_tools`, `pipedream_load_tool`, and `pipedream_execute_tool`), with names grouped by app.
- The Needs you computer card in a thread now includes Open, which opens that bot's computer the same way the computer panel does, including from a group member bot.
- Bots with more than 20 MCP tools failed on every Claude model behind a Claude Pro/Max/Team sign-in with "You're out of extra usage": Anthropic rejects Claude Code OAuth requests that carry a tool named `mcp_*`. The lazy catalog wrappers are now `connectors_search_tools`, `connectors_load_tool` and `connectors_execute_tool`.
- Changing a bot's model, thinking level or voice failed with a validation error once its instructions outgrew the description limit, and saving any other setting overwrote those instructions with the shorter description text. Bot settings now put the description and instructions on the wire only when that field was edited, clamped to each field's own limit.

- Stopping a Project now also cancels the cloud agents its tasks launched; before, only runs were stopped and the cloud agents kept going.
- A Project's transcript card stopped updating once more than 200 newer bot messages followed it; it is now found directly in the database however far back it is.
- A submitted or discarded draft card can no longer be edited, and the mobile Send now uses the same server-side submit as the web.
- On mobile, draft, project and voice-memo cards only appeared next to an approval request; they now render on their own.

### Changed

- Message bubbles in the web/PWA transcript use more of a wide window's width (70%/74% caps raised to 84%/88%, still leaving room for the hover-actions gutter), instead of leaving a quarter to a third of a long message's row empty.
- Every run's system instructions now state the current date and time (UTC), so bots judge deadlines, recency and scheduling from the real present instead of guessing it from training data or quoted timestamps.
- Connect Slack, WhatsApp Business Cloud, or Telegram DMs to a bot from Messaging settings, alongside iMessage/SMS. Each app can use a different bot. Group conversations remain iMessage-only.
- Model picker includes Grok 4.6 (xAI) and Ox Alpha Free / GLM-5.3 (OpenCode Go).

### Added

- Grok-parity shell (M1): the sidebar becomes a coworker roster with presence, unread and activity previews, a collapsible Hidden Bots section, top Search and New chat actions, a simplified centered conversation header, and a Connect apps footer; wide screens center the transcript and composer in one column.
- Conversation Details hub behind the header identity pill: identity and computer status, Tasks, Routines, Library, Bot settings, Share template, and the Main bot toggle in one panel. Tasks and Projects deep-link via `?panel=` / `?project=` and survive reloads.
- Projects: durable multi-step work with objective, plan, and per-task status, driven by the bot through `project_create` / `project_task_add` / `project_update` tools and rendered as transcript cards on web and mobile.
- Team Bots: one shared definition, per-user private bot instances with their own thread and computer. Member roles are owner/editor/member, sharing exports a sanitized template JSON, and the create picker lists Team Bots on web and mobile.
- Main Bot: each space can name one bot as the Main Bot; it gains a roster star and can run opt-in proactive check-ins on a 4-hour-minimum routine cadence with quiet hours handled by the schedule itself.
- Draft actions: bots can prepare an editable form (email, Slack message, more over time) in the transcript; you edit the fields and send or discard, and consequential sends still pass the normal approval gates.
- Voice memos: record audio in the web composer, optionally auto-transcribed, playable from the thread as a voice card on web and mobile.
- Connect apps gains an X (Twitter) toolkit through the connector catalog; actions follow the same approval policy as other connector tools.
- Mobile parity for the new model: Tasks/Projects screens, a Routines list, a per-bot Library, Team Bot discovery in the create sheet, a Main bot switch in chat settings, and draft-action and voice-memo cards in the thread.
- Voice mode: spoken replies, hold-to-talk dictation, and half-duplex calls with ElevenLabs, OpenAI, Cartesia, or Fish Audio.
- Desktop owners using Docker can opt into running bot shell commands directly on their computer. This grants access under the owner's OS account; see [computer providers](docs/self-host.md#choosing-a-computer-provider).
- GitHub Copilot and SuperGrok / X Premium sign-in for model access.
- Spawn peer bots (each with its own thread and computer) and short-lived in-thread subagents.
- ChatGPT Plus or Pro sign-in for model access.
- Mobile: point the app at a self-hosted API origin, a native iOS inbox, and take control of the live desktop.
- Provider-neutral integrations: managed apps through Composio or Pipedream Connect, plus encrypted user-installed Treg, HTTPS MCP, and OpenAPI tool sources on web and mobile.
- Disconnect connected Composio plugins.
- Routines in plain language instead of raw cron.

- Voice memo transcripts: a memo keeps its transcript (and segment timing when the speech provider returns it, currently Fish Audio and ElevenLabs). The web voice card shows the transcript under playback, highlights the segment being played, and jumps playback to a clicked segment; without timing it shows plain text.
- Approval requests lead with a one-line summary; the command and reasoning open behind View the full request on web and mobile.
- The plugin search box reads Search plugins, and the sidebar shows the logos of featured plugins next to Connect apps when the catalog has them.
- Bots can ask you to sign in to an app they need (`request_app_connection`). The run pauses with an authorization card and continues on its own once the app is connected.
- Projects orchestrate work: `project_task_add` now starts the task as its own run (on the bot or a named assignee), `project_status` reads progress, and a Project's status is derived from its tasks' runs. The project card shows progress, Stop and Retry controls exist on web and mobile, and telling a bot to stop also stops the Projects it started without touching unrelated work.
- A waiting, failed, or completed Project is surfaced once in the Main Bot's chat when it is not already the place you are looking.

- Command palette (Cmd/Ctrl-K) also finds Connect apps by name; Enter opens that app's page.
- Right-click a routine in Conversation Details for Pause, Resume, Test run, Edit and Delete. A plain click still opens the editor.
- Your messages in a 1:1 chat take the Bot's color (text color chosen for AA contrast); Settings → Accent to Black turns it off. Web only for now.
- The composer's `/` picker works from the keyboard: arrows move, Enter or Tab picks, Escape closes, so Enter no longer sends the literal `/…` text while it is open.
- Email drafts: To, Cc, Bcc, Subject and Body are validated (recipient syntax, no line breaks in the subject), the body renders a safe formatted preview (headings, bold, lists), and Send is disabled until the draft is valid. Sending goes through the server, which freezes the approved fields and starts one run; sending twice does nothing, and a run started from a draft can only send that exact email.
- Slide decks: a Bot can build a deck with `presentation_save`; it appears as a card with slide previews and downloads as an editable PowerPoint file. Saving the same title again is a new version of the same artifact. Google Slides is not offered.
- Mobile: voice memo transcripts follow playback (highlighting the current segment when the speech provider returned timing); the project card in the thread shows progress and opens the project.
- Slack: a Team Bot's message can notify a user group (`<!subteam^GROUPID>`) only if Slack lists that group (the bot token needs `usergroups:read`); `@here`, `@channel` and `@everyone` never notify anyone from a Bot.

### Removed

- Nonfunctional Grant folder picker in the desktop app.

### Messaging upgrade notes

### Migration notes

- M4 adds no database migrations. It adds one dependency, `pptxgenjs` (MIT, exact version pinned) in `packages/adapters`, used only to export slide decks; run `pnpm install` after pulling. To roll back M4, revert the branch: nothing it wrote needs cleaning up, and existing draft cards and artifacts keep working. Deck artifacts (`*.deck.json`, mime `application/vnd.rakazo.deck+json`) created in the meantime would show as a generic file on an older build.
- Two additive migrations: `voice_memo_transcript` (nullable `artifacts.transcript`) and `project_orchestrator_run` (nullable `projects.orchestratorRunId`). `prisma migrate deploy` applies them on upgrade; existing rows are untouched.
- Three additive Prisma migrations ship with this milestone (`space_main_bot`, `team_bots`, `projects`). `prisma migrate deploy` applies them automatically on upgrade; existing rows and bots are untouched, and no manual SQL or new environment variables are required.

- Webhooks use `/api/v1/messaging/webhook/<provider>`; the previous Sendblue path remains supported.
- Configure credentials for each messaging provider in `.env`; see [.env.example](.env.example).
- Unknown senders are ignored by default. `MESSAGING_OPEN_SIGNUP=true` restores automatic account
  creation from incoming messages and requires a deployment model key.

## [0.1.0-beta] - 2026-08-13

Initial public beta: web, Electron, and Expo clients; Pi runtime; Docker and E2B computers; plugins; one thread, computer, memory, routines, and history per bot.
