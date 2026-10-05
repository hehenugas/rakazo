# Intentional Deltas — M2 Parity Exceptions

Phase 10 deliverable (P10-19). Every place the fork deliberately does not match the
Grok Bot reference, with the constraint that justifies it. Security, accessibility,
provider neutrality, and native platform conventions override parity; each override
must appear here. Phases 11–16 must extend this file, never delete an entry without
a recorded decision.

## Branding

- **Product name and identity**: the fork is "Rakazo"; sign-up, headings, dialog
  titles, and release copy use Rakazo, not Grok. Public docs pages remain fork-authored.
- **Avatar mascots**: the eight shipped mascot shapes are fork artwork; identity color
  stays user/bot-assigned through shared tokens.

## Provider neutrality

- **Model and provider labels**: model pickers, connection settings, and thinking-level
  copy describe whatever the operator configures (OpenAI-compatible, Composio, MCP,
  Pipedream emulators in tests). Grok's model names and billing copy are never hardcoded
  (`AGENTS.md` provider-neutrality rule).
- **Connectors catalog composition**: the emulator/fork catalog lists the connectors the
  fork ships (Gmail, Google Calendar, Google Drive, Slack, Notion, GitHub, X, Linear,
  Airtable, …); live Grok accounts show their own connector set.

## Security and authorization

- **Credential boundaries**: connector credentials stay behind the existing connector
  path with no first-party credential storage; the credential-request UX matches the
  observable flow, never the underlying mechanism.
- **Approvals**: consequential actions keep the fork's server-enforced approval policy
  (default-approval for connector writes, user-turn drafts, normal-run check-ins). UI
  parity may not weaken enforcement.

## Accessibility

- **Focus and labels**: roster rows, toggles, and dialogs expose explicit
  `aria-label`/`aria-expanded`/`aria-pressed`/`sr-only` text beyond what the reference
  visibly shows; where reference contrast and a11y contrast conflict, a11y wins
  (documented per state in the matrix once the reference capture lands).
- **Keyboard parity floor**: every reference keyboard flow is matched, but the fork may
  add shortcuts (documented) where the reference has none.

## Native platform conventions (mobile)

- **Navigation and chrome**: Expo Router, native sheets, menus, alerts, pickers, and
  PlatformColor system chrome replace web dialogs/popovers; parity targets the
  information hierarchy, not the widget chrome.
- **Custom surfaces** (thread, composer, avatars, cards) use plain StyleSheet with the
  shared tokens through `apps/mobile/lib/appearance` — visual parity with the web fork
  and the reference where the platform allows.

## Copy that cannot be truthfully mirrored

- Any claim the fork cannot make (e.g. "works with your SuperGrok plan", Grok-specific
  model quality wording, cloud-computer isolation claims that depend on Grok's
  infrastructure) is reworded to describe the fork's actual behavior. The information
  hierarchy and placement still match.
