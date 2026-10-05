# Phase 06 — Main Bot & Proactivity

## Objective

Add one Main Bot per Space that can coordinate specialist Bots and proactively surface relevant work without becoming noisy or unsafe.

## Domain

Recommended relation: `Space.mainBotId -> Bot`. Only an eligible Bot in the same Space may be selected.

## Responsibilities

- surface blocked/attention-needed work
- summarize active Projects/Tasks
- coordinate specialist Bots through existing delegation primitives
- perform user-configured proactive check-ins
- avoid duplicate/noisy notifications

## Safety

Respect notification preferences, quiet hours, approval policy, connector scopes, rate limits, and user disable controls.

## DONE Gate

Main Bot selection is exclusive per Space, coordination uses existing primitives, and proactive behavior is bounded/configurable/tested.
