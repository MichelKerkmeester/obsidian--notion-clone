---
title: "Implementation Summary: Remaining Freezes"
description: "Two renderers hoisted, the audit's per-item count corrected, and the attached-container mechanism that resolves the table contradiction."
trigger_phrases:
  - "remaining freezes implementation"
  - "board gallery touch mode hoist"
  - "028 implementation summary"
importance_tier: "critical"
contextType: "implementation"
---
# Implementation Summary: Remaining Freezes
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:what-built -->
## 1. THE TWO CHANGES

### `board-renderer.ts` — decide touch mode once per render

`renderCard` (`:730`) asked `isTouchDevice(this.boardEl)` per card, from three loops
(`:334`, `:583`, `:657`) all appending to the same `cards` container. A `touchMode` field is now
set once in `render()` and read at all three former call sites (`:532`, `:570`, `:786`).

**It is measured on the container, not on `board`.** `.db-board` is `width: max-content`
(`styles.css:8692`), so it grows as each column is appended: a width read from it is a different
number on the first card than on the last, and there is no single value to hoist. The container
is the pane, which is the width `TOUCH_LAYOUT_MAX_WIDTH` was written about.

> **This is a behaviour change and must not be filed as a pure optimisation.** On a narrow
> desktop split pane (< 760px) holding a board wide enough to scroll, the old code measured the
> scroll content, decided "not touch", and made cards `draggable`. The new code measures the pane,
> decides "touch", and does not. That is what `touch-environment.ts:6-10` says it wants — *"container
> width alone must still flip a split pane to touch mode on a wide desktop window"* — so the hoist
> also repairs a latent misdetection. On a real phone nothing changes: `Platform.isMobile` already
> forces touch regardless of width.

### `gallery-renderer.ts` — the same hoist, and the worse defect

Three per-card calls, not one: the resize handle (`:289`), the grouped drag setup (`:435`) and the
reorder drag setup (`:460`). The first has **no read-only guard at all**. All three read
`this.container`, which is already assigned at the top of both `render()` and `renderGrouped()`,
so this hoist is semantically neutral — same element, same value, computed once.

---

## 2. THE AUDIT'S COUNT WAS WRONG

`spec.md` §5 records *33 non-test call sites, 3 per-item, 2 still live*, and names the live two as
`board-renderer.ts:770` and `table-renderer.ts:790`. Re-derived from the call graph rather than
taken on trust:

| Site | Per-item? | Container attached when it runs? | Costly? |
|---|---|---|---|
| `list-renderer.ts:161`, `:184` | per render | — | fixed in `024` |
| `board-renderer.ts:770` | per **card** | **yes** | **yes — fixed here** |
| `gallery-renderer.ts:277` | per **card** | **yes** | **yes — fixed here**, and missed by the audit |
| `gallery-renderer.ts:423`, `:448` | per **card** | **yes** | **yes — fixed here**, and missed by the audit |
| `board-renderer.ts:516`, `:554` | per **column** | yes | minor; fixed by the same field |
| `table-renderer.ts:790`, `:912` | per **row** | **no** | no — see §3 |
| `table-record-peek.ts:90` | per **row** | **no** | no — see §3 |
| `database-view.ts:5087` | per **row** | depends on view | see §4 |
| `cell-renderer.ts:1770`, `:2336` | per editor **open** | — | no |

So the population of genuinely per-item sites is **at least six, not three**, and the gallery — a
whole renderer the audit never opened — carries half of them.
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:decisions -->
## 3. WHY THE TABLE WAS ALWAYS FINE — the contradiction resolves

`spec.md` §7 leaves one contradiction open: the table carries an unfixed per-row forced layout and
measures as the slowest surface, yet the operator says the table works. Both are true, and neither
needed an operator answer.

**A forced layout per item is only quadratic when the container it measures is attached to the
document.** Measured directly, building N cards and reading the container's box once per card:

| rows | container | per-item rect | no rect | penalty |
|---|---|---|---|---|
| 400 | attached | 11.2ms | 2.8ms | ×4.0 |
| 400 | detached | 2.8ms | 2.7ms | ×1.0 |
| 1,600 | attached | 139.4ms | 10.7ms | ×13.0 |
| 1,600 | detached | 11.4ms | 11.8ms | ×1.0 |
| 3,200 | attached | 629.4ms | 26.6ms | ×23.7 |
| 3,200 | detached | 20.9ms | 20.7ms | ×1.0 |
| 6,400 | attached | 3,476.2ms | 43.4ms | **×80.1** |
| 6,400 | detached | 47.6ms | 61.6ms | **×0.8 — free** |

`TableRenderer` builds its body off-document (`table-renderer.ts:139-146`, and the grouped path
does the same) and attaches it once. Its per-row calls therefore flush nothing. The card views
append straight into an attached container, so theirs flush the whole prefix.

**Consequence: hoisting `table-renderer.ts:790` would buy nothing, and `tasks.md` T3.3/T3.4 rest on
a false premise.** It was left alone deliberately — the restraint is the finding, not an omission.
The same reasoning retires T3.5's concern about `table-record-peek.ts:90`.

---

## 4. WHAT WAS DELIBERATELY NOT CHANGED

- **`table-renderer.ts:790`, `:912`** and **`table-record-peek.ts:90`** — per-item but detached, so
  not costly. §3.
- **`database-view.ts:5087`** (`renderRowRecordIcon`) — per row, but it measures `isTouchDevice(icon)`,
  the freshly-created icon element itself. A ~28px box is always under the 760px threshold, so this
  reads `true` unconditionally and `!isTouchDevice(icon)` is dead. That is a correctness bug, not a
  performance one, and fixing it changes what the control does. **Needs an owner decision; not taken
  here.**
- **`table-record-peek.ts:90`** measures the `td` for the same reason and has the same latent issue.
- **`styles.css`** — the lane was not taken.
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## 5. THE CHECKS

Board and gallery, 21 columns at 30% fill, real renderers in headless Chrome, blocked = render +
forced layout. Row ladder deliberately spans the bend; **a run stopping at 400 rows reports
`LINEAR k=0.89` and sees nothing.**

| | 400 | 1,600 | 3,200 | 6,400 | fitted k | steepest segment |
|---|---|---|---|---|---|---|
| board before | 60.9ms | 325.4ms | 858.9ms | 2,990.4ms | 1.38 | 1.80 |
| board after | 44.5ms | 193.0ms | 422.5ms | **1,068.8ms** | **1.14** | 1.34 |
| gallery before | 85.0ms | 774.7ms | 3,308.6ms | 16,700.2ms | 1.89 | 2.34 |
| gallery after | 47.7ms | 194.7ms | 445.1ms | **1,000.7ms** | **1.10** | 1.17 |

Board **2.80×** at 6,400 rows; gallery **16.69×**.

**Control.** Reinstating only `board-renderer.ts:786` — one line, nothing else — returns
`board-bench` to exit 1: 3,200.8ms, fitted k=1.39, steepest segment 1.81. The file was restored and
verified by SHA-256. The gallery's before-numbers are the same control, taken by reverting its three
sites.

**A harness weakness the control exposed and closed.** The first verdict fitted one exponent across
the whole ladder. The defective board fitted **k=1.33 on phone — under the 1.35 threshold, printed
`LINEAR`** — while its 3,200→6,400 segment was 1.74. The fit averages straight across the bend that
is the whole signal. The steepest single segment is now judged too, at 1.5. Both surfaces of the
control now fail; before the change, phone passed.

Commands, exit codes read unpiped:

```
node tools/bench/run-board.mjs   --rows=400,1600,3200,6400 --cols=21 --fill=0.3 --repeats=2   # 0
node tools/bench/run-gallery.mjs --rows=400,1600,3200,6400 --cols=21 --fill=0.3 --repeats=2   # 0
```
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## 6. THE CEILING DID NOT MOVE, AND THAT IS THE POINT

Post-fix board at 6× CPU throttle, 21 columns, 30% fill:

| rows | 800 | 1,600 | **2,400** | 3,200 | 4,800 |
|---|---|---|---|---|---|
| desktop | 600.8ms | 1,169.8ms | **2,329.7ms** | 3,018.7ms | 4,897.1ms |
| phone | 624.7ms | 1,246.1ms | **2,053.8ms** | 3,161.0ms | 4,674.9ms |

**The board still crosses the 2,000ms budget at ≈2,200 rows (desktop) and ≈2,350 rows (phone)** —
interpolated between the 1,600 and 2,400 samples. `024` put the list's crossing at ≈2,300 rows. The
hoist removed a multiplier; it did not move the ceiling, because at ~2,000 rows the render is still
below the bend where the quadratic term dominates and is already spending its budget on plain linear
DOM construction and layout.

**So this fixes neither AC-1 nor AC-3, and does not resolve the operator's freeze.** It removes one
of the two compounding causes. The other is scale, and `goal.md` already names the remedy: a
virtualisation question, not a micro-optimisation one. One sheet interaction is still three full
rebuilds via `DatabaseView.refresh()`, so ≈7s frozen at 2,300 rows on a phone is unchanged.

---

## 7. STATE AT HANDOVER

Not committed, as instructed.

**Changed:** `src/views/board-renderer.ts`, `src/views/gallery-renderer.ts`.
**Added:** `tools/bench/board-render-bench.ts`, `tools/bench/gallery-render-bench.ts`,
`tools/bench/card-bench-driver.mjs` (shared bundle/run/verdict, so the two benches cannot drift into
different thresholds), `tools/bench/run-board.mjs`, `tools/bench/run-gallery.mjs`.

**Not added:** entries in `package.json` — that file is outside this phase's write scope. The
benches run as `node tools/bench/run-board.mjs`. A `bench:board` / `bench:gallery` script beside
`bench:list` is the obvious follow-up for whoever holds that file.

**Verification** — `npx tsc --noEmit` 0 · `npx vitest run` **444 passed** exit 0 ·
`storybook:placement` **202/206, 4 red for a declared reason** exit 0 · `screenshots:verify` exit 0 ·
`scan-comments` PASS exit 0 · `eslint` on both changed files **11 problems before and after,
identical** — this change adds none.

`npm run gate` exits 1 on **`evidence`** only. Not caused by this work:
`tools/live/design-conformance.json` is stale because its own tool
`tools/live/design-conformance.mjs` changed (`d7140f7c0ae5` → `cf38f906d933`) under a concurrent
lane. Its three recorded inputs are `styles.css`, that tool, and `popover-position.ts` — none of
this phase's files. **Re-running it here would stamp another lane's in-progress edit as measured, so
it was left for its owner.**

One transient red is worth recording so the next reader does not chase it: an earlier `vitest` run
failed `screenshot-fixtures.test.ts > photographs every scenario the registry declares` because
`screenshots/manifest.json` was being rewritten by a concurrent agent mid-run. It reconciles at
57 declared / 57 manifest / 0 missing, and the suite is green.
<!-- /ANCHOR:limitations -->
