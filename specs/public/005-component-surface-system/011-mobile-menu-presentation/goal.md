---
title: "Goal: Mobile Menu Presentation"
description: "What would make phase 011 worth having done, and the criteria that decide it."
trigger_phrases:
  - "011 goal"
  - "mobile menu presentation goal"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/011-mobile-menu-presentation"
    last_updated_at: "2026-08-30T17:45:00Z"
    last_updated_by: "goal-authoring"
    recent_action: "Goal authored after shipping; before-numbers taken from a detached worktree"
    next_safe_action: "Operator opens the column menu on the phone and checks it is a sheet"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "findings.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-011-goal"
      parent_session_id: null
    completion_pct: 90
    open_questions:
      - "The re-key moves add-view and calendar captures; design question, not a defect"
    answered_questions: []
---
# Goal: Mobile Menu Presentation

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** On a phone an owned menu presents the way the record sheet already does — docked to
the floor, full width, above the navigation bar, dismissible by the scrim and by dragging the handle
— and every sheet menu row is the same component in a different container.

Neither was true. The column menu opened as a desktop dropdown with its first row behind the status
bar and its last row past the bottom of the screen, and the "More tools" sheet centred its rows so
their left edges were ragged across 227px.

**The cause was a path, not a style.** Two mount-and-place paths exist and only one knows about
phones: panels call `positionToolbarPopover`, which takes the sheet branch; menus called
`createOwnedMenu().showAt({x, y})`, which calls `setPosition` directly and never consults a phone
predicate. Not a styling gap — a fork that was never wired.

### Decisions

| ID | Decision |
|----|----------|
| D1 | Before-numbers come from running the same harness against `HEAD` source in a **detached worktree** with the working tree's `styles.css` copied in, so only the code under test differs. A phase that measures its own tree twice has measured nothing. |
| D2 | Dismissal has exactly one owner. The backdrop is a rectangle, not a handler, so a press on it arrives where any other outside press arrives. |
| D3 | The gesture is driven by the browser's real pointer stream. A hand-made `PointerEvent` carries a pointerId the browser never issued, so a synthetic version measures the harness throwing. |
| D4 | The row grammar is keyed to the row, not to the owned menu's shell — doubled-class form, same specificity, nothing in-container moves. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

- [ ] A phone menu docks to the floor: `|bottom − innerHeight| ≤ 1`. Was 876 against an 844 viewport.
- [ ] A phone menu spans the full width. Was 220 against 390.
- [ ] A 19-row menu is capped and **scrolls** rather than grows: height ≤ 0.9 × innerHeight,
      `top ≥ −1`, `scrollHeight > clientHeight`. Was 872 tall against a 760 cap, content 870 visible
      870 — it grew.
- [ ] The backdrop takes the tap, read from `document.elementFromPoint` rather than from the element.
      An inert backdrop is present in the tree and absent from the hit test, and only the hit test is
      the behaviour.
- [ ] The backdrop arrives with the menu **and** leaves with it. Asserting only the second passes
      trivially on a build that never draws one.
- [ ] The handle dismisses past the shipped 96px threshold and springs back below it, and its hit
      band matches the record sheet's 32px. The band clause is owed.
- [ ] Every sheet menu row is built by `createMenuRow` and lays out identically outside the owned
      menu's shell. Label left edges were `[25, 125, 252, 25]`, a 227px spread; and `[16, 101, 16]`,
      an 85px spread, in a panel sheet.
- [ ] Desktop opens at its point, ≤ 320px, no sheet class, no handle, no backdrop anywhere in the
      document.
- [ ] The five stateful dimensions are covered.
- [ ] The operator opens the column menu on their phone and gets a sheet, and every sheet's rows
      start on one edge.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

**Shipped and verified; not operator-confirmed.**

### The re-key's blast radius is measured, not assumed

Keying the row grammar to the row rather than to the owned menu's shell changes computed layout for
**14 of 17** menu-row shapes on desktop and **15 of 17** on a phone. `npm run replay` holds all 8
recorded results; 15 of 204 captures moved against a **measured churn floor of 7**, and the eight
beyond the floor are concentrated in `add-view-popover` (4/4) and `calendar-month-view` (4/4), both
of which render a `db-menu-item` row. That is a measurement carrying an open design question, not a
defect.

### One icon id the host does not ship

`Display width` asked for `arrows-left-right`, which occurs **0** times in the installed host bundle
against **5** for `arrow-left-right`. It was the only `arrows-`-prefixed id in `src/` against twelve
singular siblings. The row therefore drew no glyph, and with no glyph its label sat left of every
sibling's — the report's "Display width carries no icon and floats". Not observable in the harness,
whose icon stub draws a placeholder for any id at all; verified against the bundle instead.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Phone sheet presentation | Shipped, verified | AC-1 to AC-4, before/after from a detached worktree |
| Dismissal ownership | Shipped, verified | AC-5 to AC-7, real pointer stream |
| Shared row component | Shipped, verified | AC-10, AC-12, spread 227px → 0 and 85px → 0 |
| Handle hit band | Owed | Presence asserted; the band is not measured on this surface |
| Gate | 13 green, 0 red at the time of the run | Within it, placement 48/50 with 2 declared reds |
| Operator confirmation | Open | — |

### Deviations and findings

| Item | Note |
|------|------|
| The green gate is a reading of one moment | Three phases wrote to this tree during the work and the CSS lane changed hands twice. What is durable is the attribution: no capture cites any `src/` file this phase touched |
<!-- /ANCHOR:log -->
