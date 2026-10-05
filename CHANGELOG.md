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

### Removed

- Nonfunctional Grant folder picker in the desktop app.

### Messaging upgrade notes

### Migration notes

- Three additive Prisma migrations ship with this milestone (`space_main_bot`, `team_bots`, `projects`). `prisma migrate deploy` applies them automatically on upgrade; existing rows and bots are untouched, and no manual SQL or new environment variables are required.

- Webhooks use `/api/v1/messaging/webhook/<provider>`; the previous Sendblue path remains supported.
- Configure credentials for each messaging provider in `.env`; see [.env.example](.env.example).
- Unknown senders are ignored by default. `MESSAGING_OPEN_SIGNUP=true` restores automatic account
  creation from incoming messages and requires a deployment model key.

## [0.1.0-beta] - 2026-08-13

Initial public beta: web, Electron, and Expo clients; Pi runtime; Docker and E2B computers; plugins; one thread, computer, memory, routines, and history per bot.
