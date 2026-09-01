---
title: "Feature Specification: List View Freeze"
description: "Stop the list view hanging Obsidian by moving a layout measurement out of the row loop, and stop reserving an empty property's column with a whole hidden field."
trigger_phrases:
  - "list view freezes obsidian"
  - "opening list view hangs"
  - "list render quadratic layout thrash"
  - "empty field placeholder cost"
  - "024 list view freeze"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/024-list-view-freeze"
    last_updated_at: "2026-08-30T19:10:41Z"
    last_updated_by: "criteria-reconciliation"
    recent_action: "Completion anchor reconciled: 4 of 6 criteria evidenced, bench and 5k apart"
    next_safe_action: "Add the is-phone width-sweep reservation check; device stays blocked"
    blockers:
      - "css-lane held by 021-sheet-inline-edit-alignment; this phase needs no CSS"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "../../../../src/views/list-renderer.ts"
      - "../../../../tools/bench/list-render-bench.ts"
      - "../../../../tools/bench/run-list.mjs"
      - "../../../../tools/storybook/verify-placement.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-024"
      parent_session_id: null
    completion_pct: 83
    open_questions:
      - "Operator's actual row count — freeze threshold sits between 400 and 1600, never captured"
      - "Is the desktop reservation worth keeping? Measures redundant when forced off — see spec.md §8"
    answered_questions:
      - "Was c31acf5 the cause? No — exonerated by measurement; see spec.md §2"
      - "Correct predicate for reserving a column? Element width, not touchMode/phone-class; see spec.md §7"
---
# Feature Specification: List View Freeze

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->

> Phase chain: parent [`../spec.md`](../spec.md), predecessor `023-record-note-body`.
> Related: `c31acf5` is the commit this phase was opened to investigate; it is exonerated as the
> cause and confirmed as an amplifier.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P0 |
| **Status** | In Progress |
| **Created** | 2026-08-30 |
| **Branch** | `main` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

The operator, on a shipped build: *"opening list view bugs out obsidian freezes and you cant do
anything"*. Present in 1.3.4 and 1.3.5.

The whole application stops responding, which means the main thread is blocked rather than the view
being merely slow. Measured against the real `ListRenderer` in headless Chrome, on a database shaped
like the operator's — twenty-one properties, most cells empty:

| rows | desktop render | phone render |
|------|---------------|--------------|
| 400 | 500ms | 119ms |
| 800 | 1,840ms | 306ms |
| 1,600 | **7,174ms** | 821ms |

Seven seconds of blocked main thread is the report. Per-row cost rises with row count — ×3.59 from
400 to 1,600 rows — so this is not a large constant, it is the wrong shape.

### Root Cause

`renderRow` calls `isTouchDevice(this.container)` for every row, through `setupReorderDrag` and
`setupGroupedRowDrag`. `isTouchDevice` measures the container with `getBoundingClientRect()`.

That measurement is a forced synchronous layout, and it sits inside a loop that is simultaneously
appending rows to the very container being measured. Every row makes the browser lay out everything
built so far. The work grows with the square of the row count.

Nothing about it is new. It predates the suspected commit and predates the session: the renderer at
`4830275` is byte-identical to the renderer at `c31acf5^`, and that renderer takes **6,777ms** on the
same 1,600 rows.

### What The Suspected Commit Actually Did

`c31acf5` stopped skipping a property with no value and began building it hidden, so that a column is
claimed by index rather than by count. The intent was right and the alignment it bought is real.

Its cost was measured, not assumed:

| | field elements | DOM nodes | desktop 1,600 rows |
|---|---|---|---|
| before `c31acf5` | 2,400 | 52,807 | 6,777ms |
| `c31acf5` (shipped) | 8,000 | 120,007 | 7,174ms |

It tripled the elements in a list and added **6% on the desktop, 28% on the phone**. That is a real
regression and it is fixed here. It is not the freeze. A leading suspect that survives inspection but
dies on measurement is the reason this was measured before it was fixed.

### Purpose

Opening a list view does not block the main thread, at any row count the operator's vault can hold,
and the column alignment `c31acf5` bought survives.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- The per-row layout measurement in `ListRenderer`.
- What an empty property builds to reserve its column, and **on which surfaces it builds anything at
  all**.
- A benchmark that varies fill rate and column count, which nothing did, and **what its budget
  asserts**.
- A geometry check that drives the real renderer rather than a fixture.

### Out of Scope

- The same quadratic in `TableRenderer`, already measured and written up under
  `003-ui-improvement-build/023-performance-research`. This phase fixes the list, and the table is
  untouched.
- Windowing or virtualisation. Both renderers are linear once the forced layout leaves the loop, and
  an asymptote that is already linear does not need one.
- The stylesheet. This fix needed no CSS and took no lane.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/list-renderer.ts` | Modify | Decide touch mode once per render; reserve a column with an empty box rather than a hidden field; reserve only where a column exists to reserve |
| `src/views/column-width.test.ts` | Modify | Stop pinning an exact call expression; point at the check that measures the property |
| `tools/bench/list-render-bench.ts` | Add | The list benchmark, varied by fill rate, column count and column type |
| `tools/bench/run-list.mjs` | Add | Drives it at both widths against a declared budget on the blocked main thread; refuses a slope verdict from one row count |
| `tools/bench/CODE.md` | Add | Owed once the folder crossed the source-file threshold |
| `tools/bench/README.md` | Modify | Now describes two benchmarks and what the budget covers |
| `tools/storybook/verify-placement.mjs` | Modify | Section 5k: the alignment property, measured on the renderer's own output, with a surface-shaped third assertion |
| `package.json` | Modify | `bench:list` |
| `screenshots/**` | Modify | Recapture, because the renderer's source hash is a declared dependency of sixteen shots |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Opening a list view does not block the main thread past a declared budget | AC-1 |
| REQ-002 | Render cost is linear in row count, not superlinear | AC-2 |
| REQ-003 | A property starts in the same column on every card, still | AC-3 |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Reserving a column costs one element, not a rendered field | AC-4 |
| REQ-005 | A check exists that measures the renderer's own output, and has been observed red | AC-5 |
| REQ-006 | The operator confirms on device that the list view opens | AC-6 |
| REQ-007 | A slot is reserved only where a slot exists to reserve, on every surface and at every width | AC-7 |
| REQ-008 | The performance budget asserts the whole blocked main thread, not the half of it the fix moves work out of | AC-8 |
| REQ-009 | The scaling verdict is not printed from a single sample | AC-9 |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Opening a list view stays inside the 2,000ms budget on the **blocked main thread** —
  render plus forced layout — at the reported shape. Measured 8,646.0ms before and 246.6ms after on
  desktop, 1,027.7ms before and 189.2ms after on the phone. This criterion previously read "render
  falls from 7,174ms to under 200ms", which is the wrong half **for this repair specifically**: the
  fix works by moving a forced layout out of the row loop, so it moves cost from the term that was
  under budget into the term that was not, and the excluded term is consistently the larger of the
  two. Stated on render alone the criterion credits the fix with work it relocated, and its 200ms
  threshold is one a correct implementation fails at 246.6ms. AC-8 is where that was caught.
- **SC-002**: Per-row cost reports LINEAR at every measured shape, replacing SUPERLINEAR.
- **SC-003**: The alignment check passes on the renderer's output, and was observed failing on the
  renderer that skipped empty properties.
- **SC-004**: The operator confirms on device. This program's closing condition is operator
  confirmation, never a green check.
- **SC-005**: A card whose field area fits one property per line carries no field line that shows
  nothing; every wider surface keeps its alignment, and the desktop card's column alignment and
  field-area width are unchanged to the pixel.
- **SC-006**: A render that blocks the main thread past the budget fails it, whichever of render or
  forced layout the time was spent in.
- **SC-007**: A run with one row count prints no scaling verdict.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Deciding touch mode once per render could stale if the container resizes mid-render | Low | Nothing it reads — platform, pointer type, container width — can change during a synchronous render; a resize re-renders |
| Risk | An empty box is not a hidden field, and sizes differently where width comes from content | Med | The default field takes its width from `--db-card-field-width` via `flex: 0 0`, so the box is identical; the wrap and compact modes size from content, where per-column alignment is not a property that exists |
| Risk | The phone arm of the alignment check cannot fail | High | Reported in the check's own output rather than left as a silent green — see §7 |
| Dependency | `tools/storybook/verify-placement.mjs` is being edited concurrently by `021-sheet-inline-edit-alignment` | Med | Section 5k was appended, not rewritten; both sections verified present and passing together |
| Dependency | The `styles.css` lane, held by `021` | None | This phase took no CSS |
<!-- /ANCHOR:risks -->

---

## 7. WHY NOTHING CAUGHT THIS

Three checks covered this code and none of them could see a renderer regression.

**The screenshot fixture writes its own markup.** `list-sparse-fields` in
`tools/screenshots/scenarios/core.mjs` builds `db-list-field` divs by hand and imports nothing from
`src/`. It is the only fixture with rows missing a subset of their properties, and it cannot execute
the renderer, so it reported green while the renderer tripled its output.

**The unit test asserted on source text.** `column-width.test.ts` checked that the renderer's source
contained the string `field.addClass("is-placeholder")`. That is a spelling, not a property. It
passes for a correct implementation and an implementation that renders a hidden field per empty cell
on every row of a 1,600-row list, and it fails for a correct implementation that spells it
differently — which is what it did here.

**The geometry check measured the fixture.** Section 5j of `verify-placement.mjs` reads real
x-positions in a real browser, which is the right instrument pointed at the wrong thing: the
hand-written markup, not the renderer.

Section 5k is the repair: the same two properties, asserted against `ListRenderer`'s own output, plus
a third that fails if a reserved column ever again carries rendered content.

### A second finding, from building that check

The fixture also **overstates the phone's field area**, because it omits the row controls the
renderer always builds — the selection checkbox, the open button, the move button. On a 402px phone
the renderer's field area measures **240px**, not the fixture's wider box.

At 240px exactly one property fits per line. Every property therefore sits at x=0 on every card,
with placeholders and without them: measured on both renderers, the spread is identical and the card
widths are identical at 240px. **The column alignment `c31acf5` was written to buy is not observable
on a phone at that width.** The "fourteen x-positions on twelve cards" that justified it was measured
on a fixture whose field area is roughly twice the real one.

The placeholders were kept anyway, on the argument that at one empty div each they cost little
enough that keeping them everywhere was cheaper than proving which widths need them. That argument
was wrong, and a later review priced it: on a phone an empty div is not free, because the row is a
wrapping flex line and the div takes a whole wrapped line plus the 6px row gap under it. On the
reported database that is **84px of dead height per card** — a twelve-card list measuring 3,131px
where the same data on the pre-reservation renderer measures 2,123px. Half the scrolling was boxes
nobody can see.

They are now built only where two properties can share a line — a grid always, a wrapping line only
when the field area is wide enough for a pair. Where one property fills a line on its own there is
nothing to hold, and that is the only case where they are dropped. The first attempt keyed this on
the phone class instead and was measured breaking alignment the moment the phone was turned
sideways; the sweep that caught it is in `acceptance-criteria.md` AC-7.

See §8 for a second measurement that landed at the same time and is not yet acted on.

---

## 8. THE DESKTOP RESERVATION MAY ALSO BE REDUNDANT — MEASURED, NOT ACTED ON

This is a finding, not a change. It is recorded because the next person to touch this code will
otherwise re-derive it, and because it contradicts something this document previously asserted.

Making the reservation surface-conditional needed a control in both directions: the phone must lose
its reserved boxes, and the desktop must keep its alignment. The second control forced
`reservesColumns` to `false` on every surface and re-ran section 5k. The expected result was two red
desktop alignment checks. The actual result:

```
PASS  on desktop the renderer gives every list card the same field-area width
        12 rendered cards ... take 1 distinct meta width(s): 616px
PASS  on desktop the renderer starts a property in the same column on every card
        4 properties across 12 cards; worst lands in 1 column(s)
FAIL  on desktop a reserved column costs one element and no rendered content
        0 reserved columns hold 0 child element(s)
```

The alignment held with nothing reserved. Only the assertion that *counts* reservations went red,
and that one goes red by construction when there are none.

The reason is in the commit. `c31acf5` introduced three things at once: `gridTemplateColumns` from
`listFieldTrackTemplate`, an explicit `gridColumn: index + 1` on every field, and the hidden-field
placeholder. A track exists whether or not anything sits in it, and each field is placed in its own
track by index, so the placement is already fully determined without the placeholder. This phase's
own "observed red" control ran `c31acf5^`, which removed **all three** — so it proved that the
commit as a whole buys the alignment, never which part of it does.

What that would be worth: 22,400 empty divs at 1,600 rows, and 75,207 DOM nodes against 52,807.

Why it is not done here. The brief for this remediation states the desktop reservation as
load-bearing and asks for a surface-conditional fix, and scope is frozen. The measurement above is
narrow besides — four non-wrapping columns, twelve cards, default field mode. A `wrap` column
declares a `max-content` track that collapses to zero when empty, and compact mode declares
`fit-content`; neither was measured here, and both are shapes where "the track exists regardless"
needs re-testing before anyone removes anything. That is a phase, not an aside.

---

## RELATED DOCUMENTS

- **Parent Spec**: [`../spec.md`](../spec.md)
- **Roadmap**: [`../roadmap.md`](../roadmap.md)
- **Predecessor**: `023-record-note-body`
- **Acceptance Criteria**: See [`acceptance-criteria.md`](acceptance-criteria.md)
- **Implementation Summary**: See [`implementation-summary.md`](implementation-summary.md)
- **Prior art**: `003-ui-improvement-build/023-performance-research` — the same quadratic in the
  table renderer, measured and written up before this one was found
