---
title: "Implementation Summary: List View Freeze"
description: "What changed, why each change was made, what was deliberately not changed, and the two findings that outlived the fix."
trigger_phrases:
  - "list view freeze implementation"
  - "touch mode hoist placeholder box"
  - "024 implementation summary"
importance_tier: "critical"
contextType: "implementation"
---
# Implementation Summary: List View Freeze

---

## 1. THE TWO CHANGES

Both in `src/views/list-renderer.ts`. Nothing else in `src/` was touched.

### Decide touch mode once per render — this is the fix

`isTouchDevice(this.container)` was called once per row, from `setupReorderDrag` and
`setupGroupedRowDrag`. It measures the container with `getBoundingClientRect()`, which forces a
synchronous layout — inside the loop that is appending to that same container. Every row made the
browser lay out every row before it.

It is now a `touchMode` field, set once at the top of `render` and `renderGrouped`. Safe because
nothing it reads — platform flags, pointer type, container width — can change during a synchronous
render, and a resize re-renders anyway.

Measured alone, before the second change: **7,173.5ms → 185.1ms** at 1,600 rows on the desktop, and
the curve flattens from ×3.59 per-row drift to ×1.60. This one line is 38.8× of the 84.9×.

### Reserve a column with a box, not a hidden field — this is the amplifier

`c31acf5` began building every property and hiding the empty ones, so a column is claimed by index
rather than by count. Correct, and it went through `renderCardField`: a field div, a label span, a
value div, and a full value render, for something with `visibility: hidden`.

`renderRowFieldPlaceholder` now returns a bare div carrying `db-list-field is-placeholder`,
`aria-hidden`, its `grid-column`, and `--db-card-field-width`. The default field takes its width from
that custom property via `flex: 0 0`, so the reserved box is dimensionally identical to the hidden
field it replaces.

**7,173.5 → 185.1 → 84.5ms**, and 120,007 DOM nodes → 75,207 at 1,600 rows.

No CSS was needed and none was written. The existing `.db-list-field.is-placeholder` rule and the
`.db-list-field` box model already do the work.

---

## 2. WHAT WAS DELIBERATELY NOT CHANGED

- **`listFieldTrackTemplate` still runs per row**, building the same 21-track string for every row of
  the render. It is identical each time and could be hoisted. At 1,600 rows it is on the order of a
  millisecond against 84.5, so it was measured, found immaterial, and left alone.
- **The same quadratic in `TableRenderer`.** Already measured and written up. Fixing it is a
  different phase with a different blast radius.
- **Windowing.** Both renderers are linear once the forced layout leaves the loop. An asymptote that
  is already linear does not need one, and the prior research reached the same conclusion from the
  other direction.
- **Section 5j of `verify-placement.mjs`**, which measures the fixture. It is a real check of the
  stylesheet and it is not wrong, it is just not a check of the renderer. Section 5k was added
  beside it rather than replacing it, partly on scope and partly because that file is being edited
  concurrently by another phase.

---

## 3. THE CHECKS

**`tools/bench/list-render-bench.ts` + `run-list.mjs`** — the real `ListRenderer`, varied by row
count, column count, **fill rate** and column type, at both widths, against a declared 2,000ms
budget. Fill rate is the axis nothing else in the repository moves: at 100% a renderer that skips
empty properties and one that reserves their columns produce identical output, which is the shape
every fixture and story already uses, and precisely why this shipped.

**`verify-placement.mjs` section 5k** — the alignment property, measured on the renderer's own output
in a real browser, plus a third assertion that fails if a reserved column ever carries rendered
content again.

**`column-width.test.ts`** — the assertion that pinned the exact string `field.addClass(...)` is
gone. It tested a spelling. A second source-slicing test was written to replace it, failed for a
reason that had nothing to do with the property, and was deleted rather than repaired: section 5k
already proves the same thing properly, and a weak duplicate of a strong check is not worth its
maintenance.

---

## 4. TWO FINDINGS THAT OUTLIVED THE FIX

### The suspected commit was not the cause

`c31acf5` was the obvious suspect and it survived reading the code. It died on measurement: the
renderer immediately before it takes 6,777ms on the same 1,600 rows against the shipped 7,173ms. It
contributed **6% on the desktop and 28% on the phone**, and tripled the DOM.

The freeze predates it, predates `4830275`, and predates the session. Had the change been reverted —
the obvious remedy, and the one that would have discarded the alignment it bought — the operator's
list view would still have frozen.

### The phone alignment that justified the change is not observable on a phone

Building the geometry check surfaced this. The hand-written fixture omits the row controls the
renderer always builds — selection checkbox, open button, move button — so its field area is roughly
twice the real one. On a 402px phone the renderer's field area measures **240px**, which fits exactly
one property per line.

At one property per line every property sits at x=0 on every card, with reserved columns and without
them. Measured on both renderers: identical spread, identical 240px card width. The "fourteen
x-positions on twelve cards" that motivated the change was measured on a fixture describing a width
no phone has.

The reserved columns are kept regardless — they are load-bearing on the desktop grid, observed red
without them, and on any surface wide enough for two properties on a line. But the check now reports
in its own output that its phone arm cannot fail, because a green that cannot go red should not be
counted as evidence.

---

## 5. STATE AT HANDOVER

Not committed, as instructed.

| | |
|---|---|
| `npx tsc --noEmit` | exit 0 |
| `npx vitest run` | 444 passed, exit 0 — baseline |
| `verify-placement` | 186/190, 4 declared red — baseline 173/177 plus 6 here and 7 concurrent |
| `npm run gate` | 13 green, `css-lane` red — held and moved by `021-sheet-inline-edit-alignment`, no CSS in this phase |
| `npm run bench:list` | LINEAR at all shapes, worst 25.7ms |

**Open:** operator confirmation on device, and the row count of the vault that froze.
