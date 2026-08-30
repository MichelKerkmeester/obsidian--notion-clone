---
title: "Implementation Plan: Mobile Menu Presentation"
description: "The approach that was taken to give phone menus the sheet presentation the plugin already builds, and to make one shared row component serve every sheet instead of each surface hand-rolling its own."
trigger_phrases:
  - "011 mobile menu plan"
  - "phone menu sheet approach"
  - "shared menu row"
importance_tier: "critical"
contextType: "planning"
---
# Implementation Plan: Mobile Menu Presentation

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

**This document is a record, not a forecast.** The work shipped before the plan was written.

The phase had two halves, and the second turned out to be the more valuable one.

*Presentation.* A menu on a phone was rendered as a desktop dropdown — first row behind the status
bar, last row past the bottom of the screen, covering the table it belonged to. It now docks to the
bottom, spans the width, caps its height, scrolls its overflow, carries a grab handle and dismisses
by scrim or drag.

*Row grammar.* Menus that had already reached sheet presentation were each building their own rows,
and they disagreed with one another. There was no shared sheet menu row. There is now.

**The cause was a path, not a style.** Panels call `positionToolbarPopover`, which calls
`applySheetChrome` and takes the sheet branch on a phone. Menus call `createOwnedMenu().showAt()`,
which calls `setPosition` directly and never consults a phone predicate. The sheet branch could not
run because nothing reached it.

<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

| Gate | Observed |
|---|---|
| Phase gate | **13 green, 0 red** — types, tests (431 in 57 files), lint, comments, folder-docs, naming, pinned-values, css-lane, replay, inverted-assertions, screenshots-fresh, story-coverage, placement |
| Placement, within the gate | **48/50, 2 red for a declared reason** — the row re-key at the time of the run, and the pre-existing paint-containment clipping |
| Recorded results still hold | `npm run replay` **PASS, all 8** |
| Capture churn | 204 captured, **15 differ**, against a measured floor of **7** |

**The green run is a reading of one moment, and the plan says so.** Three phases wrote to this tree
during the work and the CSS lane changed hands twice, so `screenshots-fresh` in particular tracks a
stylesheet this phase does not own. What is durable is the attribution: no capture cites any `src/`
file this phase touched.

<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

**Two mount-and-place paths existed and only one knew about phones.** The fix routes the menu path
through the same sheet branch the panel path already took, rather than restyling the dropdown into
something that resembles a sheet.

The shape of the call sites decided the design. There are roughly 11 owned-menu construction sites
and 14 `showAt` calls; three derive their point from an anchor element's rect and the rest use the
cursor. A design serving only one of those two shapes would have left half the menus wrong, so the
sheet branch is taken on the presentation decision rather than on where the point came from.

**Dismissal had to end up with exactly one owner.** The owned menu already owns its own capture-phase
`pointerdown` and `Escape` handling, and a sheet has a scrim of its own — two dismissal owners on one
surface is a defect. The resolution is that the backdrop is a *rectangle, not a handler*: a press on
it arrives at the same place as any other outside press, and the drag gesture calls the same
idempotent `close()`.

**The second half was a missing component, not a broken one.** `menu-row.ts` already existed and was
the row component for owned menus. The sheets that disagreed were not using it — the "More tools"
sheet had hand-rolled a second copy of the same three elements, because the shared component could
not carry the class its container styles. That is why the rows were centred and ragged while the
column menu was left-aligned with a consistent icon column.

The repair re-keys the row rules to the row itself, in a doubled-class form that preserves
specificity, so a shared row lays itself out in any sheet rather than only inside the owned menu's
shell.

<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

**Step 1 — read both paths before changing either.** The structural cause was confirmed by reading
`popover-position.ts` and `owned-menu.ts` rather than inferred from the symptom. This program has a
recorded history of theorising a cause and being wrong.

**Step 2 — inventory the family before fixing the instance.** Every surface rendering a menu-like row
inside a sheet was enumerated first. The count that came back — 17 menu-row shapes — is what turned
the second half from "fix this sheet" into "there is no shared row".

**Step 3 — take the sheet branch on the menu path**, with the cap and the scroll, the handle, and the
backdrop that arrives and leaves with the menu.

**Step 4 — move the utilities rows onto the shared component** and re-key the row rules so the
component works outside the owned menu's shell.

**Step 5 — measure the blast radius rather than assert it.** The re-key touches a rule family
seventeen shapes share, so the question of what else moved was answered with a run, not an argument.

<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

Three deliberate choices, each made because the obvious version of the check would have passed
against the defect.

**The hit test is read from the document, not from the element.** An inert backdrop is present in the
tree and absent from the hit test, and only the hit test is the behaviour. AC-5 therefore asserts
`document.elementFromPoint` above the sheet returns the backdrop itself.

**The drag is driven by the browser's own pointer stream.** A hand-made `PointerEvent` carries a
pointerId the browser never issued, and `setPointerCapture` rejects it — a synthesised version would
measure the harness throwing rather than the gesture working.

**The short drag is a control, not a nicety.** A check proving only that a long drag closes the menu
also passes on a surface that closes on *any* touch, which would make the menu impossible to scroll.
Both sides of the shipped 96px threshold are asserted.

**Two regression guards pass on both sides, and that is their job.** The desktop check exists because
the phone branch is a new fork inside a function fourteen call sites share, and the way that goes
wrong is silently, on the presentation nobody is looking at.

<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

`003-mobile-sheet-presentation` built the presentation this phase routes to, and is the regression
surface: all eight of its record-sheet checks stay green, including `sheet bottom=844 viewport=844`
and the navigation-bar coverage at `sheet 635-844 navbar 772-844`.

`010-sheet-reading-and-keyboard` was refining the same sheet family concurrently. The two phases
touch different surfaces of it.

The row re-key was applied by the coordinator with the stylesheet lane held, because this phase's own
work is JavaScript and the re-key is CSS. That hand-off is why AC-12's evidence cites a lane holder
other than this phase.

**The host is a dependency for icon ids.** AC-11 was verified against the installed
`obsidian.asar`, not against the harness, whose icon stub draws a placeholder for any id at all.

<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

The presentation half reverts by removing the sheet branch from the menu path; menus return to
opening at their point at their own width. Nothing else depends on the branch, and the desktop guard
already demonstrates that path is untouched.

The row re-key is the half with reach, and its reach was measured rather than estimated: **14 of 17
menu-row shapes on desktop and 15 of 17 on a phone** change computed layout under it. Reverting it
returns those shapes and re-opens the ragged-sheet defect.

**One item is left open as a design question rather than a defect.** Fifteen of 204 captures moved
against a measured churn floor of seven, and the eight beyond the floor concentrate in
`add-view-popover` (4 of 4 variants) and `calendar-month-view` (4 of 4). `add-view-popover` renders a
row the audit shows changing. That is recorded as a measurement with an open question attached, not
as an unexplained regression.

<!-- /ANCHOR:rollback -->

---

## 8. CROSS-REFERENCES

- [`spec.md`](spec.md) · [`tasks.md`](tasks.md) · [`acceptance-criteria.md`](acceptance-criteria.md) · [`findings.md`](findings.md)
- [`../spec.md`](../spec.md) · [`../roadmap.md`](../roadmap.md) · [`../design-system.md`](../design-system.md)
- [`../003-mobile-sheet-presentation/spec.md`](../003-mobile-sheet-presentation/spec.md)
- [`../013-add-view-sheet/spec.md`](../013-add-view-sheet/spec.md) — rebuilt on the row grammar this phase unified
