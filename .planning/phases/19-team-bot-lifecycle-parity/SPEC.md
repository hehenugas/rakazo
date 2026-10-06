# Phase 19 — Team Bot Publish & Shared Setup Parity

## Objective

Make Team Bot ownership, setup, publish, member access, and private conversations follow Grok Bot's public lifecycle.

## Target Lifecycle

1. Owner starts from Share → Publish to Team or creates a new Team Bot.
2. Choose Copy Bot or Start fresh where applicable.
3. Team copy is private to the owner while being prepared.
4. Owner works through setup for shared plugins, secrets, memories where supported, skills, files, and routines/template choices.
5. Once ready, Publish exposes the Team Bot to teammates.
6. Each teammate opens a private conversation with the shared Team Bot definition.
7. Owner can edit shared setup and Unpublish.
8. Member-specific routines and memories stay private.

## Security

- never copy raw credentials into a Team Bot template/setup record
- shared secrets must use existing secret references/boundaries
- private member conversation/history must never be visible to owner/other members
- publish/unpublish and shared-setup mutation require explicit owner authorization

## DONE Gate

Before Publish, teammates cannot access the Team Bot. After Publish, authorized teammates can open private instances whose shared setup follows the Team Bot definition while personal chat/routines remain isolated.
