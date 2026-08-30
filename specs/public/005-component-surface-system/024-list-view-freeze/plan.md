---
title: "Implementation Plan: List View Freeze"
description: "Retroactive plan for a shipped fix: hoist a per-row forced layout out of the render loop and make a placeholder reservation surface-conditional."
trigger_phrases:
  - "024 plan"
  - "list view freeze plan"
  - "touch mode hoist plan"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/024-list-view-freeze"
    last_updated_at: "2026-08-30T18:45:00Z"
    last_updated_by: "docs-remediation"
    recent_action: "Authored plan.md retroactively from spec.md, AC and commit 31dce9aa"
    next_safe_action: "Operator confirms on device that the list view opens"
    blockers: []
    key_files:
      - "plan.md"
      - "spec.md"
      - "../../../../src/views/list-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-024-plan"
      parent_session_id: null
    completion_pct: 95
    open_questions: []
    answered_questions: []
---
# Implementation Plan: List View Freeze

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

This plan is a retroactive record, not a forecast. The fix shipped in commit
`31dce9aa` ("fix(views): stop reserving a column where no column exists")
before this document existed; `plan.md` and `tasks.md` were the two files
`validate.sh --strict` reported missing for this Level 1 packet, and this
document closes that gap by describing what was actually built.

Opening a list view blocked the main thread for up to 8,646.0ms at 1,600 rows
(21 properties, 30% fill, desktop), growing with the square of the row count.
Two changes in `src/views/list-renderer.ts` fixed it: hoisting a per-row
`isTouchDevice(container)` call — a forced synchronous layout inside the same
loop that was appending rows to that container — to a single `touchMode`
read at the top of `render()` (line 161) and `renderGrouped()` (line 184);
and replacing a fully-rendered hidden placeholder field with a bare
reservation div, built only where two properties can share a line. Measured
together: **8,646.0ms -> 246.6ms** blocked main thread at the reported shape
on desktop, **1,027.7ms -> 189.2ms** on the phone.

A separate commit, `c31acf5`, was the leading suspect and was exonerated by
measurement: the renderer immediately before it already took 6,777ms on the
same 1,600 rows. It was confirmed as a real amplifier instead — it tripled
field elements from 2,400 to 8,000, adding 6% on the desktop and 28% on the
phone — and that regression is what the placeholder-box change fixes.

**This is not the closing state.** REQ-006 / AC-6 (operator confirms on
device that the list view opens) is recorded `NOT MET` in
`acceptance-criteria.md`: "the report was a person unable to use the
application." `../028-remaining-freezes/` is investigating a second freeze on
non-table views that this phase's fix does not address.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

Recorded in `implementation-summary.md` §7 at the shipped commit. Not
re-run for this document: several sibling phases hold concurrent edits to
shared files (`tools/gate.mjs`, `styles.css`), so a fresh run now would not
describe the state this fix shipped in.

| Gate | Command | Result at ship |
|---|---|---|
| Types | `npx tsc --noEmit` | exit 0 |
| Lint | `npx eslint "tools/**/*.mjs"` | exit 0 |
| Unit | `npx vitest run` | 444 passed, exit 0 — baseline |
| Placement | `node tools/storybook/verify-placement.mjs` | 186/190, 4 declared red — the baseline count |
| Gate | `npm run gate` | 14 green, exit 0 |
| List bench | `npm run bench:list` | PASS, LINEAR at all eight shapes, worst 96.8ms blocked |
| Screenshots | `npm run screenshots` | 16 renderer-dependent shots recaptured; none changed by a byte |

### Definition of Done for this phase

- [x] REQ-001 through REQ-005, REQ-007, REQ-008, REQ-009 satisfied — AC-1 through AC-5, AC-7, AC-8, AC-9 `PASS` in `acceptance-criteria.md`
- [ ] REQ-006 satisfied — AC-6 (operator confirmation) recorded `NOT MET`
- [x] `plan.md` and `tasks.md` written (this pass)
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Root cause

`renderRow` called `isTouchDevice(this.container)` once per row, through
`setupReorderDrag` and `setupGroupedRowDrag`. `isTouchDevice` measures the
container with `getBoundingClientRect()` — a forced synchronous layout — and
it sat inside the same loop that was appending rows to that container. Every
row forced the browser to lay out every row already added: quadratic in row
count.

### The two shipped changes

Both confined to `src/views/list-renderer.ts`:

1. **Hoist the touch-mode read.** A `touchMode` field is now set once at the
   top of `render()` (`:161`) and `renderGrouped()` (`:184`), instead of a
   per-row call. Safe because nothing it reads — platform flags, pointer
   type, container width — can change during one synchronous render, and a
   resize re-renders anyway. Isolated effect: 7,173.5ms -> 185.1ms at 1,600
   rows desktop.
2. **Surface-conditional placeholder.** `renderRowFieldPlaceholder` returns a
   bare `div.db-list-field.is-placeholder` (`aria-hidden`, `grid-column`,
   `--db-card-field-width`) instead of a fully rendered hidden field, and
   only where two properties can share a line. The predicate reads the field
   area's computed `display`, `column-gap` and measured width off the
   element itself — not `touchMode` and not a `body.is-phone` class, both of
   which were tried and measured wrong (a phone in landscape still fits two
   properties per line). The read happens once, on the first built row,
   because an empty field area measures the same 37.9px at every width
   before any row exists.

### What stayed unchanged, on evidence

`listFieldTrackTemplate` still runs per row (immaterial at ~1ms against
84.5ms); the same quadratic in `TableRenderer` is a separate, already
written-up phase; no windowing was added, because both renderers are linear
once the forced layout leaves the loop. Full reasoning in
`implementation-summary.md` §2 (wrapped under its `decisions` anchor).

### An open finding, not acted on

`spec.md` §8 records that forcing the reservation off on every surface left
both desktop alignment checks green — the grid track template and the
explicit per-index `grid-column` already determine placement without the
placeholder. Scope for this phase was frozen on keeping the desktop
reservation, so this is recorded and not acted on; removing it would be a
separate phase.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Retrospective grouping of the work `implementation-summary.md` documents,
in delivery order. See `tasks.md` for the task-level breakdown and evidence.

### Phase 1: Measure the root cause — done
Built `tools/bench/list-render-bench.ts` + `tools/bench/run-list.mjs`,
driving the real `ListRenderer` in headless Chrome across row count, column
count, fill rate and column type. Identified the forced-layout-in-loop root
cause and exonerated `c31acf5` as the freeze's cause while confirming it as
an amplifier.

### Phase 2: Hoist the touch-mode read — done
`touchMode` field set once per render call. Measured in isolation before the
second change landed.

### Phase 3: Surface-conditional placeholder — done
Placeholder box replaces the hidden field; reservation predicate keyed on
the element's own measured width, decided once per render on the first
built row.

### Phase 4: Renderer-driven alignment check — done
`tools/storybook/verify-placement.mjs` section 5k asserts against
`ListRenderer`'s own output rather than the hand-written screenshot fixture.
`column-width.test.ts`'s source-text pin on `field.addClass("is-placeholder")`
was retired in favor of it.

### Phase 5: Review remediation — done
Three defects found in a later review, each reproduced against a threshold
before being fixed: the budget now asserts blocked main thread (render plus
forced layout) instead of render alone; the scaling verdict refuses a
single-row-count sample; `spec.md` SC-001 restated on the blocked-main-thread
number rather than render alone.

### Phase 6: Operator device confirmation — open
Not this phase's to close. `acceptance-criteria.md` records AC-6 `NOT MET`.
`../028-remaining-freezes/` is investigating whether a second cause remains
for non-table views.

### Where stopping is legal

Phases 1-5 already leave the tree better than the shipped freeze: the
row-loop layout is out, the DOM cost dropped from 120,007 to 75,207 nodes at
1,600 rows, and the two harness gaps (renderer-driven alignment, blocked-
main-thread budget) are closed. Phase 6 is a hard stop on this phase's own
authority — it needs a person and a device, not more code.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING

Full criteria, with the command that produced each number, are in
`acceptance-criteria.md`.

| Criterion | Requirement | Result |
|---|---|---|
| AC-1 | Main thread not blocked past budget | **PASS** — 8,646.0ms -> 246.6ms desktop, 1,027.7ms -> 189.2ms phone |
| AC-2 | Linear cost in row count | **PASS** — LINEAR at all eight measured shapes |
| AC-3 | Column alignment on renderer output | **PASS** — section 5k |
| AC-4 | Reserved column costs one element | **PASS** — 3 nodes -> 1 per reserved slot |
| AC-5 | Check observed red on `c31acf5^` | **PASS** |
| AC-6 | Operator confirms on device | **NOT MET** — open |
| AC-7 | Reserved only where a slot exists | **PASS** — 84.0px/card recovered on phone |
| AC-8 | Budget asserts blocked main thread | **PASS** — observed failing first with 5,000ms injected layout |
| AC-9 | No scaling verdict from one sample | **PASS** |

**No regression**, re-run from the final state (`acceptance-criteria.md` §3):
`npx vitest run` 444 passed unchanged; `verify-placement` 186/190 unchanged;
`npm run gate` 14 green unchanged; `npx tsc --noEmit` and
`npx eslint "tools/**/*.mjs"` both exit 0.

**What was not measured**, per `acceptance-criteria.md` §4: a live vault
(the bench excludes the metadata cache and relation rollups — a real
database pays more per field, never less); the operator's actual row count;
`wrap`/compact columns on a wrapping line at scale; whether the desktop
reservation is load-bearing at all (measured redundant on the one shape
checked, not acted on, see `spec.md` §8).
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Needs | State |
|---|---|
| `playwright-core`, `esbuild` (bench harness) | already project dependencies |
| The `styles.css` lane | not needed — this phase took no CSS |
| Operator device access | needed to close AC-6; not yet obtained |
| `../028-remaining-freezes/` | independent; investigates a second, non-table freeze this phase does not touch |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK

The shipped fix is one commit, additive/modify only:
`git revert 31dce9aa` reverts `src/views/list-renderer.ts`,
`tools/bench/list-render-bench.ts`, `tools/bench/run-list.mjs`,
`tools/bench/CODE.md`, `tools/bench/README.md`,
`tools/storybook/verify-placement.mjs` and the three spec docs it carried.
No schema change, no data migration, and no `styles.css` edit to unwind.

Reverting restores the quadratic freeze (measured 8,646.0ms blocked at 1,600
rows) and the pre-`c31acf5^` alignment gap. Trigger: only if the fix is
later shown to regress something the acceptance criteria did not measure —
none is currently known.
<!-- /ANCHOR:rollback -->
