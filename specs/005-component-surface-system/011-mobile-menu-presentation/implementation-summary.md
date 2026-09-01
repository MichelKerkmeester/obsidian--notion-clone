---
title: "Implementation Summary: Mobile Menu Presentation"
description: "Phone menus present as sheets, and one shared row component now serves every sheet. Harness-verified with the row re-key's reach measured; not operator-confirmed."
trigger_phrases:
  - "011 mobile menu summary"
  - "phone menu sheet shipped"
importance_tier: "critical"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/011-mobile-menu-presentation"
    last_updated_at: "2026-08-30T07:12:00Z"
    last_updated_by: "phase-author"
    recent_action: "Menu path routed to the sheet branch; utilities rows moved to the shared component"
    next_safe_action: "Operator opens a column menu on the device and reports"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "findings.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-011"
      parent_session_id: null
    completion_pct: 91
    open_questions: []
    answered_questions:
      - "The two bands are one relation, not one constant: menu >= record against a declared floor"
      - "A menu sheet did coexist with a keyboard and never moved; keepSheetPlaced fixes it"
      - "The cap clause could not fail under its own control and now asserts which ceiling binds"
---
# Implementation Summary

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 011-mobile-menu-presentation |
| **Shipped** | 2026-08-30 |
| **Level** | 1 |
| **State** | Shipped and harness-verified. Not operator-confirmed |

<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

A menu opened on a phone now presents as a sheet. It docks to the bottom of the screen, spans the
full width, caps its height and scrolls its own overflow, carries the grab handle every other sheet
has, and is dismissed either by the scrim or by dragging the handle down. Before this, the table's
column menu opened as a desktop dropdown with its first row behind the status bar and its last row
past the bottom of the screen.

The second half is less visible and reaches further. Menus that had already reached sheet
presentation were each building their own rows, and they disagreed — one sheet's rows were centred
with ragged left edges while another's were left-aligned on a consistent icon column. There is now one
row component, and it lays itself out correctly in any sheet rather than only inside the owned menu's
own shell.

### Files Changed

| File | Action | Purpose |
|---|---|---|
| `src/views/owned-menu.ts` | Modified | Takes the sheet branch on a phone: dock, width, height cap, scroll, handle, backdrop |
| `src/views/menu-row.ts` | Modified | Becomes the row for sheets outside the owned menu's shell |
| `styles.css` | Modified | Row rules re-keyed to the row itself in a doubled-class form that preserves specificity |
| `tools/storybook/verify-placement.mjs` | Modified | Adds the phone-menu criteria and the desktop regression guard |

<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

The cause was read out of the two mount-and-place paths before anything was changed. Panels reach the
sheet branch through `positionToolbarPopover`; menus call `showAt` and `setPosition` directly and
consult no phone predicate. The sheet branch was not broken — nothing reached it. This program has a
recorded history of theorising a cause and being wrong, so reading both paths was a task rather than
an assumption.

The call sites were then counted, because their shape constrained the design: roughly 11 construction
sites and 14 `showAt` calls, three taking their point from an anchor rect and the rest from the
cursor. Serving only one of those shapes would have left half the menus wrong.

For the second half, the whole family of menu-like rows inside sheets was enumerated first — 17
shapes. That count is what changed the work from repairing one ragged sheet into supplying a shared
row, and it is the difference between fixing an instance and fixing a family.

Because this phase's own work is JavaScript and the row re-key is CSS, the re-key was applied by the
coordinator holding the stylesheet lane. The before/after numbers for the presentation half were
taken from a detached worktree at the pre-change commit with the working tree's stylesheet copied in,
so only code differed between the two readings.

<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|---|---|
| Route the menu path into the existing sheet branch rather than restyle the dropdown | The presentation already existed and was already asserted by eight checks. Restyling would have produced a second thing that resembles a sheet and drifts from it |
| Take the branch on the presentation decision, not on where the point came from | Three call sites derive a point from an anchor and eleven from a cursor. Keying on the point would have served one shape and left the other wrong |
| Make the backdrop a rectangle rather than a handler | The owned menu already owns outside-press and Escape handling. A backdrop with its own handler would give one surface two dismissal owners, which is a defect rather than a detail |
| Assert the hit test from the document, not from the element | An inert backdrop is present in the tree and absent from the hit test. Only the hit test is the behaviour, and the element-side assertion would pass on a backdrop that does nothing |
| Drive the drag through the browser's real pointer stream | A synthesised `PointerEvent` carries a pointerId the browser never issued, so `setPointerCapture` rejects it and the check measures the harness throwing rather than the gesture working |
| Assert the short drag as well as the long one | A check proving only that a long drag dismisses also passes on a surface that closes on any touch, which would make the menu impossible to scroll |
| Verify the icon id against the installed host bundle | The harness's icon stub draws a placeholder for any id at all, so the missing glyph is invisible to it. The bundle is the only thing that knows which ids ship |
| Measure the re-key's blast radius instead of asserting inertness | The re-key touches a rule family seventeen shapes share. It is not inert, and saying so with a number is worth more than a claim that it is |

<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|---|---|
| AC-1 docks to the bottom | **PASS.** Was `bottom=876` against an 844 viewport, 32px past the edge; now 844 |
| AC-2 spans the width | **PASS.** Was `width=220` against a 390 viewport; now 390 |
| AC-3 a 19-row menu caps and scrolls | **PASS.** Was `height=872` against a 760 cap with content 870 and visible 870 — it grew instead of scrolling. Now 760 at the cap, content 898, visible 759 |
| AC-4 carries the grab handle | **PASS.** Handle was absent; now present |
| AC-5 backdrop takes the tap | **PASS.** The document painted the table above the sheet; now it paints the scrim with `pointer-events: auto` |
| AC-6 backdrop arrives and leaves with the menu | **PASS.** Both clauses asserted |
| AC-7 drag dismisses past 96px and springs back below it | **PASS.** 140px unmounts; 40px does not. Driven through the real pointer pipeline |
| AC-8 desktop unchanged | **PASS**, identical on both sides. A deliberate two-sided guard |
| AC-9 record sheet unchanged | **PASS, 8/8** |
| AC-10 utilities rows keep their layout | **PASS.** Label left edges were `[25, 125, 252, 25]`, a 227px spread; now `[35, 35, 35, 35]` |
| AC-11 every row asks for an icon the host ships | **PASS.** `arrows-left-right` occurs 0 times in the installed bundle; `arrow-left-right` occurs 5 |
| AC-12 a shared row lays out in any sheet | **PASS.** Label spread was 85px; now 0px |
| AC-14 re-key blast radius measured | **PASS as a measurement.** 14 of 17 shapes change on desktop, 15 of 17 on a phone. Replay holds all 8 |
| AC-13 phase gate | **PASS. 13 green, 0 red.** Placement 48/50 within it, both reds declared |

<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Not operator-confirmed.** Every result is a harness number and the report was about visible
   shape on a phone.

2. **The green gate is a reading of one moment.** Three phases wrote to this tree during the work and
   the stylesheet lane changed hands twice, so the capture-freshness check in particular tracks a
   stylesheet this phase does not own. What is durable is the attribution: no capture cites any
   source file this phase touched.

3. **Eight captures moved beyond the measured churn floor.** Fifteen of 204 differ against a floor of
   seven, and the excess concentrates in `add-view-popover` (4 of 4 variants) and
   `calendar-month-view` (4 of 4). The add-view surface renders a row the audit shows changing. This
   is carried as an open design question with a measurement attached rather than as a defect.

4. **The row re-key is not inert and was never claimed to be.** It changes computed layout for most
   of the seventeen menu-row shapes. That is the intended effect of unifying a row grammar, but it
   means a revert is not free.

<!-- /ANCHOR:limitations -->
