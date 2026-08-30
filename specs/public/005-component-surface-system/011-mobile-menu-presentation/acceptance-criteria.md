---
title: "Acceptance Criteria: Mobile Menu Presentation"
description: "Numbered, measurable criteria for presenting owned menus as phone sheets and for building every sheet menu row from one component."
contextType: "planning"
---
# Acceptance Criteria: Mobile Menu Presentation

Every criterion names the check that produces its number, the threshold, and the number the check
returned **before** the change and **after** it. The before column is not a recollection: it comes
from running the same extended harness against `HEAD` source in a detached worktree, with the
working tree's `styles.css` copied in so the stylesheet is held constant and only the code under
test differs.

- **Check**: `node tools/storybook/verify-placement.mjs` (`npm run storybook:placement`). It bundles
  the shipped `src/views` modules with esbuild and runs them in Chromium against the real
  `styles.css`, inside a workspace shaped like Obsidian's — left and right sidebars, a
  `contain: strict` leaf, and a fixed `.mobile-navbar`. It is not a fixture: the code that places
  the menu in the browser is the code that ships.
- **Before source**: worktree at `4830275`, `src/` untouched, `styles.css` copied from the working
  tree.
- **After source**: the working tree.

---

## 1. A PHONE MENU IS A SHEET

### AC-1 — a phone menu docks to the bottom of the screen

Threshold `|menu.bottom - window.innerHeight| <= 1`.

| | value |
|---|---|
| before | `bottom=876` against a `844` viewport — **32px past the bottom edge**, opened at the point `y=90` |
| after | `bottom=844`, viewport `844` |

Check: *a phone menu docks to the bottom of the screen instead of opening at the point*.

### AC-2 — a phone menu spans the full width

Threshold `round(width) >= window.innerWidth - 1`.

| | value |
|---|---|
| before | `width=220` against a `390` viewport |
| after | `width=390` |

Check: *a phone menu spans the full width instead of the menu's own 220-320px*.

### AC-3 — a 19-row menu is capped and scrolls inside the sheet

Three thresholds, all required: `height <= 0.9 * innerHeight + 2`, `top >= -1`, and
`scrollHeight > clientHeight + 1`. Nineteen rows is the length the reported column menu holds; a
shorter menu fits the screen by accident and can show neither the overflow nor the scrolling.

| | value |
|---|---|
| before | `height=872` against a `760` cap; `content=870 visible=870` — **the menu does not scroll, it grows** |
| after | `height=760` at the `760` cap; `content=898 visible=759` — the overflow is scrollable |

Check: *a 19-row phone menu is capped at the sheet ceiling and scrolls inside it*.

### AC-4 — a phone menu carries the sheet's grab handle, and it answers a press

Threshold, both required: `.db-mobile-bottom-sheet-handle` is present in the menu, **and**
`document.elementFromPoint` at the top of the sheet resolves to it over a band at least as tall as
the record sheet's own — measured 32px there.

| | value |
|---|---|
| before | `handle=absent`, classes `db-surface db-menu db-owned-menu` |
| after | `handle=present`, classes `… db-mobile-bottom-sheet db-overlay-enter` |
| hit band | **not yet measured on this surface** |

The presence clause on its own is a class-name assertion, which this program bans as a criterion: an
element with the right class and no hit area satisfies it while the operator's thumb finds nothing.
AC-7 does drive the real handle with a pointer stream, so the *gesture* is evidenced; what is not
evidenced is that the visible band a person aims at is the same size as the one they have learned on
the record sheet. The hit-band clause is owed.

Check: *a phone menu carries the sheet's grab handle*.

---

## 2. DISMISSAL HAS ONE OWNER

### AC-5 — the backdrop takes the tap instead of passing it to the table

Threshold: `document.elementFromPoint` at a point above the sheet returns the backdrop element
itself. Read from the document, not from the element: an inert backdrop is present in the tree and
absent from the hit test, and only the hit test is the behaviour.

| | value |
|---|---|
| before | `backdrop=absent`; the document paints `note-database-container` above the sheet, so the press that dismisses the menu also lands on the table |
| after | `backdrop=present pointer-events=auto`; the document paints `db-mobile-sheet-scrim` |

Check: *the backdrop over a menu sheet takes the tap rather than passing it to the table*.

### AC-6 — the backdrop arrives with the menu and leaves with it

Threshold: present while open **and** absent after `close()` **and** the menu unmounted. Both
clauses are required — asserting only the second passes trivially on a build that never draws one.

| | value |
|---|---|
| before | `while open=false after close=false` |
| after | `while open=true after close=false`, menu unmounted |

Check: *the backdrop arrives with the menu and leaves with it*.

### AC-7 — the grab handle dismisses past its threshold and springs back below it

Driven by Playwright's own pointer stream, not synthesised events: a hand-made `PointerEvent`
carries a pointerId the browser never issued and `setPointerCapture` rejects it, so a synthetic
version would measure the harness throwing rather than the gesture working. Threshold is the
shipped `DISMISS_PX = 96`; the short drag is the control, because a check that only proves "a long
drag closes it" also passes on a surface that closes on any touch, which would make the menu
impossible to scroll.

| | 140px drag | 40px drag |
|---|---|---|
| before | no grab handle, so there is no gesture to drive | no grab handle |
| after | menu unmounted, backdrop gone | menu still mounted, backdrop present |

Checks: *dragging a menu sheet's handle down past the threshold dismisses it*, *a short drag on the
handle springs back instead of dismissing*.

There is exactly one owner. The menu's own capture-phase `pointerdown` and `Escape` handlers close
it; the backdrop is a rectangle rather than a handler, so a press on it arrives at the same place as
any other outside press. The drag gesture calls the same `close()`, which is idempotent.

---

## 3. NOTHING ELSE MOVES

### AC-8 — a desktop menu still opens at its point and is not a sheet

Threshold, all required: opens within 1px of the requested point, `width <= 320`, no
`db-mobile-bottom-sheet` class, no grab handle, no backdrop anywhere in the document.

| | value |
|---|---|
| before | `menu=[400,200]` for a request of `[400,200]`, `width=220`, sheet class `false`, backdrop absent |
| after | identical |

This is a regression guard and it passes on both sides. That is its job: the phone branch is a new
fork inside a function fourteen call sites share, and the way that goes wrong is silently, on the
presentation nobody was looking at. Its detail line carries the phone's numbers for the same menu so
the two are legible side by side.

Check: *a desktop menu still opens at its point and is not a sheet*.

### AC-9 — the record sheet does not regress

All eight existing record-sheet checks stay green: docks to the bottom, spans the full width, height
capped rather than full-screen, declares a max-height, chrome reversible, placed on the viewport
floor rather than above the navigation bar, bottom offset zero, reaches the screen bottom when the
workspace does not, and its rectangle covers the navigation bar's band.

| | value |
|---|---|
| after | 8/8 PASS, including `sheet bottom=844 viewport=844 (gap 0px)` and `sheet 635-844 navbar 772-844` |

---

## 4. ONE ROW COMPONENT

### AC-10 — the utilities rows are built by the shared component and keep their layout

The "More tools" rows now come from `createMenuRow` rather than from a second hand-rolled copy of
the same three elements. Threshold, all required: `display: flex`, `text-align: start`, and every
row's label left edge within 1px of every other.

| | value |
|---|---|
| before | `display=inline-block text-align=center`, label left edges `[25, 125, 252, 25]` — **a 227px spread**, which is the ragged, centred sheet in the device report |
| after | `display=flex text-align=start`, label left edges `[35, 35, 35, 35]` |

The before number is what the shared component produced when it could not carry the class its
container styles; that is why the toolbar had hand-built its own row instead.

Check: *utilities rows keep their container's row layout after moving to the shared component*.

### AC-11 — every utilities row asks for an icon the host actually ships

`Display width` asked for `arrows-left-right`. Verified against the installed host bundle
(`/Applications/Obsidian.app/Contents/Resources/obsidian.asar`):

| id | occurrences in the bundle |
|---|---|
| `arrows-left-right` | **0** |
| `arrow-left-right` | 5, and `lucide-arrow-left-right` is in its icon class list |

It was the only `arrows-`-prefixed id in `src/` against twelve singular `arrow-` siblings. The row
therefore rendered no glyph, and with no glyph its label sat left of every sibling's — the report's
"Display width carries no icon and floats". Not observable in the harness, whose icon stub draws a
placeholder for any id at all; verified against the bundle instead.

### AC-12 — a shared menu row lays itself out in any sheet

Threshold: a row built by `createMenuRow` into a sheet that is not the owned menu's own shell
renders `display: flex` with all label left edges within 1px.

| | value |
|---|---|
| before | `display=inline-block text-align=center`, label lefts `[16, 101, 16]`, **spread 85px** |
| after | `display=flex text-align=left`, label lefts `[40, 40, 40]`, **spread 0px** |

**Met.** The re-key described in [`findings.md`](findings.md) §5 was applied by the coordinator with
the lane held, in the doubled-class form that preserves specificity. The entry has been removed from
the harness's `KNOWN` map, which is what the map is for: it reported the fix as an unexpected pass
the moment it landed.

Check: *a shared menu row lays itself out in any sheet, not only inside the owned menu*.

### AC-14 — the re-key's blast radius across the row family is measured, not assumed

`findings.md` §5 said the patch was unverified and named the verification it needed. That has now
been run, and the answer is that **the patch is not inert**: it changes computed layout for **14 of
17** menu-row shapes on desktop and **15 of 17** on a phone. Method and full table in
[`findings.md`](findings.md) §7. The two owed checks are discharged:

| check | result |
|---|---|
| `npm run replay` | **PASS — all 8 recorded results still hold** |
| `npm run screenshots` | 204 captured; **15 of 204** differ from the pre-recapture set |
| churn floor, measured | **7** files move between two consecutive identical runs |

Fifteen moved against a measured floor of seven, and the eight beyond the floor are concentrated in
`add-view-popover` (4/4 variants) and `calendar-month-view` (4/4). `add-view-popover` renders a
`db-add-view-duplicate-action db-menu-item` row, which the audit shows changing. This criterion is
**met as a measurement** and carries an open design question, not a defect: see `findings.md` §7.

## 5. THE GATE

### AC-13 — `SURFACE_PHASE=011-mobile-menu-presentation npm run gate`

**PASS — 13 green, 0 red.** `types`, `tests` (431 in 57 files), `lint:tools`, `comments`,
`folder-docs`, `naming`, `pinned-values`, `css-lane`, `replay`, `inverted-assertions`,
`screenshots-fresh`, `story-coverage`, `placement`. Within it `placement` reports **48/50, 2 red for
a declared reason** — AC-12 above, and the pre-existing paint-contained-widget clipping.

The green run is a reading of one moment. Three phases wrote to this tree during the work and the
CSS lane changed hands twice, so `screenshots-fresh` in particular tracks a stylesheet this phase
does not own. What is durable is the attribution: no capture cites any `src/` file this phase
touched. [`findings.md`](findings.md) §6 records the rest.
