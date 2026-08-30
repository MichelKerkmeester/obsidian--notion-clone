---
title: "Acceptance Criteria: Remaining Freezes"
description: "Every criterion with the command that produced its number, the failing value recorded first, and the control that proves the check can go red."
trigger_phrases:
  - "remaining freezes acceptance criteria"
  - "board renderer forced layout threshold"
  - "phone cpu throttle render budget"
  - "028 acceptance"
importance_tier: "critical"
contextType: "verification"
---
# Acceptance Criteria: Remaining Freezes

Every number below was read from a command's output in this repository. Where a criterion has no
number yet it is marked **Blocked**, not Unmet, and the thing that produces it is named. Do not
invent one.

---

## 1. THE MEASUREMENTS

### 1A. The shipped bench, past its ceiling

```
npm run bench:list -- --rows=400,1600,3200,6400,12800 --cols=21 --fill=0.3 --repeats=3
```

Twenty-one columns and 30% fill because that is the reported database's shape; the fixture column
list in `tools/bench/list-render-bench.ts:41` was taken from the operator's own report. **Read the
exit code unpiped** — `cmd >log 2>&1; echo $?` — because a pipe reports the pipe's status.

The default invocation stops at 400 rows and the highest previously recorded run was 1,600. Both sit
below the bend. **A run that does not pass `--rows` past 3,200 cannot observe this defect.**

### 1B. Phone-class CPU, and list against table

The bench's "phone" surface is a 390px viewport in desktop Chrome on an M-series Mac — a phone
*width*, not a phone *CPU*. The operator interacts through bottom sheets, so the device that froze is
a phone. The comparative driver bundles the real `ListRenderer` and the real `TableRenderer` through
`esbuild` into the same headless Chrome, applies CDP `Emulation.setCPUThrottlingRate`, and measures
render plus the forced layout that follows:

```js
const cdp = await page.context().newCDPSession(page);
await cdp.send("Emulation.setCPUThrottlingRate", { rate });   // 1, 4, 6
```

It lives beside this file as `compare-bench.ts` and `run-compare.mjs`, outside `tools/` because it
was written to answer this phase's question and has not earned a place in the gate. Run it from the
repository root; it resolves `esbuild` and `playwright-core` from the repo's own `node_modules`
through `createRequire`.

**Two honesty notes that must travel with any quotation of these numbers.**

- The table's `renderCell` is stubbed to `td.setText(String(...))`, constant time — the same stub the
  shipped `tools/bench/table-render-bench.ts:73` uses. So the table figures **exclude
  `cell-renderer.ts` entirely** and flatter the table. The real table is slower than shown.
- The throttle rate is a **stand-in for a phone, not a measurement of one**. 6× is a common
  mid-range-device approximation; it is not the operator's device. AC-1's threshold is stated at a
  named rate for that reason, and §7 of `spec.md` asks for the real shape.

---

## 2. CRITERIA

### AC-1 — One full-view rebuild stays inside the freeze budget at phone-class CPU

The budget is 2,000ms of blocked main thread, the constant `tools/bench/run-list.mjs:44` already
declares, and it is asserted on **render plus forced layout** because nothing the user experiences
distinguishes the two.

Recorded failing, list view, 21 cols, 30% fill, 6× throttle:

| rows | render | layout | **blocked** |
|---|---|---|---|
| 400 | 96.1ms | 196.2ms | 292.3ms |
| 1,600 | 487.2ms | 803.3ms | **1,290.5ms** |
| 3,200 | 1,135.5ms | 1,854.5ms | **2,990.0ms** |

Crossing point ≈ **2,300 rows**. At 1× the same shape crosses at ≈10,000 rows, which is why every
previous reading missed it.

**Status: Unmet.** Threshold: blocked < 2,000ms at the operator's confirmed shape (Q1/Q2) at 6×.

### AC-2 — The per-item forced layout is gone from the two live sites

`isTouchDevice(container)` reaches `getBoundingClientRect()` via `getContainerWidth`
(`touch-environment.ts:30`). Two sites still call it once per item inside the loop appending those
items:

| Site | Enclosing | Called from |
|---|---|---|
| `board-renderer.ts:770` | `renderCard` (`:730`) | loops at `:334`, `:583`, `:657` |
| `table-renderer.ts:790` | `renderRow` | the row loop |

**Today: 2 of 3 per-item sites unfixed.** `024` closed the third pair
(`list-renderer.ts:161`, `:184`).

**Control, and it is required.** Before hoisting either, measure that site's renderer on the current
tree and record the number. After hoisting, the same measurement must move. A site whose
before-number was never recorded cannot be distinguished from one that never had the defect —
`024` §5 records this program learning that the expensive way.

**Status: Unmet** for the sites; **Blocked** for the after-numbers, which Stage 3 produces.

### AC-3 — Scaling is not SUPERLINEAR at any measured shape up to 12,800 rows

The runner already prints this verdict and already refuses to print one from a single row count
(`run-list.mjs`: `NO VERDICT — a slope needs two row counts`).

Recorded failing:

| shape | verdict |
|---|---|
| list, desktop, 21 cols, 30% | `SUPERLINEAR (per-row ×2.55)` |
| list, phone width, 21 cols, 30% | `SUPERLINEAR (per-row ×3.21)` |
| table, 21 cols, 30% | ×4.5 per-row (0.0755 → 0.3416 ms/row) |

**Status: Unmet.** Threshold: `LINEAR` or `SUBLINEAR` at every shape in the 1A matrix.

### AC-4 — A sheet round trip costs one rebuild, not three

Open a sort sheet, add a rule, dismiss it. Today that reaches `DatabaseView.refresh()` from the add
(`sort-panel-renderer.ts:88`) and again from the dismissal (`database-view.ts:2816`, or `:2916` when
dismissed by an outside click), and `refresh()` re-renders the panel a second time at `:11458` on top
of the panel render the add handler already did.

**Status: Blocked.** No instrument counts `refresh()` invocations per interaction. Stage 1 adds one;
until then the count is read from the call graph, which is evidence of reachability, not of
frequency.

### AC-5 — The table is still the control, and the boundary is explained

Whatever is fixed must account for the table having been fine. Today it is not accounted for:
measurement says the table is the **slowest** surface here —

| rows | list blocked | table blocked |
|---|---|---|
| 1,600 | 196.1ms | 293.8ms |
| 3,200 | 429.2ms | 712.6ms |
| 12,800 | 2,665.3ms | **5,641.7ms** |

— while building ~10% fewer nodes, with its cell renderer stubbed out, and carrying the *only*
unconditional per-row forced layout of the three (`table-renderer.ts:790` puts the touch call in the
left operand, so unlike list and board it never short-circuits).

**Status: Blocked on the operator.** Closes when Q1–Q3 in `spec.md` §7 are answered and the answer
either explains the boundary or retires it. **This criterion may not be closed by argument.**

### AC-6 — The four refuted hypotheses stay refuted

Recorded so a later reader does not re-spend the budget: the card pipeline (AC-5's table numbers),
`syncCardRoving` (`card-roving-tabindex.ts:368-377`, one `querySelectorAll` and a linear pass), the
`ResizeObserver` re-entry (`database-view.ts:1345`, guarded on an actual flip),
`findVisibleAnchor` (`database-viewport.ts:161-175`, early-returns, no interleaved writes), table
pagination (does not exist), and column-visibility asymmetry (same
`getVisibleColumns(...)` call for both).

**Status: Met**, as a record. Re-open only with a measurement.

---

## 3. WHAT THE INSTRUMENTS CANNOT REACH

Stated because a gap read as a pass is how this program got here.

- **The screenshot fixtures cannot see any of this.** They render hand-written markup and import
  nothing from `src/`; `024` §7 records sixteen captures declaring the list renderer as a source and
  **not one changing by a byte** after the renderer was rewritten. This is the third demonstration.
- **`tools/bench/*` emit timings, not assertions**, and drive one action bag. `run-list.mjs` does
  assert a budget and exit non-zero; `run.mjs` does not.
- **No gate check constructs a production renderer.** 14 checks, zero. That gap is `026`'s phase —
  do not rebuild it here.
- **Nothing measured is the operator's device.** Every number here is synthetic, at a chosen
  throttle, on a fixture. The operator's confirmation remains the only proof.
