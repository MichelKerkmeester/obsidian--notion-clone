---
title: "Implementation Plan: Sheet Menu Grammar and Motion"
description: "A record of the approach taken: close the harness blind spot that let a shared row centre on a device, then let the corrected checks justify five stylesheet and script mechanisms."
trigger_phrases:
  - "027 sheet menu grammar plan"
  - "sheet row grammar implementation plan"
  - "sheet entrance motion plan"
importance_tier: "critical"
contextType: "planning"
---
# Implementation Plan: Sheet Menu Grammar and Motion

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

**This plan is a record of the approach that was taken, not a forecast.** The phase has shipped in
the working tree; this document was authored after the fact from `spec.md`, `goal.md`,
`acceptance-criteria.md` and `implementation-summary.md`, which carry the primary evidence.

The row grammar was already shared — `createMenuRow` builds every menu row and has since phase 011 —
but it was not shared down to its last property. Obsidian's own `button { justify-content: center }`
applied uncontested wherever the plugin's row rule left that property undeclared, and the harness
could not see it because `verify-placement.mjs` loaded `styles.css` alone. The governing move was to
close that harness blind spot first, then let the corrected checks justify each of the five
stylesheet and script mechanisms below.

<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

Results are the values `implementation-summary.md` §2 records at ship.

| Gate | Command | Pass condition | Result |
|---|---|---|---|
| Types | `npx tsc --noEmit` | exit 0 | exit 0 |
| Unit | `npx vitest run` | exit 0, no reduction | **444 passed** (unchanged) |
| Placement | `npm run storybook:placement` | no unexplained red | **202/206**, 4 red for a declared reason (baseline 186/190, same 4) |
| Captures | `npm run screenshots:verify` | current, none blank, none theme-identical | **228 entries**, none blank or theme-identical (baseline 224) |
| Evidence | `node tools/live/evidence.mjs --check-all` | every artefact describes this tree | **8 of 8** |
| Gate | `npm run gate` | exit 0 | **13 of 14 green** — the red is `comments`, owned by another agent's untracked `tools/bench/` files this phase did not touch |

<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

Five mechanisms and one harness repair, governed by `goal.md`'s five decisions (D1-D5).

**D1 — the harness must load what the host declares.** `verify-placement.mjs` now loads Obsidian's
`button` rule, copied verbatim from `app.css`, on all 17 of its pages. Without it, an undeclared
`justify-content` computes to `flex-start` in the harness and to `center` on a device, which is why
five checks written by earlier phases had been green while the device was wrong (`spec.md` §1).

**D2 — alignment is a count, not an opinion.** The number of distinct label x-positions in one sheet
is the invariant, and the only passing value is 1. Fixed with one declaration:
`justify-content: flex-start` on `.db-menu-item.db-menu-item` (`spec.md` §3.1).

**D3 — the trailing chevron belongs to the component.** A row keyed to `submenu: true` carries the
chevron and `aria-haspopup`; a row that acts carries neither. This already held going in and is
asserted rather than changed (`acceptance-criteria.md` AC-7).

**D4 — drag-to-dismiss belongs to the sheet presentation.** `attachSheetDragToDismiss` had exactly
two callers before this phase; `positionToolbarPopover` was not one of them. Wired once in the
positioner through the overlay stack rather than at each of the 33 call sites it serves
(`spec.md` §3.3).

**D5 — the sheet entrance is a transition, never a CSS animation.** Both call sites had been adding a
start class and an end class inside one `requestAnimationFrame`, which fires before that frame's
style recalculation — one resolution, already at the end state, nothing to interpolate
(`spec.md` §3.4). `playSheetEntrance` commits the start state by reading a layout property, then
flips synchronously, so a transition has two resolutions to interpolate between. An animation was
rejected because the drag gesture writes an inline transform that outranks a class but not a running
animation.

**Sixth, unkeyed to a decision:** `overflow-x` was `auto` because declaring only `overflow-y` couples
the other axis to it per the overflow spec; pinned to `hidden` (`spec.md` §3.5).

<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

The order below is the order `spec.md` and `implementation-summary.md` document.

### Phase 1 — Close the harness blind spot

Add `HOST_BARE_CONTROLS` — Obsidian's `button` rule, verbatim — to all 17 `verify-placement.mjs`
pages, before trusting any alignment number the harness reports.

### Phase 2 — The row grammar

State `justify-content: flex-start` on `.db-menu-item.db-menu-item`, switch `gap` to the
`--db-menu-row-gap` token, and add the `::after` hairline gated on `:has(+ .db-menu-item)`, with
`--db-menu-divider-inset` overridden for rows that carry a check slot.

### Phase 3 — The submenu layer

Give the sheet presentation a doubled-class `z-index` rule
(`.db-mobile-bottom-sheet.db-mobile-bottom-sheet`) so it outranks the two later same-`!important`
rules on specificity rather than on source position.

### Phase 4 — The sheet drag

Wire `attachSheetDragToDismiss` in `popover-position.ts` on every sheet-branch surface, last-wins per
panel through a module-level `WeakMap` of disposers, closing through
`overlayStack.dismissPanel(panel)` — the same close the backdrop and Escape already run through.

### Phase 5 — The entrance

Add `--db-sheet-enter: 260ms` and rewrite `.db-mobile-bottom-sheet.db-overlay-enter` to the
full-height untransitioned start state, moving the transition onto `.is-visible` — the state being
moved to. Add the `db-mobile-sheet-scrim` keyframe entrance and its reduced-motion `animation: none`
override. Land `playSheetEntrance(panel)` in `mobile-bottom-sheet.ts` and call it from
`owned-menu.ts` and the sheet branch of `popover-position.ts`, replacing the frame-scheduled flip.

### Phase 6 — Overflow

Declare `overflow-x: hidden !important` on `.db-mobile-bottom-sheet`.

### Phase 7 — Harness and fixture coverage

Add the row-grammar and entrance checks to `verify-placement.mjs` (16 checks across two new pages),
add `ColumnMenu` to the bundle's exports, fix two pages missing `reducedMotion: "reduce"`, and add
the `chrome-owned-menu-sheet` screenshot scenario.

<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|---|---|---|
| Negative control | Each of the 16 new checks confirmed red against the reverted code; that same revert also turned 5 pre-existing alignment checks red | `verify-placement.mjs`, reverted then re-run |
| Browser measurement | AC-1 through AC-16, driven through the shipped `ColumnMenu` and `ToolbarRenderer.showAddViewMenu` in a real browser against shipped `styles.css` plus Obsidian's own `button` rule | `npm run storybook:placement` |
| Regression | Full suite unchanged | `npx vitest run`, `npx tsc --noEmit` |
| Capture | Sheet scenario rendered and inspected | `npm run screenshots:verify`, manual inspection of `chrome-owned-menu-sheet` and the record-detail sheet |
| Not yet run | Operator confirmation on a phone | outstanding — `goal.md` completion criteria, last item |

`acceptance-criteria.md` states the method precisely: none of the sixteen numbers is measured off a
screenshot fixture, because a fixture renders hand-written markup and imports nothing from `src/`, so
a fixture that fakes a menu proves nothing about the menu.

<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|---|---|---|---|
| The css lane | Internal | Acquired `2026-08-30T15:21:50.568Z`, released `2026-08-30T15:47:23.920Z` (`tools/lane/css-lane.json`) | No stylesheet edit could proceed |
| `createMenuRow` (phase 011) | Internal | Already shared across every door into a sheet | The row grammar fix would have needed a second component instead of one declaration |
| The Add-view sheet rows (phase 013) | Internal | Already converted to `createMenuRow` | Report 2's create rows would not have inherited the fix |
| `tools/bench/run-board.mjs`, `run-gallery.mjs` | External, another agent | Untracked, created 17:38 during this work | Sole cause of the gate's one red; not this phase's to edit |

<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: not documented in this folder's evidence.
- **Procedure**: `tools/lane/css-lane.json` records the pre-phase hash as `e92c9f98803f` and the
  post-phase hash as `0fe11f17f45a`. Reverting the stylesheet to the former hash and reverting
  `mobile-bottom-sheet.ts`, `owned-menu.ts`, `popover-position.ts`,
  `tools/storybook/verify-placement.mjs` and `tools/screenshots/scenarios/chrome.mjs` to their
  pre-phase state (`implementation-summary.md` §1) reverts the phase. Nothing was committed, so a
  working-tree revert is sufficient — there is no commit to revert.
- **Data reversal**: none — no data migration is involved.

<!-- /ANCHOR:rollback -->
