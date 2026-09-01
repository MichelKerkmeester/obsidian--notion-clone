---
title: "Feature Specification: Mobile Menu Presentation"
description: "Present the plugin's owned menus as bottom sheets on a phone instead of desktop dropdowns that run off both edges of the screen."
trigger_phrases:
  - "mobile menu presentation"
  - "column menu sheet"
  - "owned menu phone"
  - "menu runs off screen"
  - "showAt point"
  - "011 mobile menu"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/011-mobile-menu-presentation"
    last_updated_at: "2026-08-30T05:30:00Z"
    last_updated_by: "phase-author"
    recent_action: "Phase cut from an operator device report with a screenshot; not started"
    next_safe_action: "Confirm the menu path never reaches positionToolbarPopover before designing the fix"
    blockers: []
    key_files:
      - "spec.md"
      - "device-column-menu.png"
      - "reference-sheet-in-this-plugin.png"
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
# Feature Specification: Mobile Menu Presentation

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->

> Phase chain: parent [`../spec.md`](../spec.md). Related: `003-mobile-sheet-presentation` built the
> sheet presentation this phase needs to reach, and `010-sheet-reading-and-keyboard` is refining how
> that sheet reads. This phase is about a family of surfaces that never reaches it at all.

<!-- ANCHOR:problem -->
## 1. THE REPORT

`device-column-menu.png` is the table's column menu on a phone. It is presented as a desktop
dropdown: its first row sits behind the status bar, its last row runs past the bottom of the screen,
and it covers most of the table it belongs to. The operator's words: *"the desktop table column
dropdown is also a dropdown / side panel on mobile but should be a sheet on mobile."*

`reference-sheet-in-this-plugin.png` is the record sheet on the same phone — the presentation this
plugin already builds, and the one the menu should adopt.

## 2. THE STRUCTURAL CAUSE, to confirm before designing

Two mount-and-place paths exist and only one of them knows about phones.

- Panels call `positionToolbarPopover` (`src/views/popover-position.ts`), which calls
  `applySheetChrome` and takes the sheet branch on a phone.
- Menus call `createOwnedMenu().showAt({x, y})` (`src/views/owned-menu.ts:129-145`), which calls
  `setPosition` directly. It never touches `positionToolbarPopover`, so no phone predicate is
  consulted and the sheet branch cannot run.

That is why the menu is a dropdown on a phone: not a styling gap, a path that was never wired.
**Confirm this by reading both paths before changing anything** — this program has a history of
theorising a cause and being wrong.

There are roughly 11 owned-menu construction sites and 14 `showAt` calls. Three derive their point
from an anchor element's rect (`column-menu.ts:212-214`, `row-menu.ts:164-166`,
`embedded-database-renderer.ts:2408-2410`); the rest use the cursor. A design that only serves one
of those two shapes will leave half the menus wrong.

## 2b. THE SECOND HALF — sheet rows are not one component

`device-more-tools-sheet.png` is a menu that *has* reached sheet presentation, and it is aligned
differently from every other menu in the plugin. Its rows are centred, so their left edges are
ragged — "Display width" carries no icon and floats, while "Refresh database", "Export to clipboard"
and "View settings" each start at a different x. `device-column-menu.png` next to it is left-aligned
with a consistent icon column, which is the correct treatment.

The operator's words: *"Buttons of this sheet don't align with other sheets, we should make it more
consistent, better aligned, proper reusable sheet menu item components. Similar as seen in table
column header dropdown."*

So the phase has two halves and the second is the more valuable one: **there is no shared sheet menu
row.** Each surface builds its own, and they disagree. `menu-row.ts` already exists and is the row
component for owned menus — establish whether these sheets use it, and if not, what they use instead
and why. A menu presented as a sheet should be the same rows in a different container, not a
different component.

Inventory every surface that renders a menu-like row inside a sheet before designing the shared one;
this program has been bitten repeatedly by fixing the instance in front of it and missing the family.

## 3. WHAT GOOD LOOKS LIKE

On a phone an owned menu should present the way the record sheet does: docked to the bottom of the
screen, full width, above the navigation bar, with a grab handle, dismissible by the scrim and by
dragging the handle down. Desktop is unchanged.

Rows are already 44px on a phone and the heading already takes the row inset — see the phone arms
near `styles.css:337-346`. Check what else the sheet presentation needs that the menu does not have.
<!-- /ANCHOR:problem -->

<!-- ANCHOR:scope -->
## 4. CONSTRAINTS

- **Do not regress the record sheet.** `verify-placement` asserts it reaches the viewport floor and
  covers the navigation bar; both stay green.
- **Desktop menus must not move.** They are a separate, working presentation.
- A menu that becomes a sheet still has to dismiss correctly — the owned menu owns its own outside
  pointerdown and Escape handling (`owned-menu.ts:70-109`), and the sheet has a scrim of its own.
  Two dismissal owners on one surface is a defect, not a detail.
- A tall menu that becomes a sheet needs to scroll inside the sheet rather than grow past it.
<!-- /ANCHOR:scope -->

<!-- ANCHOR:success-criteria -->
## 5. ACCEPTANCE CRITERIA

Written by the phase. Each needs a number with a threshold shown failing first, a check that drives
the production path, and an image a person opened. See [`acceptance-criteria.md`](acceptance-criteria.md).
<!-- /ANCHOR:success-criteria -->
