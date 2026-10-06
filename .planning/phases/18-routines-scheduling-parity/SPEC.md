# Phase 18 — Routines & Scheduling Experience Parity

## Objective

Make recurring work feel like Grok Bot: users delegate repeatable work to a Bot in conversation, then manage it under Conversation Details → Routines.

## Current Gap

Rakazo already has a strong Routine engine, but the primary creation experience still feels like an automation/cron editor. Grok's ordinary flow is coworker-first: prove a task, ask the Bot to repeat it, confirm schedule/timezone/next run, then manage the Routine later.

## Target Journey

1. User completes or describes a task in a Bot conversation.
2. User asks the Bot to repeat it on a schedule or supported event.
3. Bot proposes/creates a Routine using the existing provider-neutral Routine backend.
4. Conversation shows a concise Routine confirmation with instruction, human-readable schedule, timezone, and next run.
5. Details → Routines lists the Bot's routines and recent state.
6. Routine detail allows Active/pause, Test run, edit instruction/schedule, inspect Run history, and Delete.
7. Advanced cron/webhook/Git/message triggers remain available behind progressive disclosure.

## Schedule Hierarchy

Primary human schedule choices should cover:

- Once
- Daily
- Weekdays
- Weekly
- Monthly
- Yearly

Advanced may expose:

- hourly/arbitrary interval
- raw cron
- webhook
- Git events
- message-provider events

## Team Bot Rule

A Routine created with a Team Bot belongs to the user who created it, runs as that user, reports in that user's private conversation, and is not editable/visible by teammates as a shared Team Bot Routine.

## Mobile Rule

Mobile must show schedule, next run, instruction, Run history, Active/pause, and delete. Editing schedule/instruction and Test run may remain desktop-only if matching the current reference.

## DONE Gate

A user can create recurring work conversationally, see next-run confirmation, and manage the Routine using the same mental model as Grok Bot without encountering raw cron unless choosing Advanced.
