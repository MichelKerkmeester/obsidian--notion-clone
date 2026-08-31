---
title: "Implementation Summary: List View Freeze"
description: "What changed, why each change was made, what was deliberately not changed, and the two findings that outlived the fix."
trigger_phrases:
  - "list view freeze implementation"
  - "touch mode hoist placeholder box"
  - "024 implementation summary"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/024-list-view-freeze"
    last_updated_at: "2026-08-30T18:45:00Z"
    last_updated_by: "docs-remediation"
    recent_action: "Added template marker, six anchors and continuity block; wrapped existing prose"
    next_safe_action: "Operator confirms on device that the list view opens"
    blockers: []
    key_files:
      - "implementation-summary.md"
      - "../../../../src/views/list-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-024-impl"
      parent_session_id: null
    completion_pct: 67
    open_questions: []
    answered_questions: []
---
# Implementation Summary: List View Freeze

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 024-list-view-freeze |
| **Level** | 1 |
| **Status** | In Progress — AC-6 (operator device confirmation) not met |
| **State** | Shipped and measured (commit `31dce9aa`); non-table views besides this fix still freeze on device per 028 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
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
the curve flattens from ×3.59 per-row drift to ×1.60. This one line is 38.8× of the 84.9× — a
figure §6 corrects, because both numbers compare a render to a render and the fix moves work from
render into layout.

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
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:decisions -->
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
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
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
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:how-delivered -->
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

## 5. WHAT A LATER REVIEW FOUND, AND WHAT IT COST

Three defects, all introduced or left by the work above. Each was reproduced against a threshold
before anything was changed.

### The reservation was costing 84px per card on a phone and buying nothing there

§4 above already recorded that the phone alignment the reservation was written for is not observable
at 240px, and kept the reservation anyway on the argument that an empty div is cheap. On a wrapping
flex line an empty div is not cheap: it takes a whole wrapped line plus the 6px row gap under it. At
the reported shape a twelve-card list measured **3,130.7px where the pre-reservation renderer
measures 2,122.7px** — 84.0px per card, 32% of the scrolling, for boxes nobody can see.

It is now decided per render rather than always. The decision took two attempts and the first one
is the more useful record: keying it on `body.is-phone` reads like the exact question, since that is
the class the stylesheet keys its wrapping arm to — and it is wrong, because the same phone in
landscape fits two properties per line and needs its reservations back. Measured, dropping them
there put one property in three different columns across twelve cards. The predicate is now the
property itself, read off the field area's computed `display`, its `column-gap` and its measured
width: reserve unless the two narrowest declared widths plus one gap cannot share a line.

That read has to happen after a row exists — an empty field area measures 37.9px at every screen
width, because its ancestors are still sizing to content that has not arrived. So it happens once,
on the first row after it is built, and that row's boxes are removed if the answer is "skip". The
fixup is bounded by the column count. At 1,600 rows on the phone the render moved from 71.5ms to
68.6ms, which is noise, and the DOM fell from 75,207 nodes to 52,807.

### The budget excluded the term the fix moves work into

`run-list.mjs` compared `worst.renderMs` against its budget. `layoutMs` was measured, printed and
ignored — and the repair works by deferring a forced layout out of the row loop, which moves cost
from the term under budget into the term that was not. In the default matrix the ignored term is
consistently the larger: 71.1ms of layout behind 25.7ms of render at 21 columns and 400 rows.

Shown failing first, with 5,000ms of layout injected: `PASS — worst render 2.6ms`, exit 0. After:
`FAIL — 5008.6ms of blocked main thread (2.9ms render + 5005.7ms layout)`, exit 1.

The constant is unchanged at 2,000ms; what changed is what it is a budget on. `layoutMs` also became
a median across repeats to match `renderMs`, since the budget now adds them.

### The scaling verdict could not go red

`last.msPerRow / first.msPerRow` over a single row count divides a number by itself. Observed on the
pre-fix tree at `--rows=1600`: `LINEAR (per-row ×1.00)` printed directly beneath a 7,462.6ms render.
It now prints `NO VERDICT — a slope needs two row counts and this run measured 1`.

---
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:limitations -->
## 6. THE HEADLINE NUMBER WAS WRONG

84.9× is a render-to-render ratio for a change whose mechanism is moving work out of render. Both
trees, measured through the same runner in one session at `--cols=21 --fill=0.3 --rows=1600
--repeats=3`:

| desktop, 1,600 rows | render | forced layout | blocked main thread |
|---|---|---|---|
| pre-fix | 8,633.5ms | 12.5ms | **8,646.0ms** |
| now | 82.4ms | 164.2ms | **246.6ms** |

**35.1×**, not 84.9×. Render alone would have reported 104.8× on this hardware. On the phone,
**5.4×** blocked against 14.9× on render alone.

Smaller and true. Eight and a half seconds of frozen application became a quarter of a second either
way, and the number now describes what the operator would actually have felt.

---
<!-- /ANCHOR:limitations -->

---

## 7. STATE AT HANDOVER

Committed after the fact as `31dce9a`, `fix(views): stop reserving a column where no column
exists`. That is a later decision than this document, which was written while the tree was still
uncommitted; the sentence it replaces was true when written and stopped being true four minutes
afterwards.

| | |
|---|---|
| `npx tsc --noEmit` | exit 0 |
| `npx eslint "tools/**/*.mjs"` | exit 0 |
| `npx vitest run` | 444 passed, exit 0 — baseline |
| `verify-placement` | 186/190, 4 declared red — the baseline count; the phone's third assertion was replaced, not added to |
| `npm run gate` | 14 green, exit 0 — `css-lane` is green again now that `021-sheet-inline-edit-alignment` has landed |
| `npm run bench:list` | PASS, LINEAR at all eight shapes, worst 96.8ms blocked |

Sixteen screenshots declare the renderer in their `sourceHashes`, so `npm run screenshots` was owed
and run. **None of those sixteen changed by a byte** — a third demonstration that the list fixtures
write their own markup and cannot see the renderer. The shots that did change are calendar, timeline
and panel captures that do not list the renderer as a dependency.

**Open:** operator confirmation on device; the row count of the vault that froze; and whether the
desktop reservation should exist at all, which now measures as redundant and is written up in
`spec.md` §8.
