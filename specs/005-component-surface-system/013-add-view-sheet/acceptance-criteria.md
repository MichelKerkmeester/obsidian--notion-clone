---
title: "Acceptance Criteria: Add View Surface Redesign"
description: "Eight numbered criteria for the Add View surface, each with a threshold, a before-number measured on today's tree through the production path, and the negative control that proves the check can fail."
trigger_phrases:
  - "add view acceptance criteria"
  - "013 acceptance"
  - "add view thresholds"
importance_tier: "critical"
contextType: "planning"
---
# Acceptance Criteria: Add View Surface Redesign

> Every number below was measured before any code changed, by opening the **production**
> `ToolbarRenderer.showAddViewMenu` in a browser against the shipped `styles.css`. None of them comes
> from the screenshot fixture, because the fixture is hand-written markup that imports nothing from
> `src/` and diverges from production in four places (§3).

---

## 1. WHAT THE PRODUCTION PATH IS

`src/views/toolbar-renderer.ts:1251` `showAddViewMenu()` builds the panel and hands it to
`positionToolbarPopover(panel, anchorEl, COMPACT_MENU_POPOVER)` at `:1334`. That call is the
placement path, and it is the only one: `applySheetChrome` is reached *through* it
(`popover-position.ts:108`), never directly by this surface.

So a check earns its result only if it drives `showAddViewMenu`. Every criterion below does, through
`tools/storybook/verify-placement.mjs`, which bundles the real module with esbuild rather than
reimplementing it.

---

## 2. THE SIX REPORTED DEFECTS, ADJUDICATED

Measured on today's tree, desktop 1440x900 and phone 390x844, before any change.

| # | Reported | Verdict | The measurement that decided it |
|---|---|---|---|
| 1 | "Duplicate current view" appears twice | **REAL** | 2 elements own that exact text, both viewports. They do different things (§4, AC-1) |
| 2 | Unlabelled `Cost` dropdown | **HALF REAL** | Accessible name **is** present in production: `aria-label="Title property"`. Visible label absent. The WCAG 4.1.2 half is a fixture artifact; the 3.3.2 half is real |
| 3 | Six control idioms | **REAL** | 6 distinct boxes; 5 distinct type sizes in one 292px surface (11/12/13/13/14px) |
| 4 | Two rules under each icon read as skeleton | **REAL** | `border-block: 2px solid currentColor` on a 42x18 empty span, `styles.css:19433`, at 1.54:1 (light) |
| 5 | No grouping | **REAL** | 0 sections, 0 separators, 0 fieldsets; between-group gap 0px vs within-group gap 4px |
| 6 | Popover on a phone, not a sheet | **FIXTURE ARTIFACT** | Production on a phone: sheet class present, `bottom: 0px`, scrim present, grab handle present, width 390 = full, rect bottom 844 = viewport floor |

**A seventh, not reported, found by measuring:** production renders **7** view-type tiles; the
fixture renders **4**. Every committed capture of this surface understates it by three tiles.

---

## 3. WHERE THE FIXTURE DIVERGES FROM PRODUCTION

`tools/screenshots/scenarios/core.mjs:104-146`. Recorded because the divergence is what made two of
the six reports wrong, and because AC-8 freezes it.

| Fixture | Production | Consequence |
|---|---|---|
| 4 tiles | 7 tiles (`getViewTypeOptions()`, 7 entries) | Capture is 3 tiles shorter than the real surface |
| No `aria-label` on the select or the two inputs | All three carry one | Fixture invents a WCAG 4.1.2 failure that does not ship |
| `db-add-view-preview` with no `is-*` modifier | `is-table` … `is-timeline` emitted | Hid that the modifier is matched by **no CSS rule** |
| `captureCss` forces `position: static !important` | `position: fixed`, placed | **No capture of this scenario can ever show sheet presentation.** Defect 6 was read off an image structurally incapable of showing the answer |

---

## 4. THE CRITERIA

Threshold, then the before-number, then the check. A criterion is met only when its check runs inside
`SURFACE_PHASE=013-add-view-sheet npm run gate` and that gate exits 0 — read from `$?` of the gate
itself, never through a pipe.

### AC-1 — One affordance per action, or two names for two actions

**Threshold:** no two controls in the surface carry the same accessible name.
**Before:** 2 controls named `Duplicate current view` — the checkbox at `toolbar-renderer.ts:1290-1292`
and the row at `:1323-1328`.

They are not redundant, which is what decides the fix. `database-view.ts:3230-3231` shows
`duplicateCurrent` spreads `...sourceView` — filters, sorts, column order, source folder — into the
new view. So:

- the **checkbox** means *start the new view from the current view's settings*, and the new view's
  type is whichever row the user then picks;
- the **row** means *make a copy of the current view*, same type, one tap.

Neither is removed. The checkbox is renamed to what it does. Deleting either would delete behaviour,
and renaming is the smaller change that removes the ambiguity.

**Check:** `verify-placement`, accessible-name collision count over every control in the panel.
**Negative control:** delete one of the two nodes in the harness and the count must read 1, not 2.

### AC-2 — Every control has a visible label, not only an accessible one

**Threshold:** every `input`, `select` and checkbox in the surface is associated with a visible
`<label>` (via `for`/`id` or by wrapping), and the label's text is non-empty.
**Before:** 0 of 3. The select shows `Cost` and is named `Title property` to a screen reader — nothing
on screen tells a sighted user what the control is. The two text inputs are labelled by placeholder
only, which disappears the moment the user types.

WCAG 3.3.2. This is the half of report #2 that is real.

**Check:** `verify-placement`, per-control label resolution measured in the DOM.
**Negative control:** strip the `for` attribute in the harness; the count must drop.

### AC-3 — One row grammar, not a seventh idiom

**Threshold:** every action row in the surface computes the same box as a `createMenuRow` row built in
an owned menu: same `min-height`, same padding, same font-size.
**Before:** the duplicate row measures **36px tall, padding 6px/12px, min-height 36px**; a
`createMenuRow` row measures **30px tall, padding 0/8px, min-height 30px**. Same `db-menu-item`
class, different box — because `styles.css:19460` lists `.db-add-view-duplicate-action` in the
legacy `db-toolbar-menu-row` family, which has equal specificity to `.db-menu-item.db-menu-item` and
sits 19,000 lines later, so source order decides.

**Check:** `verify-placement`, box comparison against a live `createMenuRow` row in the same document.
**Negative control:** the comparison row is built by the shipped `createMenuRow`, so if the grammar
itself regresses both sides move together and the check reports the shared value — the assertion is
on the *difference*, and a second assertion pins the absolute value so a shared regression cannot
hide.

### AC-4 — Nothing in the surface reads as a loading skeleton

**Threshold:** 0 elements whose only content is horizontal rules.
**Before:** 7 `db-add-view-preview-lines` spans, each an empty 42x18 box with
`border-block: 2px solid currentColor` at `opacity: .35` — 1.54:1 against its own backing in light,
2.03:1 in dark. Identical for all seven types, so it distinguishes nothing.

The `is-table` … `is-timeline` modifier the renderer emits alongside it is matched by no rule
anywhere in `styles.css` — a class in source that nothing styles, which `design-system.md` §10 names
as an anti-pattern. It goes with the span.

**Check:** `verify-placement` element count; plus a stylesheet assertion that the rule is gone.
**Negative control:** null the rule with an injected `!important` and the border reading must move
2px -> 0px, which it does.

### AC-5 — More space between groups than inside them

**Threshold:** between-group gap >= 2x the within-group gap, and both on the `--db-space-*` scale.
**Before:** within-group 4px, between-group **0px**. The groups are closer together than the items
inside them, which is the mechanical cause of report #5 and a direct violation of the always-rule in
`sk-design` SKILL.md §4.

**Check:** `verify-placement`, measured rectangle gaps, not declared values.
**Negative control:** the check reads `getBoundingClientRect` deltas, so a declared-but-overridden
value cannot satisfy it.

### AC-6 — The groups are named

**Threshold:** >= 2 group headings, each carrying **non-empty text**, and each being the element that
produces AC-5's between-group gap — deleting one must collapse that gap to the within-group value.
The heading uses `db-menu-section`, the vocabulary the owned menu already uses.
**Before:** 0 sections, 0 separators, 0 fieldsets.

**Why the threshold is not the element count.** An element count over a class name is satisfiable by
two empty divs, and this program bans class-name criteria for exactly that reason — every 1.3.1
criterion had that shape and every one passed. Counting headings that carry text and that are
load-bearing for a gap AC-5 already measures makes the criterion fail when the grouping stops
working, rather than when the markup stops being spelled a particular way.

**Check:** `verify-placement` element count, plus each heading's text length and the rectangle gap
either side of it.

**Negative control.** Not yet run. Emptying one heading's text, and separately removing one heading,
must each take this check red — the first on the text clause, the second on AC-5's gap.

### AC-7 — Phone presentation does not regress

**Threshold:** on a 390x844 phone the surface is still a sheet: sheet class present, computed
`bottom: 0px`, rect bottom within 1px of the viewport floor, full width, scrim present, grab handle
present and its hit band >= 48px.
**Before:** all of these already pass. This criterion exists **because** report #6 was wrong: the
thing most at risk is breaking something that already works while fixing the five that do not.

**Check:** `verify-placement` phone page, driven through `positionToolbarPopover`.
**Negative control:** the desktop page runs the same assertions inverted and must report *not* a
sheet, so a change that made everything a sheet fails on the desktop side.

### AC-9 — One left edge — added during implementation

Not planned. The first rebuilt capture showed the group heading, the field captions and the action
rows on three different edges, and on a phone they diverged further rather than moving together.

**Threshold:** the group heading, field caption, checkbox caption and row icon share one **content**
left edge — measured at the content edge, since a padded block starts its text a padding in from its
border and comparing that against an unpadded label reports a misalignment that is not there.
**Before:** 3 distinct edges — 9 / 15 / 21 desktop, 9 / 15 / 29 phone.

### AC-10 — A resting row paints no fill — added during implementation

Also not planned, and the reason AC-9 was noticed. A `db-menu-item` is a `<button>`, and host
stylesheets fill every bare button. The transparent-background reset was keyed to
`.db-owned-menu .db-menu-item`, so this surface — the first to build rows outside an owned menu —
got that fill as a visible band.

**Threshold:** a resting row's computed background is transparent.
**Before:** rgb(242,243,245) against a rgb(242,242,242) panel.

The fix re-keys the reset to `.db-menu-item.db-menu-item`, the same move already made for
`display: flex`. Same selector weight, same computed value inside an owned menu — **verified by
recapture**: no owned-menu, menu or panel image moved.

### AC-8 — The fixture stops lying

**Threshold:** the committed screenshot fixture emits the same tile/row count, the same accessible
names and the same class list as production, asserted by a test that reads both.
**Before:** 4 divergences (§3).

The `captureCss` position override stays — without it the popover leaves the flow and the capture box
collapses — but it is now recorded as the reason no capture can answer a placement question, so the
next reader does not repeat the mistake.

**Check:** `src/views/add-view-popover-layout.test.ts`, reading `core.mjs` and `toolbar-renderer.ts`.

---

## 4b. THE FIVE STATEFUL DIMENSIONS — 2026-09-01

| Dimension | Where this packet answers it | Evidence |
|---|---|---|
| **Semantic identity** | The row pressed is the type asked for | Six type rows driven, each asking for its own type; the duplicate row asks for the *current* type and carries `duplicateCurrent` |
| **Transition trace** | Open → press → close, once per row | Pressing a row closes the popover, so each of the seven presses runs on a freshly opened menu. A single open cannot reach the second row at all |
| **Action outcome** | *new here* — what `addView` was handed, not that it was called | `Table view → table; Board view → board; List view → list; Chart view → chart; Calendar view → calendar; Timeline view → timeline`, plus the form's name on each. Red with the type pinned: `1 distinct type(s) from 6 type row(s)`. Red with the name dropped: `(none)` six times |
| **Resource ownership** | The popover's positioner subscription, shared with every panel | Covered by `005`'s measurement of the same positioner: ten renders add ten and release nine |
| **Negative-control mutation** | The two controls above, plus this packet's existing grammar controls | Type pinned to `table`; name dropped from the options |

**Every add-view check in this repository drove the menu with a no-op `addView`.** They measured
layout, row grammar, width and placement — and not one could tell a wired row from a dead one. That
is the false-green shape `000`'s audit names by hand for `openRow` and `editCell`; this surface had
it too.

**The duplicate row is not a seventh type, and asserting that it was found a fault in the check.**
The first version required all seven rows to ask for different types and reported `6 distinct
type(s) from 7 row(s)` — because "Duplicate current view" correctly asks for the CURRENT view's
type, `table` here, the same as the Table row. **The product was right and the assertion was wrong.**
Splitting them is stronger than loosening the count: the six type rows must each ask for something
different, and the duplicate row must ask for the current type *with* `duplicateCurrent` — which is
what separates it from a type row that happens to share a name.

---

## 5. WHAT IS DELIBERATELY NOT DONE

- **The tile border cannot reach 3:1 and is not being forced to.** Measured against the panel:
  `--db-border-regular` 1.15, `--db-border-emphasis` 1.21, `--db-border-subtle` 1.08,
  `--background-secondary` 1.01 (light theme; dark is 1.12/1.19/1.06/1.13). No border or surface token
  in this system clears 3:1. Inventing one would fork the palette. It does not need to: the tiles are
  replaced by rows whose text identifies them, so no boundary is load-bearing for identification, and
  the focus ring that *is* load-bearing uses `--interactive-accent`, which measures 4.3 light / 3.36
  dark.
- **`--text-muted` at 12px measures 4.1:1 in the light capture theme, below the 4.5:1 floor for body
  text.** It is the token `.db-menu-section`, `.db-add-view-duplicate` and every muted label in the
  plugin already use. Changing it is a program-wide decision, not this phase's. **Escalated, not
  fixed** — see the findings note.
- **The two phone predicates still disagree** (`isTouchDevice` at 760px container vs
  `isMobileBottomSheet` at 600px window). On a 700px tablet this surface is "touch" to every renderer
  and not a sheet to the positioner. Pre-existing, named in `design-system.md` §7, out of scope here.

---

## 6. THE GATE

`SURFACE_PHASE=013-add-view-sheet npm run gate` exits 0, with `placement` green and no unexpected
pass among the declared reds. The gate's own exit status is read directly; a pipe would report the
pipe's status instead, which is how three checks were misread earlier in this program.
