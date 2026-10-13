# Grok Bot public source matrix: changes after v0.66.0 (M3 pin) through 2026-10-12

Prepared 2026-10-12. Read-only research; nothing in the repo was modified.

## Latest version found

**v0.68.1, Oct 7, 2026** (changelog page header: "Latest v0.68.1·Oct 7, 2026"). This is from a Wayback Machine capture dated 2026-10-10 16:04 UTC. No capture dated 2026-10-12 exists, and no later release turned up in web search. If a release shipped Oct 10-12 it is not visible to this research. M3 pinned v0.66.0 (Oct 2, 2026) per `.planning/REFERENCES.md`.

## Source reachability

| URL | Result |
|---|---|
| https://x.ai/changelog/bot | **Live fetch blocked: HTTP 403 (WebFetch and curl).** Content read from the Wayback capture `http://web.archive.org/web/20261010160417id_/https://x.ai/changelog/bot` (raw HTML, 2026-10-10). Corroborated by WebSearch snippets (x.ai changelog title/snippet, tao.media, aicoder.com). |
| https://docs.x.ai/grok-bot/overview | OK |
| https://docs.x.ai/grok-bot/bots | OK |
| https://docs.x.ai/grok-bot/skills-routines-and-automations | OK |
| https://docs.x.ai/grok-bot/team-bots | OK |
| https://docs.x.ai/grok-bot/mobile | OK |

Doc pages carry no visible dates or version stamps in the fetch output. Doc text is therefore "as fetched 2026-10-12", not tied to a release.
Also seen in search results, not fetched: https://www.tao.media/spacexai-releases-grok-bot-0-68-1-with-slide-decks-and-formatted-emails/ and https://aicoder.com/news/news-20261007-grok-bot-0-68-1-slides-formatted-email-1920 (third-party, consistent with the changelog).

Platform note: the changelog does not label entries web, desktop or mobile. The only tag is "Teams". The platform column below is inferred from the entry wording and the docs, and says so where it is inferred.

## Changelog entries newer than v0.66.0

Source URL for all rows: https://x.ai/changelog/bot (via Wayback capture 2026-10-10). Quotes are verbatim. "Evidence" is the strength rating.

### v0.68.1, Oct 7, 2026. "Slide decks and Bot-colored chats"

| Item | Quote | Platform | Evidence |
|---|---|---|---|
| Bot-colored user messages | "Your messages in a 1:1 Bot chat take that Bot's color; set Accent to Black in Settings → General to turn it off. Requires Grok Bot 0.64.0 or later." | Likely all UI surfaces. The Settings → General location is desktop-style. Mobile unclear. | changelog line only |
| Slide decks (New) | "Bots can build slide decks with you, showing sample slides to choose from, and deliver them as PowerPoint files or Google Slides." | Bot-side capability, so surface-agnostic. Delivery as files or Slides. | changelog line only. No dedicated docs page found in the 5 docs pages. |
| Formatted email (New) | "Bots can send formatted emails from a draft card, so recipients see headings, bold text, and lists." | Bot-side, with the draft card in chat | changelog line only |
| Gmail Spam (New) | "Bots can search your Gmail Spam folder and move a message back to your inbox." | Bot-side | changelog line only |
| Slack user-group mention (New, Teams) | "Team Bots can mention a Slack user group so its members get notified, while @here and @channel still don't ping anyone." | Slack, Team Bots | changelog line only |
| Composer slash (Improved) | "Typing / in the composer no longer opens a menu of skills and actions." | Composer, likely web and desktop. Mobile unclear. | changelog line only. **Conflict:** the skills docs page still says "You can reference skills with `/` and Bots, routines, and connectors with `@`." That wording may be stale or may mean referencing is typed without a menu. Mark `unverified`. |
| Faster Bot computer (Improved) | "Bots work faster on their computer: actions settle sooner, screenshots come back quicker, and new windows skip a five-second wait." | Bot cloud computer | changelog line only |
| Larger Bot computer (Improved) | "The Bot's computer has a 1920 × 1200 screen, up from 1280 × 800, giving more room when you watch it or take over." | Bot cloud computer | changelog line only |
| Team Bot Slack quietness (Improved, Teams) | "In Slack threads it follows, a Team Bot stays quiet on untagged replies that don't need it, such as emoji-only replies." | Slack | changelog line only |
| Gmail reliability (Fixed) | "Gmail actions fail less often: send and reply no longer report a missing tool, and Bots wait out Google's rate limits." | Bot-side | changelog line only |
| Email drafts as card (Fixed) | "Email drafts show up as a card in the chat, a Send cut off by Stop still goes out, and attachments keep their file names." | Chat | changelog line only |
| Browser recovery (Fixed) | "The Bot's browser recovers from a crashed tab, handles large uploads, and gives up on a stuck page after 25 seconds." | Bot computer | changelog line only |
| Stuck-step stop (Fixed) | "Stop or a new message ends a Bot that's stuck on an unresponsive step within about 30 seconds." | Bot-side | changelog line only |
| Secure Forms (Fixed) | "Secure Forms fill into the page the Bot has open, and checkout card fields get a Secure Form instead of a screen handoff." | Bot-side | changelog line only |
| Reconnect card (Fixed) | "When X or Vercel needs you to sign in again, the Bot shows a reconnect card instead of retrying or giving up." | Chat | changelog line only |
| Window crash reload (Fixed) | "If the app's window crashes, Grok Bot reloads it instead of leaving it blank." | Desktop (app window) | changelog line only |

### v0.68.0, Oct 5, 2026. "New languages and computer removal"

| Item | Quote | Platform | Evidence |
|---|---|---|---|
| New languages (New) | "Marathi, Tamil, Telugu, Swahili, and Hausa join the Language options in Settings." | All, Settings | changelog line only |
| Remove computer (New) | "Settings → Computer shows Remove for your other computers, and a removed computer tells you to restart Grok Bot to add it back." | Desktop | changelog line only |
| Gmail send-as (New) | "Email drafts can go out from a verified Gmail send-as address, with a From picker when you have more than one." | Draft card, Gmail | changelog line only |
| Command palette finds plugins (New) | "Searching the command palette also finds plugins, and Enter opens the plugin's page." | Desktop and web (keyboard palette). Mobile unclear. | changelog line only |
| Approval cards (Improved) | "Approval cards ask whether to allow the Bot by name and quote its instruction, and Settings calls saved rules Custom Rules." | All | changelog line only |
| Notification wording (Improved) | "Notifications and the per-Bot notification switch now say the Bot is waiting for you." | All, including mobile push | changelog line only |
| Routine right-click (Improved) | "Right-click a routine in the details pane for Pause, Resume, Test, Edit, and Delete; clicking a routine no longer opens its detail view." | Desktop (pointer, details pane) | changelog line only |
| PR link hover card (Improved) | "Hovering a pull request link shows a preview card with its status and title instead of a plain tooltip." | Desktop and web (hover) | changelog line only |
| Full-screen computer (Improved) | "Opening the computer full screen shows the live view right away instead of a second Connecting screen." | Desktop and web | changelog line only |
| Unassigned section (Improved) | "The Unassigned section in the sidebar can be dragged, or moved with Move up and Move down, like your own sections." | Desktop and web | changelog line only |
| Large file/image (Fixed) | "Copying or saving a large image, or opening a large JSON or Markdown file, no longer freezes the app." | All | changelog line only |
| Transcript stability (Fixed) | "Switching chats no longer flashes an empty transcript, and older messages you scrolled back to stay when the app reconnects." | All | changelog line only |
| Gmail draft card (Fixed) | "Gmail draft cards include your signature, logo included, and say Couldn't send this draft when Send doesn't go through." | Chat | changelog line only |
| Copy fidelity (Fixed) | "Copied replies keep their line breaks and link URLs when you paste them into email, Slack, or plain text." | All | changelog line only |
| Team Bot not primary (Fixed, Teams) | "Team Bots no longer appear in the primary Bot picker, and a refused change says Team Bots can't be a primary Bot." | All | changelog line only |

### v0.67.0, Oct 2, 2026. "Connect Apps and new working status"

All changelog line only.

| Item | Quote | Platform |
|---|---|---|
| Connect Apps rename (Improved) | "Marketplace is now Connect Apps, with category chips under the search, Recommended for you first, and Bot templates on the web." | Web. Elsewhere unclear. |
| Working status phrases (Improved) | "While a Bot works, its status uses new phrases like Thinking it through and Working on your computer, without the Bot's name in front." | All |
| Approval card rule info (Improved) | "Approval cards show when your Ask first rule paused an action or Always allow added a rule, with Edit rule to change it in Settings." | All |
| Google account email (Improved) | "Connected Google accounts show their email address instead of default on connector cards and in the account list." | All |
| Windows acceleration (Improved) | "On Windows, Use hardware acceleration is now on by default, as on Mac, and a choice you already made is kept." | Desktop |
| Team Bot link (Improved, Teams) | "Copy link on a Team Bot shares an x.ai link, and links you already shared keep working." | All |
| Connect finishes (Fixed) | "Connecting an app finishes even when another app is using its sign-in port, and a failed sign-in page explains why." | Desktop |
| Authorize on cards (Fixed) | "Connector cards that ask you to sign in again, or to add a second account, offer Authorize for that account instead of showing Added." | All |
| Reply-all failure (Fixed) | "When a Gmail reply-all fails, the draft card says Message not delivered instead of showing it as sent." | Chat |
| Stop in Settings (Fixed) | "Stop in Settings stops every running chat so Update unlocks, and a Settings page that fails after an update offers Restart." | Desktop |
| Routine schedule display (Fixed) | "Routine schedules no longer claim an interval that doesn't repeat, a failed pause or resume shows an error, and deleted routines' chips show (deleted)." | All |
| Dock badge (Fixed) | "The dock badge no longer counts unread messages from Bots that were deleted." | Desktop |
| Logitech buttons (Fixed) | "On Mac, the Back and Forward buttons on Logitech mice now work." | Desktop (Mac) |
| Sidebar avatars (Fixed) | "Sidebar avatars no longer freeze with one eye bigger than the other." | Desktop and web |
| Computer routing (Fixed, Teams) | "When a team admin turns off Route traffic through this computer, Settings → Computer says so, and a failed load of your team's settings offers Retry." | Desktop |

## Required-topic verdicts

| Topic | Verdict | Evidence and source |
|---|---|---|
| Slide decks + PowerPoint / Google Slides export | **Present, v0.68.1.** Semantics beyond the one line are `unverified`. | Changelog v0.68.1: "Bots can build slide decks with you, showing sample slides to choose from, and deliver them as PowerPoint files or Google Slides." No docs page among the 5 covers it. A separate X post (search result only, not fetched, undated) says Grok Bot "now natively connects to Google Slides, Sheets, and Docs". |
| Formatted email drafting/delivery | **Present, v0.68.1.** Formatting: headings, bold, lists. Gmail draft card with signature and logo (v0.68.0), failure text "Couldn't send this draft" (v0.68.0), "Message not delivered" (v0.67.0). | Changelog line only. Mobile docs say a card appears in the conversation with options to send or discard. This does not confirm editing or preview, nor formatting detail. |
| Editable email draft preview | **`unverified`.** | The mobile docs say a card appears "with options to send or discard it". No source says "editable" or "edit" for draft content. |
| Gmail send-as aliases | **Present, v0.68.0.** | Changelog: "Email drafts can go out from a verified Gmail send-as address, with a From picker when you have more than one." Changelog line only. |
| Gmail Spam handling | **Present, v0.68.1.** | Changelog: "Bots can search your Gmail Spam folder and move a message back to your inbox." Changelog line only. |
| Plugin search from command palette | **Present, v0.68.0.** | Changelog: "Searching the command palette also finds plugins, and Enter opens the plugin's page." Changelog line only. Mobile applicability unclear. |
| Routine right-click / context menu | **Present, v0.68.0, desktop.** | Changelog: "Right-click a routine in the details pane for Pause, Resume, Test, Edit, and Delete; clicking a routine no longer opens its detail view." Changelog line only. The routines docs page does not mention it. The mobile docs still say editing and testing a routine require the desktop app. |
| Accent / message color ("Accent to Black", bot-themed user bubble) | **Present, v0.68.1.** | Changelog: "Your messages in a 1:1 Bot chat take that Bot's color; set Accent to Black in Settings → General to turn it off. Requires Grok Bot 0.64.0 or later." Changelog line only. No docs mention. Group chats and Team Bots are not stated (the quote says 1:1 only). |
| Slack user-group mentions | **Present, v0.68.1, Team Bots.** | Changelog line quoted above. The Team Bots docs page covers Slack mention behavior generally but not user groups. |
| Composer slash-key behavior | **Present, v0.68.1.** Docs conflict, so replacement behavior is `unverified`. | Changelog: "Typing / in the composer no longer opens a menu of skills and actions." The skills docs page says "You can reference skills with `/`". Whether `/` still inserts a skill reference without a menu is not stated. |
| Voice memos on mobile | **Docs: playback only, explicit.** Recording on mobile is `unverified`. | Mobile docs: "Play a voice memo a Bot sent". The overview says the Bot keeps you updated "including voice memos and drafts you approve before they are sent." No post-v0.66.0 changelog entry mentions voice memos. No source describes recording or sending a voice memo from mobile. |
| Team Bot mobile support | **Present, explicit docs text.** Creating, setup and publishing are desktop-only. | Team Bots docs: "Teammates can use a published Team Bot from the desktop app, the mobile app, and Slack." Creating, setting up, and publishing are desktop-only tasks. The Mobile docs page does not mention Team Bots. Earlier changelog (pre-0.66.0, v0.65.0): "Teammates can start a voice chat with a Team Bot, and the call stays in their own conversation with it." |

## Docs pages as fetched 2026-10-12 (undated)

- **overview**: persistent Bots, each with a cloud computer (browser, filesystem, terminal). Message by typing, dictating or voice chat. Runs on macOS, Windows, Linux, iOS and Android. No mention of slide decks, Gmail aliases, Spam, plugin search or the command palette.
- **bots**: New, then Create new Bot; Edit Profile; pin or hide Bots; duplicate (keeps profile, settings, skills, routines and avatar, not history, memory or attachments); template link (Public link or Team-only); Marketplace add creates a copy. No mention of accent color, message color or any post-v0.66.0 items.
- **skills-routines-and-automations**: Skills, Teach a task (up to 10 min of screen recording, no audio), Routines. Limits: up to 50 routines per Bot, 20 most recent run records kept per routine, schedules at least 5 minutes apart. "Deleting a routine is immediate and has no undo." No mention of right-click or a context menu.
- **team-bots**: Owner sets up and publishes; teammates get a private chat; routines are personal ("Routines are personal."); description up to 140 characters; Slack behavior (responds when mentioned, follows threads, each thread its own conversation, answers every DM); usable from desktop, mobile and Slack.
- **mobile**: same Bots, conversations, routines, connectors and cloud computer. Voice memo playback; routines can be paused, resumed and deleted. "Editing the schedule or instruction and testing a routine currently require the desktop app." Email and Slack drafts appear as a card with send or discard options.

## Caveats

- The changelog was read from a 2026-10-10 Wayback capture because the live page returns 403. Anything published Oct 10-12 is not covered.
- Every post-v0.66.0 changelog row is single-line evidence with no docs corroboration, except Team Bot mobile support and mobile voice-memo playback (explicit docs text).
- No changelog entry newer than v0.66.0 specifies a platform. Platform values above are inferences from wording, except Team Bot mobile support, which is explicit.
