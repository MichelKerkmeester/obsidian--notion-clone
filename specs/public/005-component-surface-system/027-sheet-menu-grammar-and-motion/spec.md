---
title: "Feature Specification: Sheet Menu Grammar and Motion"
description: "Six operator reports against one surface. The shared menu row reached every one of them and was still centred on a device, because it never declared the one property the host's button rule supplies."
trigger_phrases:
  - "sheet menu grammar"
  - "menu row centred on phone"
  - "change type does nothing"
  - "sheet horizontal overflow"
  - "sheet entrance motion"
  - "027 sheet menu"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/027-sheet-menu-grammar-and-motion"
    last_updated_at: "2026-08-30T18:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Shipped; gate 13 of 14 green, one red owned by another agent's files"
    next_safe_action: "Operator confirmation on a phone"
    blockers: []
    key_files:
      - "goal.md"
      - "acceptance-criteria.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-027"
      parent_session_id: null
    completion_pct: 90
    open_questions:
      - "Does the Add-view form above the create rows want the same treatment?"
    answered_questions:
      - "The shared row did reach this surface; the harness could not see what the host adds to it"
      - "The Change type submenu opens and is painted underneath its own backdrop"
      - "The sheet entrance never ran, so its values were never the reason it looked instant"
---
# Feature Specification: Sheet Menu Grammar and Motion

> Phase chain: parent [`../spec.md`](../spec.md). Extends
> [`../011-mobile-menu-presentation/spec.md`](../011-mobile-menu-presentation/spec.md), which
> introduced the shared row and measured its alignment as holding, and
> [`../013-add-view-sheet/spec.md`](../013-add-view-sheet/spec.md), which converted the Add-view
> tiles into rows. **Shipped, not committed, not operator-confirmed.**

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->

---

## EXECUTIVE SUMMARY

Six reports arrived from a phone against one family of surfaces:

1. *"sheet buttons shouldnt be centered text"*
2. *"Check online how menu sheets look and make the buttons a component reusable. Aligned left. Dividers between. More like normal sheet buttons"*
3. *"Also view sheet doesnt work you cant drag it down and has bad layout"*
4. *"Also sheet shouldnt instantly appear but smoothly and fastly move in view from bottom like you see on ios"*
5. *"Column setting sheet also bugged you cant click change type doesnt do anything"*
6. *"sheets have horizontal overflow which shouldnt happen only vertical"* / *"Sheet can reach max 90vh"*

Five of the six are one story, and the story is not about styling. It is about the difference
between a component and a component the checks can see.

---

<!-- ANCHOR:problem -->
## 1. WHY THE SHARED ROW DID NOT REACH THIS SURFACE

**It did reach it.** `ColumnMenu` builds every row through `createOwnedMenuForEvent` →
`createMenuRow`; the Add-view sheet calls `createMenuRow` directly; the column submenus hand-build
markup that carries the same `db-menu-item` class. Nothing here builds its own idiom and nothing
overrides the shared one. Phase 011 already keyed the row grammar to the row rather than to the
owned menu's shell, precisely so it would apply in any container.

What did not reach the surface was the **last property**.

`createMenuRow` renders a row as a `<button>` — a deliberate choice, so it is focusable and
keyboard-activatable without a `tabindex` and a keydown handler. Obsidian's `app.css` styles every
bare button:

```css
button {
  display: inline-flex;
  align-items: center;
  justify-content: center;   /* ← nothing in the plugin contested this */
  height: var(--input-height);
  white-space: nowrap;
  ...
}
```

The plugin's row rule is `.db-menu-item.db-menu-item`, specificity (0,2,0), against a type selector
at (0,0,1). It wins every property **both** of them name — `display`, `align-items`, `padding`,
`font-size`, `text-align`. It declared no `justify-content` at all, so there was no contest: the
host's `center` applied, and every row centred its icon-and-label group as a unit.

The two rows that held their left edge were the submenu rows. Their trailing chevron carries
`margin-left: auto`, and an auto margin absorbs all free main-axis space, which makes
`justify-content` inert on that row. That is why the defect read as *rows disagreeing with each
other* rather than as one missing declaration — and why the screenshots show `Change type…` and
`Display style` correctly aligned above fifteen centred siblings.

**And this is why every check was green.** `verify-placement.mjs` loaded `styles.css` and nothing
else. In a document with no host stylesheet an undeclared `justify-content` computes to `normal`,
which is `flex-start`, so every label already lined up. Phase 011 measured the spread go 227px → 0
and was telling the truth about the document it measured. The document was missing a declaration the
device has.

Reverting this phase's one-line fix and re-running turns **five checks written by earlier phases**
red — 011's "rows in a sheet menu share one left edge, icon or no icon" at a 13px spread, "a shared
menu row lays itself out in any sheet" at 76px, and the Add-view left-edge check on both devices.
Those had passed on every run since they were written.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 2. THE INVENTORY

Every surface below presents as a bottom sheet on a phone and draws `db-menu-item` rows, so all of
them are governed by the one row rule and all of them changed together.

| Door into the sheet | Surfaces | Rows built by |
|---|---|---|
| `createOwnedMenu(...).showAt()` — the sheet branch discards the target | 11 call sites: column menu, row menu, table, board, gallery, list, calendar, timeline, database view, embedded renderer | `createMenuRow` |
| `positionToolbarPopover(...)` — `applySheetChrome` + `placeSheet` on a phone | 33 call sites across 18 modules, including the Add-view sheet and the three column submenus | `createMenuRow` (Add-view) and hand-built `db-dropdown-option db-menu-item` (submenus, dropdown field) |

Two row *shapes* exist within that family and they are not interchangeable: an action row is
`[icon] label … [value] [chevron]`, while a checkable option row puts a check slot ahead of the icon.
Their label columns therefore sit one slot apart. Within any one list every label shares one x, which
is the invariant that matters; the divider inset is a variable so each shape's hairline lands on its
own label rather than in the middle of its icon column.
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 3. THE FIVE MECHANISMS

### 3.1 Centred rows — one undeclared property

Fixed by stating it: `justify-content: flex-start` on `.db-menu-item.db-menu-item`.

Measured on the shipped `ColumnMenu`, in a phone-shaped page carrying Obsidian's real `button` rule:
**14 distinct label x-positions across 18 rows → 1.** Add-view: **6 across 8 → 1.**

### 3.2 The dead `Change type…` submenu — a layer, not a placement

Diagnosed before it was designed, against the three shapes a non-responding row can take. It is none
of the three. The submenu **opens**, is **placed correctly**, is **full width**, is **on screen**,
and has a background and a shadow. It is painted underneath.

`.db-mobile-bottom-sheet` declares `z-index: var(--db-layer-modal, 1000) !important`. Two later
rules in the same file pin these surfaces to their resting tier, also `!important`, at equal or
greater specificity — so source order decided it:

```
.db-mobile-bottom-sheet                    → 1000 !important   (line 168)
:is(.db-dropdown-popover, …)               → 100  !important   (line 19118)   ← wins, later
.db-column-menu-subpopover                 → 110  !important   (line 19125)   ← wins, later
```

Measured: submenu **110**, backdrop **999**, parent sheet **1000**. A screenshot of the harness
after a synthetic tap is indistinguishable from one taken before it.

Fixed by giving the sheet presentation a doubled-class rule, so it outranks those two on specificity
rather than on position. Every dropdown-family surface presented as a sheet was in the same
condition, not just the column submenu.

### 3.3 The Add-view sheet's drag — chrome with nothing behind it

Not the two-owners shape phase 016 found in the record sheet. Simpler: `attachSheetDragToDismiss`
has exactly two callers, `owned-menu.ts` and `record-detail-panel.ts`. `positionToolbarPopover`
calls `applySheetChrome`, which draws a grab bar on **every** surface it presents as a sheet, and
wired a gesture to none of them.

Fixed in the positioner rather than at 33 call sites: the overlay stack already knows who owns each
panel's dismissal, because they all register with it, so the gesture asks it to dismiss this panel —
the same close the backdrop and Escape already run through. A surface that never registered springs
back instead of being left parked below the screen. Attachment is now last-wins per panel, so the
record sheet's own more-than-dismissal close still replaces the generic one.

### 3.4 Motion — the entrance never ran

The values were never the reason. Sampled across the whole window, the sheet sat at identity from
12ms onward and **no animation object ever existed**. Both call sites added `db-overlay-enter` and
then added `is-visible` inside a single `requestAnimationFrame`. A rAF callback fires *before* that
frame's style recalculation, so the element's first-ever style resolution already carried the end
state. A transition needs two different computed values across two resolutions.

`playSheetEntrance` commits the start state by reading a layout property, then flips synchronously.
A second animation frame would also work and is the more familiar idiom, but it postpones the sheet
by a frame — and the drag binds on the same surface, so a frame spent waiting is a frame in which a
thumb already on the glass is ignored.

**The values, and where they came from.** `sk-design`'s motion scale, resolved in
`references/motion-principles.md` §5: direct feedback 120–180ms, state change 180–260ms, layout
transition up to 500ms *"and only when it is not blocking the next input"*.

- **260ms**, the top of the state-change band and under the 300ms ceiling for anything the user
  initiated. 180ms was rejected because a full-height travel there reads as a cut rather than a rise;
  the 500ms drawer allowance was rejected on its own condition, since the drag gesture binds on this
  surface and a longer entrance is time the thumb spends waiting. Declared once as
  `--db-sheet-enter` and shared with the backdrop, so "similar elements share values" holds.
- **`ease-out`** — the scale's entrance easing.
- **`translate3d(0, 100%, 0)` → `0`, transform only.** The 8px it inherited is below the distance at
  which travel reads as travel. The `scale(0.98)` is measured from the element's centre, so it lifts
  the bottom edge off the floor the sheet is docked to. The opacity fade has nothing to fade in from
  when the surface starts below the viewport.
- The backdrop fades over the same token, through a keyframe animation because it is created and
  appended in one step with nothing to toggle against.

Two constraints held. Reduced motion lands the sheet at rest and stops the backdrop animation —
which needed naming separately, because an animation ignores a transition reset. And the entrance is
a **transition**, never an animation: the drag writes an inline transform, which outranks a class but
not a running animation, so an animation would have swallowed the first touch. Measured: a 30px drag
begun mid-entrance puts the sheet at exactly 30px, the finger's own offset.

### 3.5 Overflow, and the height that was already right

`placeSheet` writes `overflow-y: auto` and says nothing about x. Per the overflow spec the two axes
are coupled: when one is `visible` and the other is not, the `visible` one computes to `auto`. So the
sheet had a horizontal scroll axis nobody asked for. Measured `overflow-x: auto`; now `hidden`,
declared on the class so it holds without the inline write.

**This is days old, not long-standing.** Those `overflow-y` and `overscroll-behavior` declarations
were written in camelCase, and `setCssProps` calls `setProperty()`, which takes hyphenated names
only — so they never reached a device until a fix earlier today hyphenated 23 such keys. The sheet
has only just begun scrolling as designed, and the horizontal axis arrived with it.

**The 90vh half was already correct** and is now asserted rather than assumed: 760px of an 844px
viewport, with content scrolling inside. The two sources agree in outcome but not in mechanism — the
stylesheet's `!important` `calc(90svh - var(--db-mobile-sheet-bottom))` outranks `placeSheet`'s
inline arithmetic, which is dead. That inversion is already documented at the function and is left
alone.
<!-- /ANCHOR:requirements -->

---

## 4. THE HARNESS

The permanent change is that `verify-placement.mjs` now loads Obsidian's `button` rule, copied
verbatim from `app.css`, on all 17 of its pages — the same way the workspace leaf's `contain: strict`
is already reproduced there. A harness that omits what the app declares certifies a rendering nobody
ships, and the gap is silent until something models it.

Sixteen checks were added across two new pages: a row-grammar page under the host rule, and the one
page in the file that lets motion run. Two pages were found to be missing `reducedMotion: "reduce"`;
both now have it, which mattered only once the entrance started running and a rectangle read 200ms
in became an animation frame.

**What the screenshot fixtures prove here is bounded.** A new `chrome-owned-menu-sheet` scenario
documents the sheet row grammar against the shipped stylesheet, and that is all it does — it renders
hand-written markup and imports nothing from `src/`. The alignment and divider claims are measured in
`verify-placement` against the real menu.

---

## 5. WHAT WAS LEFT ALONE, AND WHY

| Left alone | Reason |
|---|---|
| The desktop popover entrance | Same never-runs defect, same two lines. A surface nobody reported starting to animate for the first time is a change that should be deliberate and visible, not a side effect of a phone fix |
| `placeSheet`'s dead inline `max-height` | The stylesheet's `!important` outranks it and delivers the keyboard-aware cap correctly. Removing the inline write is a clarity change with no behaviour behind it |
| `setSheetMount`'s early return for body-created panels | It skips `db-surface` and `note-database-container`. Latent — the affected surfaces get their tokens from another selector — and adding a container class to a portalled node has a wide blast radius |
| The Add-view form above the create rows | The rows were the reported offence and they are fixed. Restyling the fields, captions and checkbox is a redesign wider than the named surface |
| `tools/bench/run-board.mjs`, `run-gallery.mjs` | Untracked files another agent created at 17:38 while this work was in flight. They are the sole cause of the gate's one red, and they are not this phase's to edit |
| `engine-parity` | Red before and after, identically: 56 fixtures, 50 differences, byte-identical totals against `HEAD`. Not in the gate |
