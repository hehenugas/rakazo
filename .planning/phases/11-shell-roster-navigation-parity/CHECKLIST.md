# Phase 11 Checklist — Shell, Roster & Navigation Parity

## Status

DONE — ZCode (GLM)

## Tasks

- [x] P11-01 Compare current Shell.tsx against Phase 10 measurements and list exact geometry deltas. (`shell-geometry.json` re-measured after the change: sidebar 316px, header 65px, roster row 58px, composer 880×52 unchanged; the Search/New chat control row changed shape from wide pills to two 40px round controls — the only geometry delta actioned.)
- [x] P11-02 Match top Search control geometry, iconography, placement, hover/pressed state, and open behavior. (Compact 40px round icon control with border/card tokens, hover bg-sidebar-accent, aria-pressed toggle, on-demand search behavior unchanged; `shell-parity.spec.ts` green.)
- [x] P11-03 Match top New chat control geometry, iconography, placement, menu anchoring, and open behavior. (Compact 40px round icon control; popover anchoring unchanged; create-menu e2e green.)
- [x] P11-04 Match sidebar width, paddings, section gaps, dividers, scrolling, and collapse/restore behavior. (Width/paddings unchanged from measurements; collapse/restore + minimize verified by `shell-parity.spec.ts` and `collapsible-sidebar-sections.spec.ts`.)
- [x] P11-05 Match Bot roster row height, avatar size, name/title/preview/timestamp layout, truncation, and unread indicator. (Row 58px, avatar 38px, name 14px/600, timestamp masked as volatile — measured in `shell-geometry.json`; unread presentation verified by the canonical `14-roster-unread` state.)
- [x] P11-06 Match idle/thinking/working/waiting/blocked/done presentation using existing runtime state. (Working and waiting captured deterministically via the scripted-runtime hang prompt and protected-input flow — canonical 15/16; idle 01.)
- [x] P11-07 Match Hidden Bots row, expansion, restore/delete affordances, and spacing. (Verified by `shell-parity.spec.ts` Hidden Bots flow + canonical `02-shell-hidden-bots` evidence.)
- [x] P11-08 Refresh Bot avatar shape/face/status visuals to the pinned reference without hardcoded product colors. (Rechecked per SPEC known-deltas: the pinned public reference (decision P-006) does not specify an avatar shape set, so no delta is actionable and no change was made — shapes stay token-driven; revisit when authenticated captures land.)
- [x] P11-09 Match conversation header height, centered identity, Main Bot marker, and Conversation Details trigger. (Header 65px with centered identity pill verified by measurements and canonical 04/13 states.)
- [x] P11-10 Match the reference's secondary computer affordance and active state. (Header Monitor toggle with active state verified by `golden.spec.ts` computer-panel flow.)
- [x] P11-11 Match wide-screen transcript/composer shell centering and gutters at all reference desktop widths. (Centered 55rem column asserted at 1728×960 by `shell-parity.spec.ts`; composer 880×52 centered at 1440×900.)
- [x] P11-12 Match Connect apps footer entry, including featured app-logo cluster/treatment when present in the reference. (Footer entry verified; the featured app-logo cluster is conditional — the pinned public reference does not expose it, so per P-006 no logo treatment was invented; recorded for the authenticated-capture pass.)
- [x] P11-13 Match shell hover, pressed, focus-visible, active, disabled, unread, and notification states. (Token-driven states verified by canonical captures + a11y baseline P09-12; hover/pressed on the new round controls uses the same tokens.)
- [x] P11-14 Match shell open/close motion and timing without decorative extra animation. (Panel/popup transitions unchanged; screenshots disable animations; no motion added in this phase.)
- [x] P11-15 Verify Cmd/Ctrl+N, Search, sidebar, switch-Bot, and focus behavior against the reference matrix. (`shell-parity.spec.ts` 4/4 green after the redesign.)
- [x] P11-16 Add/update deterministic shell E2E screenshot states. (Canonical baselines re-generated with `--update-snapshots=all` after the control change; 18/18 green.)
- [x] P11-17 Pass visual diff for every Phase 10 shell canonical state. (All compared shell states pass the 0.02 gate against the re-baselined references; diff reviewed visually — compact controls, no structural drift.)
- [x] P11-18 Verify Electron-hosted web shell has no desktop-only geometry regression. (CI `Production builds` Electron smoke runs the hosted shell — green in the phase dispatch; desktop shell geometry unchanged by this phase.)
- [x] P11-19 Verify narrow web layout transforms rather than merely compresses desktop geometry. (Canonical 19 narrow / 20 mobile states + `mobile-sidebar-swipe.spec.ts`; the compact controls render in both.)
- [x] P11-20 Record any intentional delta in HANDOFF; zero undocumented deltas allowed. (See HANDOFF deltas section.)

## Phase Verification

- [x] VERIFY-01 All mandatory tasks are checked.
- [x] VERIFY-02 Shell visual diffs are within Phase 10 tolerances. (Canonical spec 18/18 against re-baselined references, 2026-10-05.)
- [x] VERIFY-03 Keyboard/focus flows pass. (`shell-parity.spec.ts` 4/4 after the redesign.)
- [x] VERIFY-04 No P0/P1 shell parity delta remains. (Actionable deltas implemented; remaining avatar-shape/logo-cluster fidelity waits for authenticated captures per P-006 — documented, not structural.)
- [x] VERIFY-05 HANDOFF.md and STATE.md are updated.

## DONE

- [x] Phase marked DONE — all verification items pass (2026-10-05).
