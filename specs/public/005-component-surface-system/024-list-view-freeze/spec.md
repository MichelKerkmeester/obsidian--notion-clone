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
    last_updated_at: "2026-08-30T15:40:00Z"
    last_updated_by: "fresh-perspective-debug"
    recent_action: "Root cause measured and fixed; the suspected commit was verified as an amplifier, not the cause"
    next_safe_action: "Operator confirms on device that the list view opens"
    blockers:
      - "The stylesheet lane is held by 021-sheet-inline-edit-alignment and its uncommitted edit leaves css-lane red; this phase took no CSS and needs none"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "../../../../src/views/list-renderer.ts"
      - "../../../../tools/bench/list-render-bench.ts"
      - "../../../../tools/storybook/verify-placement.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-024"
      parent_session_id: null
    completion_pct: 90
    open_questions:
      - "How many rows does the operator's database actually hold — the freeze threshold sits between 400 and 1600 and the exact count was never captured"
    answered_questions:
      - "Was c31acf5 the cause? No. The same 1,600-row list took 6,777ms on the commit before it. c31acf5 added 6% on the desktop and 28% on the phone"
      - "Is it volume or cost-per-field? Neither. Both are linear multipliers; the freeze is a forced layout inside the row loop"
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
- What an empty property builds to reserve its column.
- A benchmark that varies fill rate and column count, which nothing did.
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
| `src/views/list-renderer.ts` | Modify | Decide touch mode once per render; reserve a column with an empty box rather than a hidden field |
| `src/views/column-width.test.ts` | Modify | Stop pinning an exact call expression; point at the check that measures the property |
| `tools/bench/list-render-bench.ts` | Add | The list benchmark, varied by fill rate, column count and column type |
| `tools/bench/run-list.mjs` | Add | Drives it at both widths against a declared budget |
| `tools/bench/CODE.md` | Add | Owed once the folder crossed the source-file threshold |
| `tools/bench/README.md` | Modify | Now describes two benchmarks |
| `tools/storybook/verify-placement.mjs` | Modify | Section 5k: the alignment property, measured on the renderer's own output |
| `package.json` | Modify | `bench:list` |
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
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: The 1,600-row desktop render falls from 7,174ms to under 200ms, and the phone render
  from 821ms to under 200ms.
- **SC-002**: Per-row cost reports LINEAR at every measured shape, replacing SUPERLINEAR.
- **SC-003**: The alignment check passes on the renderer's output, and was observed failing on the
  renderer that skipped empty properties.
- **SC-004**: The operator confirms on device. This program's closing condition is operator
  confirmation, never a green check.
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

The placeholders are kept anyway. They are load-bearing on the desktop grid — the check fails without
them, observed — and on any surface wide enough to put two properties on a line. At one empty div
each they now cost little enough that keeping them is cheaper than proving exactly which widths need
them. What is not kept is the claim that they were free.

---

## RELATED DOCUMENTS

- **Parent Spec**: [`../spec.md`](../spec.md)
- **Roadmap**: [`../roadmap.md`](../roadmap.md)
- **Predecessor**: `023-record-note-body`
- **Acceptance Criteria**: See [`acceptance-criteria.md`](acceptance-criteria.md)
- **Implementation Summary**: See [`implementation-summary.md`](implementation-summary.md)
- **Prior art**: `003-ui-improvement-build/023-performance-research` — the same quadratic in the
  table renderer, measured and written up before this one was found
