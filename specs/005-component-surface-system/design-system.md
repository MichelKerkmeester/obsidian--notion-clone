---
title: "Design System: Surfaces, Rows, Sheets and Checkboxes"
description: "How the component set-up works and how to reuse it for the plugin's dropdowns, panels and sheets — written for someone who was not here, so the next person does not reintroduce the bugs this program exists to fix."
trigger_phrases:
  - "design system"
  - "surface roles"
  - "how to add a dropdown"
  - "row grammar"
  - "sheet presentation"
  - "checkbox primitive"
  - "component reuse"
importance_tier: "critical"
contextType: "reference"
---
# Design System: Surfaces, Rows, Sheets and Checkboxes

> **Read this before you add a dropdown, a panel, a sheet, a menu row or a checkbox.**
>
> Every rule here is the scar of a shipped defect. Release 1.3.1 fixed dropdowns, sheets, checkboxes
> and table performance, passed tsc, the build, 410 unit tests, 196 screenshot captures, a Storybook
> catalogue and 13 geometry checks — and changed essentially nothing on the operator's device. The
> measurements behind each rule are in [`architecture-findings.md`](architecture-findings.md); the
> contract that implements them is
> [`000-surface-contract-and-truthful-harness/`](000-surface-contract-and-truthful-harness/spec.md).

---

## 1. THE ONE-PARAGRAPH VERSION

A **surface** is anything that floats: a menu, a panel, a dialog, a sheet. You create one by
**declaring what it is** — its role — and letting the factory decide where it mounts, what tokens it
carries, how wide it is, and who dismisses it. You never decide those by typing a class name, a pixel
width, or a mount parent at the call site. Rows inside a surface carry their own layout. Sheets
declare their presentation instead of inferring it from an anchor. Checkboxes look like the plugin's
checkboxes unconditionally, and their role picks a size and nothing else.

If you find yourself reaching for `document.body.createDiv`, a literal width, a `z-index`, or a
selector that starts with an ancestor class, stop and read §9.

---

## 2. WHY THE RULES ARE SHAPED LIKE THIS

Three measured facts explain every rule below. They are worth thirty seconds because the rules look
arbitrary without them.

**Tokens are declared on nine selectors, and menus mount outside all of them.** The token block sits
at `styles.css:19-27` — nine selectors, the first `--db-*` declaration at `:32`, the block closing at
`:125`, with a dark-theme override repeating the same nine at `:425-433`. Four of the five surfaces
that portal to `document.body` are in that list. `.db-owned-menu` is the one that was never added,
and `createOwnedMenu` mounts exactly there (`src/views/owned-menu.ts:56`). Five `var(--db-*)` uses on
that subtree carry no fallback (`styles.css:208`, `:225`, `:253`, `:266`, `:308`), so at runtime they
resolve to nothing. Across 29 probed overlay classes, **29 compute differently between the two mount
points and 25 carry no tokens at all on body.**

**Every harness wraps its subject in the container that supplies those tokens.** `.storybook/preview.ts:55`
sets `className = "note-database-container"` on the story host. The screenshot fixtures do the same.
So the catalogue is *structurally incapable* of showing the defect — not unlucky, incapable.

**The stylesheet reverses itself.** 87 selectors are declared more than once and 124 property values
are overridden by a later block. A value you set today can be silently beaten by a block 10,000 lines
down, with no compiler warning and no failing test.

The rules below all follow from those three: **declare intent, carry your own tokens, and never let
your appearance depend on where you happened to land.**

---

## 3. THE ROLE VOCABULARY

A role is a **semantic** answer to "what is this thing", not a visual one. It is declared as a typed
literal, and everything visual is derived from it.

| Role | What it is | Dismisses on | Focus | Typical width |
|---|---|---|---|---|
| `menu` | A short list of actions or options. The user picks one and it closes | outside click, Escape, selection | roving, returns to trigger | 292px (see §5) |
| `panel` | A working surface with several controls the user adjusts before closing — view config, and any other non-condition panel | outside click, Escape | trapped | 292-360px |
| `condition panel` | A `panel` whose rows carry conditions — property, operator, value, plus a group, NOT and remove button — Filter, Sort, Column Manager | outside click, Escape | trapped | 440-560px (see §5) |
| `dialog` | A decision that must be answered before continuing | explicit action only | trapped, mandatory | role-declared |
| `sheet` | A phone presentation: docked to the bottom edge, full width, over the host chrome | scrim tap, Escape, back, drag-to-dismiss | trapped | 100% |
| `submenu` | A `menu` opened *from* a row of another surface, in the same LIFO group | Escape closes innermost only | returns to the parent row | 292px |
| `checkbox` | Not a floating surface, but the same declaration discipline (§7) | n/a | n/a | role picks size only |
| `row` | A line inside a surface (§6) | n/a | n/a | fills its surface |
| `target` | Where a record opens: a leaf, a modal, or a phone sheet | per its host | per its host | per its host |

### How a call site declares one

```ts
const surface = openSurface({
  role: "menu",              // typed literal — the whole contract keys off this
  producer: "column-menu",   // registry id; how the census and CI scan find you
  mount: "bodyPortal",       // explicit adapter, never inferred (§4)
  anchor: anchorRef,         // a logical lease, not an element (§8)
});
```

Four things are true about that call and none of them is optional:

1. **`role` is a literal from the union**, so a missing or invented role is a type error, not a
   runtime surprise.
2. **`producer` registers you.** The registry is what the runtime birth observer reconciles against;
   an unregistered surface fails CI (§10). A registry a developer can bypass is documentation, not an
   inventory.
3. **`mount` is declared.** Nothing infers it from the anchor, the viewport, or platform detection.
4. **`anchor` is logical.** See §8 — this is the rule that stops a sheet dying when its view
   re-renders.

`data-db-surface="<role>"` is stamped on the root for inspection, and `.db-surface` is the style and
token boundary. **Neither of those is the contract** — they are its visible edges. Style rules address
`[data-db-surface]`; they never address an ancestor.

---

## 4. THE DECISION TABLE

Find your sentence in the left column. Everything else follows.

| I need… | Role | Mount | Width policy | Notes |
|---|---|---|---|---|
| A dropdown of 3-12 actions from a toolbar button | `menu` | `local` | 292px | The overwhelmingly common case |
| A dropdown from a table column header | `menu` | `bodyPortal` | 292px | Portals out of the scroll container so it is not clipped |
| A dropdown from a cell being edited | `menu` | `bodyPortal` | 292px | Same reason; the cell may re-render underneath it |
| A nested menu from a menu row | `submenu` | same as parent | 292px | Same LIFO group as its parent (§6) |
| A panel whose rows carry conditions — filters, sorting, column list | `condition panel` | `local` | 440-560px, declared | Filter, Sort and Column Manager are this (§5) |
| A panel the user adjusts then closes, with no condition-shaped rows — view config | `panel` | `local` | 292-360px, declared | Everything else in the `panel` role |
| A panel that must survive a container scroll | `panel` | `bodyPortal` | declared | Portal, then re-anchor on commit (§8) |
| A colour, icon or date picker | `menu` | `bodyPortal` | declared, content-driven | Fixed-width by nature; declare it on the role, not at the call site |
| A relation picker or anything with a search field and a long list | `panel` | `bodyPortal` | wider role | If you want room, **declare a wider role** — do not type a number |
| Something the user must answer before continuing | `dialog` | `topLayer` if opted in, else `bodyPortal` | role-declared | `topLayer` needs its own accessibility proof first (§4.1) |
| A phone presentation docked to the bottom | `sheet` | `bodyPortal` | 100% | **Always a portal.** A z-index does not work (§7) |
| A record opened from a row | `target` | per the setting | per host | The setting decides; the call site does not |

### 4.1 The mount adapters

| Mount | Use when | What the adapter must do |
|---|---|---|
| `local` | The surface fits inside its own container and nothing clips it | Own the local root, the owner and the anchor |
| `bodyPortal` | The surface would be clipped, or must cover host chrome | Copy the token snapshot onto the surface root (§4.2) |
| `shadowRoot` | You need hard style isolation from a hostile theme | Deliver the plugin's style contract into the root, with its lifetime following the adapter |
| `topLayer` | Only with a per-role accessibility and fallback proof | **Never** selected because the browser supports the Popover API |

`topLayer` changes stacking, light-dismiss, focus and event semantics all at once. Adopting it
silently would trade a known problem for four unknown ones, so it is opt-in per role and each role
needs its own proof before opting in.

### 4.2 The token snapshot — the rule that makes portals safe

When a surface portals, it leaves the subtree where `--db-*` is declared. Two ways to fix that, one
correct:

- **Correct:** copy a **versioned snapshot** of the resolved contract onto the surface root —
  background, foreground, border, shadow, radius, density, layer, environment insets. The surface
  carries semantics with it. A theme change refreshes the snapshot of every open surface.
- **Wrong:** set plugin variables on `body`, `documentElement`, or an Obsidian ancestor. That
  pollutes the host application, cannot be scoped per surface, and cannot be cleanly torn down.

**Never write a `--db-*` variable, a class, or an attribute onto a host root.** A sheet may *read*
host geometry — the real `.mobile-navbar` rectangle, safe-area insets, `visualViewport` — and may
write only to itself and its own scrim.

---

## 5. SIZING

### The one number that is right

**292px.** It is the column menu's explicit request (`styles.css:5071-5073`) and the `preferredWidth`
of the compact preset (`popover-position.ts:47-51`, which is `{ minWidth: 220, preferredWidth: 292,
maxWidth: 320 }`). It is the only menu width in the plugin that currently reads correctly. Menu-role
surfaces size from it.

### The number that is wrong, and how it reaches you

`positionToolbarPopover`'s default is `preferredWidth ?? 520` (`popover-position.ts:73`), with
`maxWidth` defaulting to the same value (`:74`). **A four-item menu 520px wide looks broken**, and
three call sites reach it by passing no options at all:

| Call site | Surface |
|---|---|
| `src/views/filter-panel-renderer.ts:213` | Filter |
| `src/views/sort-panel-renderer.ts:90` | Sort |
| `src/views/column-manager-renderer.ts:134` | Column Manager |

The other 30 call sites split into 15 using the compact preset (all in `toolbar-renderer.ts` and
`view-config-panel-renderer.ts`) and **15 passing bespoke numbers** across 13 files — 420, 520, 292,
560, 252, 360, 124, 280, 318 and one computed `estimatedWidth`. Nine literal widths for one product.

### The policy

1. **Width is a property of the role.** You declare a role; the role has a width policy.
2. **If you need more room, declare a wider role** — not a bespoke number at the call site. Relation
   pickers, chart toolbars and the record detail panel are the legitimate cases, and each becomes a
   named role rather than a number typed in one file.
3. **No code path may produce a menu-role surface wider than its role permits.** The check is
   `rect.width <= 320` measured on every menu-role surface the census reaches.

### The condition panel — a named wider role, not a bespoke number

**Operator ruling, 2026-09-05 (~11:40).** The `panel` role's 292-360px range does not fit a panel
whose rows carry conditions — property, operator, value, plus a group button, a NOT button and a
remove button — because the row's two word-carrying controls have no floor under either one, and they
absorb whatever the container's width does not cover. Measured on the shipped renderer at 360px:
property 82px, operator 110px, value 16-40px (`roadmap.md` §4 row 50). This is not a defect in an
otherwise-correct number; it is the `panel` role applied to a row shape it was never sized for.

Policy item 2 above already says what to do when a role's declared width does not hold: **declare a
wider role**, not a bespoke number at the call site. `condition panel` is that role.

**Who it applies to.** The three callers of `PANEL_POPOVER` in `src/views/popover-position.ts` —
`filter-panel-renderer.ts:228`, `sort-panel-renderer.ts:142`, `column-manager-renderer.ts:153` — and
no one else. Column Manager widens with Filter and Sort deliberately: splitting the preset would
restore the per-panel width drift it exists to end (`roadmap.md` §4 row 50). View config and every
other `panel`-role surface are unaffected and keep the range below.

**Width range: 440-560px.** `PANEL_POPOVER` today is `{ minWidth: 292, preferredWidth: 552, maxWidth:
552 }` (`popover-position.ts:90-94`), derived from the widest row a condition builds rather than
picked — the derivation is documented in the constant's own comment. 552px sits inside the range; the
range itself is not one fixed number so a future derivation change (a new button, a wider label) is
not itself a doc violation, the way a single fixed width would make every future measurement a
rewrite.

**The row floor rule.** Inside a condition panel's row, the two word-carrying controls — property and
operator — each carry a 140px floor (`flex: 0 1 auto`, `min-width: 140px`), and the value control
carries a 120px floor (`flex: 1 1 auto`, `min-width: 120px`). Measured after the fix, at 552px: property
140px, operator 140px, value 120-140px, zero row overflow at every nesting depth the panel builds
(`roadmap.md` §4 row 50). The floors are scoped away from `.db-mobile-bottom-sheet` (the phone grid is
untouched) and away from `.db-active-rule-popover` (the compact single-rule editor, which wraps onto
three lines if given the same floors).

**The existing `panel` role is unchanged: 292-360px for everything else.** This range is additive, not
a replacement — a panel that is not one of the three named callers above still sizes from 292-360px as
before.

**Carried through the design tables.** §3's role vocabulary table and §4's decision table both cite
`condition panel` for Filter, Sort and Column Manager at this 440-560px range, and keep every other
`panel`-role row at 292-360px — the same amendment this section makes, not a separate one left open.

### One trap in the harness, before you trust the geometry gate

`tools/storybook/verify-placement.mjs:164-171` currently asserts `wr.width > 320` for a widthless
caller and names it *"widthless caller still defaults wide (preset is the fix, not a global change)"*.
It passes today and runs on every push (`.github/workflows/gates.yml`). **It asserts the defect is
correct.** Fixing the width policy turns that check red, and the cheapest reading of a red pipeline is
to revert the fix. `000` inverts this assertion before `001` starts. If you are reading this before
that has happened, expect it.

---

## 6. THE ROW GRAMMAR

### The rule

**A row carries its own layout.** Its computed `display`, alignment and internal rectangles are the
same in `.db-owned-menu` as in a bare `div` on `document.body`. If moving a row changes how it looks,
the layout is living in the wrong place.

Today it lives in the wrong place: `display: flex` for a menu item is declared at `styles.css:258` on
`.db-owned-menu .db-menu-item`, the **only** flex declaration for that row. Move the row and it
computes `block`. `src/views/menu-row.ts:23-31` documents this trap in a comment, which is honest and
insufficient.

### The state of the vocabulary

| Thing | Count |
|---|---|
| Canonical builder `createMenuRow` (`src/views/menu-row.ts:83`) | 1 |
| Its production callers | **1** — `src/views/owned-menu.ts:109`, inside `OwnedMenuHandle.addRow` |
| Production `handle.addRow(...)` calls that reach it | ~76, across 10 files |
| Hand-rolled `db-menu-item` row roots outside the builder | **24**, across 4 files |
| Distinct hand-rolled row vocabularies | **14** |

`toolbar-renderer.ts` alone carries 11 of those vocabularies across 17 root sites, two of them near
line-for-line duplicates. So the canonical builder is genuinely reused — 76 rows go through it — and
in parallel there are fourteen other ways to build the same thing.

### What to do

- **Build every row with `createMenuRow`.** If it cannot express your row, extend it once; do not
  start a fifteenth vocabulary.
- **Never style a row through its container.** Rules address the row, not `.db-owned-menu .db-menu-item`.
- **Identify rows by a logical key**, not by index, position or label text. A toolbar re-render
  re-emits every row; an assertion or handler bound to "the third row" is bound to whatever lands
  there next.

### `submenu: true` — what it does and does not do

`menu-row.ts:102-111` draws a chevron and sets ARIA. `owned-menu.ts:113` reads the flag exactly once,
to suppress auto-close: `if (!rowOptions.submenu) close();`. **The handle has no way to open a nested
menu.** The only production surface with real submenus builds them by hand as a separate body-mounted
popover (`src/views/column-menu.ts:577`, `:598`).

So: a chevron that opens nothing is worse than no chevron, because it promises. Until
`OwnedMenuHandle` can open a nested menu through the same factory that produced its parent, do not add
`submenu: true` to a new row expecting behaviour.

---

## 7. SHEETS

### Presentation is declared, never inferred

A sheet declares four things **once, at open**: portal target, scrim, safe-area padding, and keyboard
behaviour. It does not infer them from whether it happens to have an anchor, from the viewport width
at construction time, or from which of two platform predicates the calling file happened to import.

Why that rule exists: there are currently **two independently thresholded phone predicates**, and they
disagree.

| Predicate | Where | Threshold | Reach |
|---|---|---|---|
| `isTouchDevice()` | `src/data/touch-environment.ts:46-55`, `TOUCH_LAYOUT_MAX_WIDTH = 760` at `:22` | container width ≤ 760, or platform touch, or coarse pointer | ~40 call sites in 18 files, including `DbModal` |
| `isMobileBottomSheet()` | `src/views/popover-position.ts:299-305` | **window** width ≤ 600 and a coarse pointer | 1 call site, and it is **not exported** |

A 700px-wide container on a touch device is "touch" for every renderer and **not** a bottom sheet for
the positioner. And because the second is module-private, no caller can even ask "will this present as
a sheet?" before rendering. One visual affordance, two mechanisms, two behaviours.

### The navbar needs a portal, not a z-index

This is measured, not argued. A sheet inside `.note-database-container` at `z-index: 9999` — over the
navbar band, `document.elementFromPoint` returns `DIV.mobile-navbar`. **The same node cloned to
`document.body` returns the sheet.**

A stacking context you do not own cannot be out-ranked from inside it. Raise the z-index as high as
you like; the answer does not change. Portal, or lose.

And once you portal, you leave the token subtree — which is why sheets are hard-coupled to §4.2's
token snapshot, and why `003` cannot land before `000`.

### Three more facts you will trip over

- **There is no sheet scrim.** `applySheetChrome` (`src/views/mobile-bottom-sheet.ts:31`) toggles one
  class and prepends a grab handle. It does not create a backdrop, lock scroll, manage focus, or wire
  dismissal. The plugin's only backdrop anywhere is `db-mobile-column-width-backdrop`
  (`src/views/database-view.ts:10983`), for the column-width drag. A scrim is new construction.
- **`--db-mobile-sheet-bottom` has one writer, and it is not the one you would guess.** It is set
  inline on the panel by `positionToolbarPopover:115`, only inside the `mobileSheet` branch, and read
  at `styles.css:159`. `applySheetChrome` never sets it. So a modal presenting as a sheet — the exact
  case the module split was built for — always falls back to `0px`. Meanwhile
  `tools/screenshots/runtime-vars.css:43` pins it to `0px` for every capture, which is the single
  value the sheet defect lives in, pinned to its correct answer.
- **The navbar height has a hardcoded fallback.** `popover-position.ts:291` uses `50` when
  `.mobile-navbar` is absent, and no harness contains one. With a navbar the sheet bottom offset is
  49px; without it, 50.35px. Harness and device agree to within 1.35px, and both are wrong.

### Resource ownership

A sheet takes a **scoped lease** on: the scrim, the drag handle, scroll suppression, keyboard
suppression, and Escape/back dismissal — and restores all of it on close. Exactly one owner of each,
and a wholesale view refresh must not strand the lease. Global side effects (a class on `body`, a
scroll lock nobody releases) are how a sheet leaves the app subtly broken after it closes.

---

## 8. ANCHORS, AND WHY SURFACES DIE

`positionToolbarPopover` takes an `HTMLElement` anchor and early-returns if
`!anchorEl?.isConnected` (`popover-position.ts:68`). That is a reasonable guard and a fatal design.

`updateCellDOM` (`src/views/database-view.ts:8597-8620`) has surgical cases for table, board, gallery
and list. Calendar, timeline and chart fall through to `default: this.refresh()` (`:8615-8617`), which
rebuilds the view. Calendar and timeline are the only two views that can have the record-detail sheet
open. The sheet's node survives the rebuild; **its anchor does not.** From the first field commit
onward `anchorEl.isConnected` is false, so `place()` no-ops permanently — the sheet stops
repositioning, including for the keyboard on the next field.

### The rule

**The anchor is a logical lease, not an element.** An `AnchorRef` carries a logical scope, a row path
/ cell key / event key, the role, and any stable record identity. The DOM node is a **render-epoch
cache**, re-resolved at every renderer commit.

```
open → anchored(A) → anchor-missing(pending) → anchored(B) → close
```

The pending window is **bounded**. If the logical anchor cannot be re-resolved before it expires, the
surface closes or enters a declared fallback. Retaining the last rectangle indefinitely is worse than
closing, because it leaves a surface that looks actionable and is pointing at nothing.

Owner teardown always releases the lease: listeners, scroll and keyboard suppression, token resources,
portal nodes. And the ownership model is **renderer commit plus scope teardown** — not a per-surface
`MutationObserver`, which duplicates lifecycle ownership and misses logical changes that do not mutate
the DOM.

---

## 9. CHECKBOXES

### The rule, in three lines

1. **Base appearance is unconditional.** `createCheckbox(parent, { role })` applies `appearance: none`
   and the plugin's own box, border, radius, background and check glyph to **every** checkbox it
   creates — no ancestor in the selector, no condition on where the node is mounted.
2. **The role chooses size only.** Never a radius, a colour, a border or a glyph. Never keyed to an
   ancestor.
3. **A checkbox on `document.body` looks identical to one in a board card.** If it does not, the
   appearance is coming from ancestry and the rule is broken.

### What it looks like today

Only **1 of 12** checkbox families computes `appearance: none`. The other eleven fall back to whatever
the platform or the user's theme draws — which is where the round checkboxes came from.

All four selectors that do declare `appearance: none` on a plugin checkbox are **ancestor-scoped**,
and they are split across two different roots:

| Selector | Root | Box size |
|---|---|---|
| `styles.css:5428` | `.note-database-container` | 16px |
| `styles.css:6628` | `.note-database-container` | 16px |
| `styles.css:8252` | `.note-database-modal` | 18px |
| `styles.css:11039` | `.note-database-modal` | 20px |

Four owned checkboxes, four ancestor selectors, three different sizes.

### The five that work by accident — the dangerous population

Five creation sites make a **classless** `input[type="checkbox"]` and are styled only because the call
site adds a class to the **parent**, one or two lines earlier:

| Site | Parent classed at |
|---|---|
| `src/views/table-renderer.ts:514` | `:513` (`db-select-inner`) |
| `src/views/table-renderer.ts:785` | `:783` (`db-select-inner`) |
| `src/views/cell-renderer.ts:489` | `:487` (`db-checkbox-cell`) |
| `src/views/card-field-renderer.ts:184` | `:183` (`db-checkbox-cell`) |
| `src/views/record-detail-panel.ts:339` | `:338` (`db-checkbox-cell`) |

**These pass every check today.** They look correct, they measure correct, and they are one wrapper
refactor away from breaking with no compiler warning and no failing test. They are the reason the
checkbox rule is written as "unconditional" rather than "make sure it's styled".

A sixth kind exists too: `db-list-row-checkbox` is applied to an input at
`src/views/list-renderer.ts:269-272` and **has no CSS rule anywhere** in the stylesheet. A class in
source that nothing styles is not a checkbox family; it is a loose end.

### Touch targets

Every family presents at least a **28x28** hit target under a coarse pointer, independent of the
visual box the role selects. The painted box and the tappable box are two different measurements.

---

## 10. ANTI-PATTERNS

Each one is tied to the defect it actually caused here.

| Anti-pattern | The defect it caused |
|---|---|
| **Mounting on `document.body` without carrying tokens** | 29/29 probed overlay classes compute differently on body; 25/29 carry no tokens. Every plugin-owned menu ships square-cornered at 14px where the design says 8px radius and 13px |
| **Styling a child through its container** — `.db-owned-menu .db-menu-item { display: flex }` at `styles.css:258` | A canonical row computes `block` anywhere else, so rows cannot be reused and cannot be portalled |
| **Typing a width at the call site** | 15 bespoke widths across 13 files and nine distinct literals; plus 3 call sites that pass nothing and get 520px, which makes a four-item menu absurd |
| **Raising `z-index` to cover host chrome** | A sheet at `z-index: 9999` inside the container still loses `elementFromPoint` to `DIV.mobile-navbar`. You cannot out-rank a stacking context you do not own |
| **Holding an `HTMLElement` as a long-lived anchor** | `anchorEl.isConnected` goes false at the first field commit in calendar and timeline, and `place()` no-ops for the rest of the surface's life |
| **Two predicates for one decision** | `isTouchDevice()` at 760px container width and `isMobileBottomSheet()` at 600px window width disagree in a whole band; one affordance, two behaviours |
| **Ancestor-keyed checkbox appearance** | 1 of 12 families owned; five more work only because their parent was classed one line earlier |
| **A class in source that nothing styles** | `db-list-row-checkbox` (`list-renderer.ts:269-272`) and `db-anchored-popover` — the latter added by every `positionToolbarPopover` call and matched by no rule anywhere |
| **Dual-classing to inherit someone else's rules** | `db-sort-panel` has zero standalone CSS and works only because it is also given `db-filter-panel`; the phone max-height clamp at `styles.css:17206-17215` omits it, so deleting the "redundant" class silently breaks Sort's mobile height |
| **A second dismissal system** | `overlayStack` governs 25 popovers through `popover-auto-close.ts:37`; `createOwnedMenu` runs its own capture-phase listener pair (`owned-menu.ts:138-139`) for 10 menus. A menu opened over a popover is not in the same stack |
| **An affordance without a mechanism** | `submenu: true` draws a chevron and sets ARIA and cannot open anything |
| **A gate that asserts the defect** | `verify-placement.mjs:164-171` asserts the 520px default is intended. Fixing the width policy turns CI red |
| **A harness that pins a runtime value** | `runtime-vars.css:43` pins `--db-mobile-sheet-bottom: 0px` — the exact value the sheet defect lives in — to its correct answer |
| **Measuring inside a helpful wrapper** | `.storybook/preview.ts:55` wraps every story in `.note-database-container`, so the catalogue cannot show the token defect at all |
| **Deleting a "redundant" declaration without replaying the cascade** | 87 selectors are declared twice and 124 values are overridden by a later block. Source order is not the computed winner |

---

## 11. ADDING A NEW SURFACE

### The checklist

1. **Pick a role from §3.** If none fits, add one to the union with its width, dismissal and focus
   policy — do not smuggle a new behaviour in under an existing role.
2. **Register a producer id.** The registry is the inventory; an unregistered surface is invisible to
   the census and fails CI.
3. **Declare the mount** from §4.1. If you portal, you inherit the token-snapshot obligation.
4. **Pass a logical `AnchorRef`**, not an element (§8).
5. **Build rows with `createMenuRow`** (§6). No new vocabulary.
6. **Do not type a width.** If the role's width is wrong for you, the role is wrong for you.
7. **Do not add a `z-index`.** If you are trying to cover something, you need a portal (§7).
8. **Write the check before the code.** A number or hit test, with a threshold, measured at the
   production mount point, **demonstrated failing on today's tree first** — and paired with a negative
   control that would fail if you substituted the producer, the mount, the environment, the
   transition, or the identity. See any packet's `acceptance-criteria.md` for the shape.
9. **Drive it in the real app** through [`009-live-verification/`](009-live-verification/spec.md)
   before you believe the harness. The browser harness is fast and deterministic and does not have the
   operator's theme, their 22 plugins, or a real `.mobile-navbar`.

### What CI enforces

| Check | Fails when |
|---|---|
| Contract scan | A floating surface is created outside `openSurface()` |
| Registry equality | An observed surface root has no registry id, **or** a registry entry is never exercised |
| Raw-mount negative control | A deliberate `document.body.appendChild` of a surface-shaped node does **not** fail the run |
| Story coverage | A surface-creating module has no story and no written exemption |
| Placement geometry | A surface's rect leaves the visible editing bounds, or a menu-role surface exceeds its role's width |
| Cascade replay | A duplicated selector's context is unknown, or a computed winner changed without a disposition |

The registry equality check is the one that matters most and is easiest to misunderstand: **an
unexercised registry entry is a failure, not an omission.** A declaration nobody drives is
indistinguishable from a dead one, and "we declared it" is exactly the kind of evidence that let 1.3.1
pass.

---

## 12. WHERE TO LOOK NEXT

| You want | Read |
|---|---|
| The measurements behind every number here | [`architecture-findings.md`](architecture-findings.md) |
| The contract, the registry, the token boundary, the anchor lease | [`000-surface-contract-and-truthful-harness/`](000-surface-contract-and-truthful-harness/spec.md) |
| Placement, widths, the row grammar, real submenus | [`001-overlay-placement-and-menu-language/`](001-overlay-placement-and-menu-language/spec.md) |
| The properties panel's row grid | [`002-properties-panel/`](002-properties-panel/spec.md) |
| The sheet portal, the phone predicate, the scrim | [`003-mobile-sheet-presentation/`](003-mobile-sheet-presentation/spec.md) |
| The checkbox primitive | [`004-checkbox-ownership/`](004-checkbox-ownership/spec.md) |
| Row rhythm and the header rail | [`005-content-row-rhythm/`](005-content-row-rhythm/spec.md) |
| Where a record opens | [`006-record-open-target/`](006-record-open-target/spec.md) |
| The cross-phase replay and the release decision | [`008-integration-and-release-observability/`](008-integration-and-release-observability/spec.md) |
| Driving and measuring the real running app | [`009-live-verification/`](009-live-verification/spec.md) |

**A note on the references under `external/`.** AnyType and AppFlowy are cloned there and are read for
**behaviour only** — what happens when a sheet meets a keyboard, how a property row degrades at 320px.
Both are AGPL or source-available while this plugin is MIT: never copy code, CSS values or token
scales. Notion is the visual target and is not a source at all — describe what it looks like, then
derive values from our own token scale.
