---
title: "Architecture Findings: Why 1.3.1 Shipped Real Code and Changed Nothing"
description: "Measured root causes behind the surface, sheet, checkbox and row defects, and the harness blindnesses that let them pass every gate."
trigger_phrases:
  - "surface architecture findings"
  - "why 1.3.1 changed nothing"
  - "token root mount point"
importance_tier: "high"
contextType: "research"
---
# Architecture Findings: Why 1.3.1 Shipped Real Code and Changed Nothing

> Every number here was measured — headless Chrome against the shipped `styles.css`, and the
> shipped positioner bundled from source. Where a claim is inference it says so.
> Child specs cite this file rather than restating it.

---

## 1. THE FAILURE

Release 1.3.1 fixed dropdowns, sheets, checkboxes and table performance. Every gate passed: tsc,
build, 410 unit tests, 196 screenshot captures, a Storybook catalogue, 13 geometry checks. The
operator installed it and reported that essentially nothing had changed. The installed bundle was
confirmed to contain the new code, so the work was real and the outcomes were still wrong.

The gates measured the mechanisms that changed, not the results anyone sees.

---

## 2. ROOT CAUSE — TOKENS DO NOT REACH THE SURFACES

Design tokens are declared once, at `styles.css:32`, on a fixed list of nine selectors.
`.db-owned-menu` is not among them, and `createOwnedMenu` mounts on `document.body`
(`src/views/owned-menu.ts:56`).

| Measured | On `document.body` (production) | Inside `.note-database-container` (every harness) |
|---|---|---|
| `--db-radius-lg` | *empty* | `8px` |
| `.db-owned-menu` border-radius | **0px** | 8px |
| `.db-menu-item` border-radius | **0px** | 4px |
| `.db-menu-item` font-size | **14px** | 13px |

Across 29 probed overlay classes: **29/29 compute differently between the two mount points, and
25/29 have no tokens at all on body.** Every plugin-owned menu ships square-cornered and one size
too large.

**A surface's appearance is currently decided by four uncoordinated things:** the class string the
call site typed, where it was mounted, which of the duplicate CSS blocks came last, and whether the
positioner overwrote the stylesheet with inline styles.

---

## 3. THE HARNESSES CANNOT SEE IT

- **Storybook wraps every story in `.note-database-container`** (`.storybook/preview.ts`), the exact
  wrapper that supplies the tokens. The catalogue is structurally incapable of showing this defect.
- **The screenshot fixtures do the same.**
- **`tools/screenshots/runtime-vars.css` hardcodes `--db-mobile-sheet-bottom: 0px`** — pinning the
  single value the sheet defect lives in to its correct answer.
- **No harness contains a `.mobile-navbar`.** Running the shipped `getVisiblePopoverBounds`: with a
  navbar the sheet bottom offset is 49px, without it 50.35px, because `popover-position.ts:291`
  falls back to a hardcoded 50. Harness and device agree, and both are wrong.
- **The desktop geometry checks never load `styles.css`**, so the cascade where the bug lives is
  excluded. The phone checks call only `applySheetChrome`, never the positioner, so the offset math
  is never exercised. Nothing drives a click, drag or commit.

---

## 4. THE STYLESHEET REVERSES ITSELF

**87 selectors are declared more than once; 124 property values are overridden by a later duplicate
block.** Examples: `.db-toolbar-right` `justify-content: flex-end → flex-start`;
`.note-database-container` `padding: <tokens> → 0 12px 24px`; `.db-active-view-controls-scroll`
`mask-image: <gradient> → none`.

**The Properties panel falls straight out of this.** `styles.css:2036` hides
`.db-mobile-reorder-controls`; `styles.css:18776` — same selector, later — sets
`display: inline-flex`. Mobile-only arrows therefore render on desktop, giving the row 8 children
against 7 declared grid tracks. Measured: **row height 52px against a declared `min-height: 30px`,
with the trash button wrapped onto an implicit second row.** On phone, two `.is-phone
.db-column-manager-row` rules fight (`16879` vs `16995`); the later wins with a different track
order, so the checkbox gets a 96px track and the property name gets **22px**.

---

## 5. THE NAVBAR NEEDS A PORTAL, NOT A Z-INDEX

Hit test: a sheet inside `.note-database-container` at `z-index: 9999` —
`elementFromPoint` over the navbar returns `DIV.mobile-navbar`. The same node cloned to
`document.body` returns the sheet.

Portalling strips the tokens, which is why the sheet work is hard-coupled to the token root.

---

## 6. THE SHEET GLITCH, TRACED

`updateCellDOM` (`src/views/database-view.ts:8597-8619`) has surgical cases only for table, board,
gallery and list. Calendar and timeline — the only two views that can have the record-detail sheet
open — fall through to `default: this.refresh()` (`:8615-8616`), which rebuilds the view wholesale. The panel node
survives; **the `anchorEl` does not.** From the first field commit onward `anchorEl.isConnected` is
false, so `place()` (`popover-position.ts:100`) no-ops permanently — the sheet stops repositioning,
including for the keyboard on the next field.

---

## 7. INVENTORY, CORRECTED

Careful audits supersede raw greps.

| Surface | Measured |
|---|---|
| `positionToolbarPopover` call sites | **33** — 15 compact preset, 3 pass nothing (raw 520px: Filter, Sort, Column Manager), 15 bespoke numbers |
| Production owned menus | **11** |
| Native `new Menu(` remaining | **0** (the "26 `.dom` accesses" note in `owned-menu.ts` is stale) |
| Distinct popover classes | ~50 |
| Checkbox families owned by the plugin | **1 of 12**. All four selectors that declare `appearance: none` on a plugin checkbox are **ancestor-scoped** (`styles.css:5428`, `:6628`, `:8252`, `:11039`) — including `db-modal-checkbox`, which sits on the input but is still reached via `.note-database-modal` |
| `db-list-row-checkbox` | exists in source (`list-renderer.ts:271`), **has no CSS rule anywhere** |
| Classless checkbox inputs | **10**, not 4. Five are unstyled; **five others work only because the call site adds a class to their parent one line before creating them** (`table-renderer.ts:514`, `:785`; `cell-renderer.ts:489`; `card-field-renderer.ts:184`; `record-detail-panel.ts:339`). That second group is the dangerous population: it passes every check today and is one wrapper change from breaking |

**Four findings that change the plan:**

- **`db-anchored-popover`**, the class every `positionToolbarPopover` call adds, **has no CSS rule
  anywhere.** A dead marker.
- **`createMenuRow` is called from exactly one place** (`owned-menu.ts:109`). `toolbar-renderer.ts`
  alone hand-rolls 9 row builders, two of them near line-for-line duplicates. **12–14 distinct
  hand-rolled row grammars are alive against one canonical** — worse than when the shared row was
  written.
- **`submenu: true` is decorative.** It draws a chevron and sets ARIA; the handle has no way to
  open a nested menu. Its only production caller opens real submenus through a separate hand-built
  body-mounted popover.
- **There is no sheet scrim at all.** `applySheetChrome` handles only the sheet class and the grab
  handle; the plugin's sole backdrop anywhere is `db-mobile-column-width-backdrop`
  (`database-view.ts:10983`), for the column-width drag. A scrim is new construction, not a fix.
- **`getVisiblePopoverBounds` is shared by every anchored popover, not only sheets.** Deleting its
  `is-phone` branch moves non-sheet popovers on a phone too, so that blast radius must be measured
  before the deletion rather than discovered after it.
- **Two independently-thresholded phone predicates.** `isTouchDevice()` drives `DbModal` sheets;
  `isMobileBottomSheet()` drives positioner sheets. They disagree. `--db-mobile-sheet-bottom` is
  never set by `DbModal`, so modal sheets always get 0px while anchored sheets get the navbar
  offset: one visual affordance, two mechanisms, two behaviours.

---

## 8. THE DECISION EVERY SPEC INHERITS

**One `openSurface()` factory, the only way to create a floating surface.** It owns the mount
point, stamps a `db-surface` class and `data-db-surface="<role>"`, registers with the existing
overlay stack, and applies placement. Every visual rule keys off `[data-db-surface]`, never off
ancestry. `.db-surface` joins the token-root list at `styles.css:32` — one line, no leakage into
the host app.

**Why not the alternatives.** *By parent component* is today's behaviour and the documented trap:
a row does not lay itself out, `display: flex` lives on `.db-owned-menu`. It is the cause, not the
cure, and it cannot survive the portal the sheet work requires. `db-sort-panel` is the cautionary
tale — it has zero standalone CSS and works only because it is dual-classed with `db-filter-panel`,
and the phone max-height clamp list omits it, so deleting the "redundant" class would silently
break Sort's mobile height with no compiler warning. *By declared intent alone* fixes naming but
not the token root, the mount point, or the two competing placement authorities.

The same shape applies to checkboxes — `createCheckbox(parent, { role })` with **unconditional**
base appearance, the role choosing size only, never keyed to an ancestor — and to sheets, where
presentation is resolved once at open from one predicate.

---

## 9. HOW CRITERIA MUST BE WRITTEN

A criterion is invalid unless it meets all four:

1. **Measured on the real renderer at the production mount point** — not a fixture, not inside a
   helpful wrapper.
2. **A number or a hit test with a threshold.** No class names, no call counts. "The compact preset
   is used at 18 sites" is banned: it is used at 15 and the UI is still wrong.
3. **Demonstrated to fail on the current tree first**, with the failing number recorded here.
4. **The harness must be able to distinguish.** If deleting the thing under test from the harness
   DOM changes no asserted number, the check is theatre.

---

## 10. REFERENCES

AnyType and AppFlowy are cloned under `external/` (gitignored) and read for **behaviour only** —
what happens when a sheet meets a keyboard, how a property row degrades at 320px. Both are
AGPL/source-available while this plugin is MIT: **never copy code, CSS values, or token scales.**
Notion is the visual target and is not a source at all — describe what it looks like, then derive
values from our own token scale.
