# M3 Experience Contract — Grok Bot Journey Parity

## Goal

A user who already knows Grok Bot should be able to use Rakazo without relearning where work lives, how a flow starts, what the next step is, or what each action means.

M3 does **not** require pixel-perfect reproduction. Exact RGB values, font rendering, 1–2 px spacing differences, and screenshot pixel ratios are not acceptance gates.

## What Must Match

For an equivalent Grok Bot capability, parity means matching the public product's:

1. information architecture
2. entry point and feature location
3. terminology and labels when they teach the workflow
4. sequence of steps
5. ownership model and lifecycle
6. state transitions and user feedback
7. primary/secondary action hierarchy
8. error/retry/cancel semantics
9. approval and security boundary
10. keyboard behavior when it is part of the learned workflow
11. desktop/mobile capability split
12. relationships between Bots, Routines, Team Bots, Projects, plugins, and delegated work

## What Does Not Need To Match

- exact pixels or screenshot diff percentages
- exact font family/rendering
- exact color values
- exact shadows/radii when hierarchy is preserved
- animation curves that do not alter meaning
- internal implementation details
- xAI-only provider/runtime architecture

## Reference Rule

Use current public official sources as product truth:

- https://docs.x.ai/grok-bot/overview
- https://docs.x.ai/grok-bot/bots
- https://docs.x.ai/grok-bot/skills-routines-and-automations
- https://docs.x.ai/grok-bot/team-bots
- https://docs.x.ai/grok-bot/mobile
- https://x.ai/changelog/bot

Authenticated screenshots are useful for layout review but are **not required** to execute M3 when official docs/changelog already specify the journey.

If public docs/changelog describe a behavior explicitly, an agent may not mark it pending-reference merely because an authenticated screenshot is unavailable.

## Verification Model

Each M3 checklist item must be verified by one or more of:

- E2E user journey
- integration/unit test for lifecycle/authorization
- deterministic screenshot for hierarchy/layout sanity
- direct code inspection for invariants
- current official product documentation/changelog

Screenshots verify layout and regression, not pixel identity.

## Severity

- **P0:** security/privacy/authorization break or destructive parity error.
- **P1:** a Grok user follows the learned flow and cannot complete it, lands in the wrong lifecycle, or gets materially different action semantics.
- **P2:** terminology, hierarchy, or state presentation causes friction but the journey still works.
- **P3:** cosmetic difference with no workflow impact.

M3 exits with zero known P0/P1 journey deltas.

## Product Rules

### Routines

Routine creation should feel like delegating recurring work to a Bot, not configuring cron infrastructure. Chat is a first-class creation path. Details → Routines is the management home. Human schedule concepts are primary; raw cron and event infrastructure are progressive disclosure.

### Team Bots

A Team Bot has a shared definition/setup but private member conversations and personal routines. Draft/setup state is owner-visible until publish. Publish/unpublish controls team availability.

### Projects

A Project is active orchestration: the Bot/Cloud Agent plans work and coordinates child work. It is not merely a manually maintained task tracker.

### Main Bot / delegation

The user remains able to message the active Bot while work continues. Stop/cancel, completion, blockers, delegated status, and proactive attention must have predictable ownership semantics.

### Rakazo strengths

Keep provider-neutral integrations, extra event triggers, self-hosting, advanced cron, and other Rakazo capabilities. When Grok has a simpler ordinary path, hide extra power behind Advanced rather than making users learn a different primary flow.
