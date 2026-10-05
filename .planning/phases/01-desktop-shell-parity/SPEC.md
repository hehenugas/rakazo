# Phase 01 — Desktop Shell Parity

## Objective

Make the desktop/web shell immediately read as a Grok Bot-like coworker workspace while preserving existing Rakazo behavior.

## Target UX

- Search and New Chat are primary top actions.
- Sidebar is a coworker roster with status/activity previews.
- Hidden Bots is a collapsible roster section.
- Footer uses `Connect apps` instead of technical integrations language.
- Conversation header centers Bot identity and opens Conversation Details.
- Computer remains accessible but visually secondary.
- Wide layouts use a centered conversation/composer column.
- Existing mobile behavior must not regress.

## Likely Code Areas

Revalidate paths after Phase 00:

- `apps/web/src/pages/Shell.tsx`
- shell/sidebar components
- command palette
- Bot avatar/presence components
- web E2E shell/sidebar tests

## Data Strategy

Prefer deriving presence from existing run/tool state in this phase. Do not add persistence merely for presentation unless required.

Suggested presentation states:

`idle | thinking | working | waiting | blocked | done`

## Acceptance Criteria

The shell can be navigated end-to-end without losing existing Bot/group/search/computer functionality, and screenshot review clearly shows the new information hierarchy.

## DONE Gate

Desktop shell acceptance tests, keyboard navigation, responsive sanity checks, and screenshot review all pass.
