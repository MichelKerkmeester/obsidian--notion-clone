---
title: "Goal: Add View Surface Redesign"
description: "What would make phase 013 worth having done, and the criteria that decide it."
trigger_phrases:
  - "013 goal"
  - "add view sheet goal"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/013-add-view-sheet"
    last_updated_at: "2026-08-30T17:45:00Z"
    last_updated_by: "goal-authoring"
    recent_action: "Goal authored after shipping; six reported defects adjudicated against production"
    next_safe_action: "Operator opens Add View on the phone and reports"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-013-goal"
      parent_session_id: null
    completion_pct: 90
    open_questions:
      - "--text-muted at 12px measures 4.1:1; program-wide token decision, escalated"
    answered_questions:
      - "It was already a sheet on a phone; defect 6 was a fixture artifact"
---
# Goal: Add View Surface Redesign

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The Add View surface is one row grammar shared with the record sheet and the owned
menu, one control per job, groups that read as groups, and the same phone presentation as every other
sheet.

It was six control idioms and five type sizes in one 292px panel, with the same action offered twice,
no visible labels, no sections, and empty spans that read as loading skeletons.

**The first deliverable was adjudicating the report against production, not against the capture.**
Six defects were reported off a committed screenshot. Measured by opening the real `showAddViewMenu`
in a browser: **4 REAL, 1 HALF REAL** — the accessible name ships, the visible label does not — and
**1 FIXTURE ARTIFACT**: it already was a sheet on a phone. A seventh nobody reported was found the
same way: production renders **7** view-type tiles and the fixture renders **4**, so every committed
capture understates the surface by three tiles.

**And the capture could never have answered the question it was used for.** The scenario's
`captureCss` forces `position: static !important`, so **no capture of this surface can ever show
sheet presentation.** Defect 6 was read off an image structurally incapable of showing the answer.

### Decisions

| ID | Decision |
|----|----------|
| D1 | A check earns its result only if it drives `showAddViewMenu`. The screenshot fixture is hand-written markup and diverges from production in four places. |
| D2 | Neither duplicate action is removed. They do different things; renaming is the smaller change that removes the ambiguity, and deleting either would delete behaviour. |
| D3 | Alignment is measured at the **content** edge. A padded block starts its text a padding in, and comparing that to an unpadded label reports a misalignment that is not there. |
| D4 | Three shortfalls are declined with numbers rather than forced: the tile border, `--text-muted`, and the two disagreeing phone predicates. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

- [ ] No two controls carry the same accessible name. Was 2 named `Duplicate current view`.
- [ ] Every input, select and checkbox has a **visible** label, not only an accessible one. Was 0 of
      3.
- [ ] Every action row computes the same box as a live `createMenuRow` row in the same document. Was
      36px / 6px 12px against 30px / 0 8px, because a legacy family sits 19,000 lines later at equal
      specificity and source order decides.
- [ ] Nothing reads as a loading skeleton: 0 elements whose only content is horizontal rules. Was 7
      empty 42×18 spans at 1.54:1.
- [ ] Between-group gap ≥ 2× the within-group gap, measured as rectangle deltas rather than declared
      values. Was 4px within and 0px between — the groups closer together than the items inside them.
- [ ] At least 2 group headings, each carrying non-empty text and each load-bearing for the gap
      above. The element count alone is a class-name criterion and is banned as one.
- [ ] The group heading, field caption, checkbox caption and row icon share one content left edge.
      Was 3 distinct edges: 9 / 15 / 21 desktop and 9 / 15 / 29 phone.
- [ ] A resting row paints no fill. Was rgb(242,243,245) on a rgb(242,242,242) panel.
- [ ] The phone presentation does not regress, and the desktop page runs the same assertions
      **inverted**, so a change that made everything a sheet fails on the desktop side.
- [ ] The fixture stops lying: same tile count, accessible names and class list as production,
      asserted by a test that reads both. Was 4 divergences.
- [ ] The five stateful dimensions are covered.
- [ ] The operator opens Add View on a phone and it looks like the rest of the plugin.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

**Shipped and verified; not operator-confirmed.** Lane entries 50-53; the tile grid was deleted and
rebuilt on the row grammar, and a verifier follow-up took the control boundary 1.21:1 → 3.23:1.

### Three things are declined with numbers, which closes them

No border or surface token in this system clears 3:1 against the panel — measured 1.15 / 1.21 / 1.08
/ 1.01 in light — and inventing one would fork the palette. It does not need to: the tiles are
replaced by rows whose text identifies them, so no boundary is load-bearing for identification, and
the focus ring that *is* load-bearing measures 4.3 light / 3.36 dark.

`--text-muted` at 12px measures 4.1:1 against a 4.5:1 floor for body text. It is the token every
muted label in the plugin already uses, so changing it is a program-wide decision. **Escalated, not
fixed.**

The two phone predicates still disagree — `isTouchDevice` at a 760px container against
`isMobileBottomSheet` at a 600px window — so on a 700px tablet this surface is "touch" to every
renderer and not a sheet to the positioner. Pre-existing, named in `design-system.md` §7, out of
scope here.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Six reported defects adjudicated | Done | 4 real, 1 half real, 1 fixture artifact |
| Redesign | Shipped, verified | AC-1 to AC-7, each with a before-number |
| Two criteria found during implementation | Shipped, verified | AC-9 left edges, AC-10 resting fill |
| Fixture parity test | Shipped | `add-view-popover-layout.test.ts` |
| Operator confirmation | Open | — |

### Deviations and findings

| Item | Note |
|------|------|
| The `captureCss` position override stays | Without it the popover leaves the flow and the capture box collapses. Now recorded as the reason no capture can answer a placement question |
| Production renders 7 tiles, the fixture 4 | Found by measuring, not reported. Every committed capture understates the surface |
<!-- /ANCHOR:log -->
