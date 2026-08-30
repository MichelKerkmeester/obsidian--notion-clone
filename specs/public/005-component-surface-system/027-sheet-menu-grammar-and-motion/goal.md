---
title: "Goal: Sheet Menu Grammar and Motion"
description: "What would make phase 027 worth having done, and the criteria that decide it."
trigger_phrases:
  - "027 goal"
  - "sheet menu grammar goal"
  - "sheet row component goal"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/027-sheet-menu-grammar-and-motion"
    last_updated_at: "2026-08-30T18:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Shipped; row grammar, submenu layer, sheet drag and entrance all measured"
    next_safe_action: "Operator opens the column menu on their phone and tracks one left edge down it"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-027"
      parent_session_id: null
    completion_pct: 90
    open_questions:
      - "Should the Add-view form above the create rows be restyled, or is the row grammar enough?"
    answered_questions: []
---
# Goal: Sheet Menu Grammar and Motion

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Every menu the plugin presents as a phone sheet is built from one row whose left edge
a reader can track straight down the list, and a row that *opens* something announces itself as such
rather than leaving each caller to invent the difference.

This surface has now been reported three separate times — centre-aligned rows, a `Change type…`
submenu that does nothing, and a sheet that scrolls sideways. That count is what distinguishes a
component from a fix: three reports against one surface means the row is not a shared thing yet, it
is a shared thing with a hole in it.

**The row was already shared. What was not shared was the last property.** `createMenuRow` builds
every one of these rows and has since phase 011, which measured the label spread go 227px → 0 and
shipped. The row renders as a `<button>`, deliberately, so it is focusable without extra wiring.
Obsidian's own `app.css` declares `button { justify-content: center }`, and the plugin's row rule
declared everything except `justify-content` — so the host's value applied uncontested on a device
and nowhere else. A shared row is only shared down to the last property it actually states.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The harness loads Obsidian's real `button` rule, verbatim, on every page. A page that omits what the app declares certifies a rendering nobody ships, and that is the whole reason five alignment checks were green while the device was wrong. |
| D2 | Alignment is a count, not an opinion: the number of distinct label x-positions in one sheet, and the only passing value is 1. |
| D3 | The trailing chevron belongs to the component, keyed to `submenu: true`, not to each caller. A row that opens and a row that acts are two behaviours of one row. |
| D4 | Drag-to-dismiss belongs to the sheet presentation, wired once in the positioner through the overlay stack, not per caller. A grab bar drawn on a surface that cannot be dragged is worse than no bar. |
| D5 | The sheet entrance is a transition, never a CSS animation, because the drag gesture writes an inline transform and must be able to take the surface over mid-flight. An animation would outrank it and swallow the first touch. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

- [x] The column menu sheet has exactly **1** distinct label x-position. Was **14** across 18 rows,
      measured against the host's own button rule; the two that held their edge were the chevron
      rows, whose auto margin absorbed the free space that centred everything else.
- [x] The Add-view sheet's create rows have exactly **1**. Was **6** across 8 rows.
- [x] The row states `justify-content: flex-start` rather than inheriting. Computed `center` before.
- [x] Adjacent rows carry a hairline; a row that ends a group carries none. Was 0 of 12 and 0 of 5.
- [x] The hairline begins at the label column, not at the sheet edge, and follows the row shape that
      owns it — an action row and a checkable option row have different label columns.
- [x] A row that opens a submenu carries a chevron and `aria-haspopup`; a row that acts carries
      neither.
- [x] A submenu opened from a sheet paints in front of that sheet and its backdrop. Was z-index
      **110** against a backdrop at **999** — opened, laid out, full width, on screen, and painted
      underneath, which on a phone is a tap that does nothing.
- [x] A sheet scrolls on one axis. `overflow-x` was `auto`, because declaring only `overflow-y`
      couples the other axis to it.
- [x] A sheet stops at 90% of the screen and scrolls inside it: 760px of a 844px viewport.
- [x] The Add-view sheet follows a drag on its grab bar and dismisses past the threshold. It
      followed nothing: `attachSheetDragToDismiss` had two callers and the positioner was not one.
- [x] The sheet rises its own full height, easing out over 260ms, on transform alone. It travelled
      8px, scaled, faded — and **none of that ran**: the entrance never started at all.
- [x] A thumb on the grab bar takes the sheet over while the entrance is still running.
- [x] Reduced motion lands the sheet at rest with nothing running, backdrop included.
- [ ] The operator opens the column menu on their phone, tracks one left edge down it, taps
      `Change type…` and gets a submenu.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

**Shipped and verified; not operator-confirmed. Not committed.**

### The check that certified the defect

Reverting each fix and re-running turns 11 new checks red — and also turns **five checks written by
earlier phases** red, including 011's own "rows in a sheet menu share one left edge, icon or no
icon" (13px spread) and "a shared menu row lays itself out in any sheet" (76px spread). Those five
have been green on every run since they were written. They were not weak; the document they ran
against was missing a declaration the device has.

### What the entrance was actually doing

Sampled across the whole window: identity transform at 12ms and zero animation objects at any point.
Both call sites added the start class and flipped to the end class inside one `requestAnimationFrame`,
which fires *before* that frame's style recalculation — one style resolution, already carrying the
end state, nothing to interpolate. Retuning the duration or the distance would have changed nothing.

A second, subtler version of the same bug appeared during the fix: declaring the transition on the
rule that *introduces* the start offset makes the step into the start state interpolate too, so the
sheet begins sliding out of view and the end state reverses it a frame later, near the origin. The
transition belongs to the state being moved to.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Row grammar | Shipped, verified | 14 → 1 and 6 → 1 distinct label x, against the host button rule |
| Dividers | Shipped, verified | 12/12 between, 0/5 trailing, inset tracks the row shape |
| Submenu layer | Shipped, verified | z 110 → 1000 above a 999 backdrop, plus a hit test |
| Sheet drag | Shipped, verified | Gesture-driven, not a source grep |
| Entrance | Shipped, verified | 477 → 313 at 60ms → 0 at 460ms; and 0 movement under reduced motion |
| Harness host-blindness | Closed | Obsidian's `button` rule loaded on all 17 pages |
| Gate | 13 of 14 green | The red is `comments`, from another agent's untracked `tools/bench/` files |
| Operator confirmation | Open | — |

### Deviations and findings

| Item | Note |
|------|------|
| Desktop popover entrance | Has the same never-runs defect and is deliberately left alone. A surface nobody reported starting to animate is a change this phase should not make silently |
| `placeSheet`'s inline `max-height` | Dead. The stylesheet's `!important` 90svh outranks it, so the keyboard-aware cap is delivered by the `calc` and not by the arithmetic. Already documented at the function; not touched |
| `setSheetMount` early return | A sheet created directly on the body skips `db-surface`/`note-database-container`. Latent, not the reported defect, and adding the container class has a wide blast radius. Left alone |
| Add-view form | The create rows are fixed. The form above them keeps its existing grammar; restyling it is wider than what was reported |
| Two harness pages lacked reduced motion | Both fixed. Neither mattered until the entrance started running |
<!-- /ANCHOR:log -->
