---
title: "Acceptance Criteria: Mobile Touch Semantics in the Table"
description: "The measurable contract for giving a touch in the table the meaning a touch has: what each criterion measures, the number or hit test that decides it, and the negative control that proves the check can fail."
importance_tier: "critical"
contextType: "planning"
---
# Acceptance Criteria: Mobile Touch Semantics in the Table

> Phase [`spec.md`](spec.md). Each criterion carries a number or a hit test with a threshold, a
> check that drives the shipped code rather than a reproduction of it, and a negative control that
> was watched going red before the criterion was trusted.

## 1. WHAT THE INVENTORY FOUND

Written before any change, because three of these facts contradict the phase report and one of them
would have sent a fix at the wrong defect.

### 1.1 The range is painted by two taps, not by a drag

`device-range-select-on-touch.png` shows a **7-row by 2-column block — 14 cells**. The phase
description attributes it to dragging. It is not a drag.

The 14 is measured, not counted by eye. The file is 1206 by 2622 device pixels, a 402 by 874 CSS
viewport at DPR 3. The block's outer border runs `y 1116-1121` and `y 1824-1829`, a border box of
714 device pixels = **238 CSS pixels = exactly seven 34px rows**. The same scan gives the row pitch
directly: the six text bands inside the block sit 102 device pixels apart, which is 34 CSS pixels.
That is an **independent confirmation of the 34px default density** in §1.5, which until now was
inferred from the stylesheet alone. Seven labels are enclosed — `33 • Sep '27`, `15 • Mar '26`,
`03 • Mar '25`, `17 • May '26`, `31 • Jul '27`, `13 • Jan '26`, `32 • Aug '27` — with the focus
double-ring on the last row's **Income** cell. The enclosed columns are **Month** and **Income**.

Both cell-selection owners already special-case touch, and both already disable drag there:

| Owner | Line | What the touch branch does |
| --- | --- | --- |
| `src/views/database-view.ts` | 4578-4588 | `isSelectingCells = false`, then extends `focus` from the **existing anchor** |
| `src/views/embedded-database-renderer.ts` | 3815-3825 | `isSelectingCells = false`, then extends `focus` from the **existing anchor** |

`isSelectingCells = false` makes the `mouseenter` extend handler return immediately, so a finger
dragging across cells paints nothing. What paints the block is the line above it: when a selection
already exists, a second tap keeps the old anchor and moves the focus. **Touch is wired as
"shift is permanently held."** Two taps six rows down and one column across — enclosing seven rows
and two columns — produce exactly the screenshot.

A fix aimed at drag would have left the defect completely intact.

### 1.2 There are two pointer owners, not three

The phase names `table-renderer.ts` as a third. It binds no cell selection. It is the shared table
builder both views call, and it delegates cell wiring through a `renderCell` callback. Its
`isTouchDevice` uses are **three**, not the two first written here:

| Use | What it decides |
| --- | --- |
| `getSelectionColumnWidth` | selection checkbox column width, 48px touch / 40px pointer |
| `renderMobileMoveButton` gate | renders the touch move button when manual reorder or group move is available |
| drag-handle guard | returns early on touch, so the pointer drag handle is not built |

The third was missed on the first pass, in the very file this section was auditing. It is the
counterpart of the guard beside it: the drag handle is suppressed on touch and the move button is
the affordance that replaces it, so describing only the suppression made the file look like it took
something away without giving anything back.

None of the three is input semantics, and this phase changes none of them. The conclusion is
unchanged.

The column-width branch was misread once during this work as the row height. It is not: row height
comes from CSS (§1.5), and taking 48px from here would have put a fictional number in front of AC-5.

So the contradiction risk is between **two** files, and both are fixed through one shared module.

### 1.3 A tap already opens an editor for four column types

`cell-renderer.ts:557` `opensPickerOnClick` returns true for `select`, `status`, `date` and
`datetime`, and `makeEditable`'s `click` handler opens the editor for those on a single click —
which a tap already produces. Every other editable type is bound to `dblclick` only
(`cell-renderer.ts:548`), and a phone has no double-click.

The defect is therefore narrower than "touch does the wrong thing": four types are already correct,
and the work is to bring the rest to the same behaviour without changing what a mouse does.

### 1.4 The record sheet already exists and is already reachable — through a 24px target

`device-sheet-from-row.png` is `openRecordDetailPanel`, reached from `attachTitleOpenAffordance`
(`table-record-peek.ts:68`) via `database-view.ts:8439`. On touch it renders as an icon button,
`width: 24px` and `min-height: 24px` (`styles.css:18680`, `18637`).

24 by 24px is **576px<sup>2</sup>**. WCAG 2.5.5 and the thumb floor in `sk-design`
`references/interaction-craft.md` §3 both ask for 44 by 44, which is **1936px<sup>2</sup>**. The
existing target is **29.8%** of the required area. The operator's sentence — "for the main item it
will open the sheet" — asks for the cell, not the icon inside it.

### 1.5 No table row on a phone reaches the thumb floor, at any density

Row height is `var(--db-row-height)` on `.db-table td` (`styles.css:4777`), and the three densities
are the only values it takes (`styles.css:95-97`):

| Density | Height | Against the 44px floor |
| --- | --- | --- |
| compact | 28px | 64% |
| **default** | **34px** | **77%** |
| comfortable | 40px | 91% |

There is no phone override. So even the loosest density leaves a row 4px short, and the one a user
gets by default is 10px short.

**The 34px is no longer only a reading of the stylesheet.** It is confirmed twice from outside the
CSS. The operator's screenshot has a row pitch of 102 device pixels at DPR 3 — 34 CSS pixels — and
its selection block is exactly seven of them (§1.1). The harness independently renders the title
cell at `169x34` and prints it in AC-5's detail line on every run. Three sources, one number, and
the two that matter most are measurements of what the user actually saw rather than of what the
stylesheet says they should have seen.

This is real and it is **escalated, not fixed here**. Row height is a density preference the user
sets, it governs every column in every view, and changing it is presentation rather than input
semantics — outside what this phase was scoped to touch. AC-5 therefore gates on the target the
change actually delivers and reports the height alongside it, rather than quietly gating on a number
the change cannot reach.

### 1.6 Row-checkbox range selection has the same defect and is deliberately left alone

`database-view.ts:4438` and `embedded-database-renderer.ts:3105` both read
`range: Boolean(event?.shiftKey || isTouchDevice(...))` — the same "touch means shift" mistake on a
different control. It is **out of scope**: the operator reported cells, the screenshot shows every
row checkbox unticked, and removing it would leave a phone with no way to range-select rows at all.
Recorded here so the next phase does not have to rediscover it.

## 2. WHERE THE PHONE PREDICATE BELONGS

The phase asks whether input should key off the same predicate as presentation. It should not, and
the disagreement a previous agent flagged as unresolved is not a defect to resolve.

| Predicate | Definition | Question it answers |
| --- | --- | --- |
| `isTouchDevice(container)` | `platformTouch \|\| coarsePointer \|\| width <= 760` | **Layout** — how big should this be |
| `isMobileBottomSheet(doc)` | `innerWidth <= 600 && (touchPoints > 0 \|\| coarsePointer)` | **Presentation** — is this surface a sheet |
| `pointerType` on the event | per-gesture, from `pointerdown` | **Input** — what does *this* press mean |

The two existing predicates are allowed to disagree because they answer different questions, and each
is right about its own. 760 with `OR` is correct for layout: a 700px split pane on a 1600px desktop
window *should* get 48px rows. 600 with `AND` is correct for presentation: a surface only becomes a
bottom sheet when the viewport is phone-sized and the device can be touched.

Neither can answer the input question, and two cases prove it:

- **A desktop window with a narrow split pane.** `isTouchDevice` returns true for a 700px pane driven
  by a mouse. Today that means a desktop mouse user in a narrow pane is already routed into the touch
  branch and already has no working shift-click. Keying tap-to-edit off the same predicate would take
  their cell selection away entirely.
- **A tablet with a trackpad.** One device, two correct answers: a trackpad drag should paint a
  range, a finger drag on the same screen should not. No device-level predicate can return two
  answers for one device.

So the missing predicate is a third one, and it is per-event. `PointerEvent.pointerType` is the only
thing that knows which input produced a given press. This keeps desktop unchanged **by construction**
rather than by breakpoint: a mouse press is routed to the pointer grammar at every viewport width, on
every device, including ones that measure as touch.

## 3. THE CRITERIA

Every check runs inside `tools/storybook/verify-placement.mjs`, which bundles the real `src/` modules
with esbuild and drives them in Chromium at `viewport 390x844, hasTouch, isMobile`. Each check's
detail line prints `window.innerWidth` so a probe that silently laid out at 980px cannot pass as a
phone.

**Each criterion names its check by the check's own `name:` string, not by line number.** That file
is edited by other phases in the same program, so a line number written here is wrong by the next
commit; the name is stable and greppable. The thresholds below were re-read against the checks
themselves after three of them were found describing assertions the code does not make.

### AC-1 — A tap never extends a range

**Check.** `a second tap picks one cell while a mouse still paints the range`.

**Measure.** Drive the shipped `nextCellRange` with a real touch press on cell A, then on cell B
seven rows down and one column across — a span of eight rows by two columns. Count the cells the
resulting range covers over the rendered row and column order.

**Threshold.** `cells === 1`. The anchor must equal the focus.

**Before.** 16 cells, from the harness's own span of 8 rows by 2 columns.

**The harness span is not the screenshot's span, and the two must not be conflated.** The screenshot
is 7 rows by 2 columns = 14 cells (§1.1); the check drives 8 by 2 = 16. Same defect, same mechanism,
one row more. The check is a reproduction of the behaviour, not of the image.

**Negative control.** Same two presses with `pointerType: "mouse"` and `shiftKey: true` must still
produce 16. A check that reports 1 for both is measuring nothing.

### AC-2 — A mouse still extends a range, at phone width

**Check.** `shift-extend still works at 390px with touch reported present`.

**Measure.** At `390x844` with `hasTouch` and `isMobile` both on — the most hostile setting for the
constraint — drive `nextCellRange` with `pointerType: "mouse"` and `shiftKey: true`, across **8 rows
by 3 columns**.

**Threshold.** `cells === 24`, and the anchor column is still `file.name`.

**The 16 belongs to a different check.** "16 before, 16 after" traces to the mouse half of AC-1's
pair, `a second tap picks one cell while a mouse still paints the range`, which spans 8 rows by 2
columns. This criterion's own check spans one column wider and asserts 24. Both are live and both
are green; they were merged into one sentence here, and the sentence claimed a threshold this check
does not assert.

This is the desktop-must-not-change constraint stated where it is hardest to satisfy. Passing it at
390px proves the routing keys off the gesture and not off the viewport.

### AC-3 — The gesture reader routes real events, not a reproduction

**Check.** `a table cell reads its gesture from the pointer event, not from the device`.

**Measure.** Bind the shipped `trackCellGesture` to a real `<td>` in the document. Read it at rest,
then dispatch genuine `PointerEvent("pointerdown", …)` for `touch`, `mouse` and `pen` in turn,
reading after each.

**Threshold.** Four values from one binding, not two: `at rest = "mouse"`, `after touch = "touch"`,
`after mouse = "mouse"`, `after pen = "touch"`. The resting value and the pen value were both
asserted in the check and both omitted from this criterion when it was first written.

`pen` maps to `"touch"` deliberately: a stylus is a direct-manipulation input with no hover-and-
shift grammar behind it, so it gets the touch meaning rather than the pointer one.

**Negative control.** With no `pointerdown` dispatched at all the reader must report `"mouse"`, and
the check must fail if it reports `"touch"` — otherwise a reader hardcoded to `"touch"` would pass
AC-1 and AC-3 together.

### AC-4 — A tap on the title cell resolves to the record sheet, every other cell to its editor

**Check.** `a tap edits its column and the main item opens the record, while a click does neither`.

**Measure.** Drive the shipped `resolveCellTapAction` across the truth table. It has **five** rows,
not the four written here first.

**Threshold.**

| gesture | title cell | editable | action |
| --- | --- | --- | --- |
| touch | yes | yes | `open-record` |
| touch | no | yes | `edit-cell` |
| touch | no | no | `select-cell` |
| mouse | yes | yes | `select-cell` |
| mouse | no | yes | `select-cell` |

The last two rows are the constraint, and both are needed. Row four says a mouse click on the title
cell must keep doing what it does today; row five says the same for every other cell, which is what
stops the resolver from routing a desktop click into the editor. The results row already reported
"5 of 5"; only this table was short.

### AC-5 — The whole title cell opens the record, not the icon inside it

**Check.** `a tap anywhere in the title cell opens the record, and a click there still does not`.

**Measure.** Build a phone-width table, run the shipped `attachTitleOpenAffordance` on the title cell
so the real button is present, then press at a point in the cell **40px to the left of the button's
left edge** — a place that is unambiguously cell and unambiguously not button. Route that press
through the shipped `trackCellGesture` and `resolveCellTapAction`.

**Threshold.** The press resolves to `open-record`, and `elementFromPoint` at that coordinate lands
inside the title cell rather than on the button.

**Before.** The only element that opens the record is `.db-record-open-btn-icon`, `width: 24px`,
`min-height: 24px` — **576px<sup>2</sup>**, versus the 44 by 44 = 1936px<sup>2</sup> the thumb floor
asks for. A press 40px to its left resolved to nothing.

**Negative control.** The same press with `pointerType: "mouse"` must resolve to `select-cell`. A
check that reports `open-record` for both is measuring the cell's identity and not the gesture.

**Reported alongside, not gated.** The cell's rendered height, against the 44px floor. Per §1.5 the
best a row reaches is 40px and the default is 34px, so this criterion cannot honestly gate on 44 in
the vertical axis. The number is printed on every run so the shortfall stays visible.

### AC-6 — A tap does not fight the sheet's dismissal

**Check.** `while a record sheet is open the backdrop takes the tap, not the cell under it`.

**Measure.** Apply the shipped `applySheetChrome(panel, true)`, then call `elementFromPoint` at the
centre of a visible table cell.

**Threshold.** The backdrop exists, its computed `pointer-events` is not `none`, and the coordinate
resolves to something that is **not** a `<td>`.

This is what makes the constraint structural rather than a handler-ordering argument: while a sheet
is up, a cell's coordinates belong to the backdrop, so the press that dismisses cannot also reach a
cell and open an editor on the way out.

**Negative control.** The same check with the module's own documented opt-out,
`{ scrimCapturesPointer: false }`, must go red. It does, reporting
`pointer-events=none ... resolves to <td>` — the leak, reproduced.

### AC-6b — A tap that opens an editor does not scroll the table — UNVERIFIED

Reported honestly rather than claimed. The production `mousedown` handler is a method on
`DatabaseView`, which needs a live Obsidian `App`, vault and metadata cache, so it cannot be bundled
into the browser harness the way the gesture modules can. Driving a copy of it would prove the copy.

What is established by reading, and no more than that: the handler calls `preventDefault()` before
routing; the touch path no longer calls `td.focus()` at all in the main view; and the embedded
view's `focusEmbedCell` uses `focus({ preventScroll: true })` followed by
`scrollIntoView({ block: "nearest" })`, which is a no-op for an element the finger just landed on.
A tap with no movement does not scroll on its own. None of that is a measurement.

### AC-7 — The long-press row menu survives

**Check.** `a held press still opens the row menu and a tap still does not`.

**Measure.** `attachLongPress` binds `pointerdown`, `pointermove`, `pointerup`, `pointercancel` and
`pointerleave` with a 450ms timer (`touch-environment.ts:82`). Hold a press for longer than the delay
without moving beyond the 10px tolerance and confirm the callback fires; then confirm a press
released before the delay does not fire it and does route as a tap.

**Threshold.** Long press fires exactly once at >450ms; a 100ms press fires zero long-presses and
exactly one tap.

### AC-8 — The gate stays green

**Threshold.** `SURFACE_PHASE=012-mobile-touch-semantics npm run gate` exits **0**, with all 13
checks green. Exit status is read from `$?` of the unpiped command, or captured to a file — never
through a pipe, which reports the pipe's status.

**Baseline.** 13 green, exit 0, measured before any edit.
**Placement baseline.** 69/70, 1 red for a declared reason.

**Observed.** Exit **1**, 12 of 13 green. `css-lane` is now green; `screenshots-fresh` is red. Read
from `$?` of the unpiped command, twice, about fifteen minutes apart, with the same result. The
threshold asks for exit 0 and this is not exit 0, so the criterion is **FAIL** — see §4.2 for whose
red it is. Recording it as a pass because the failure is attributable elsewhere would be exactly the
absorption this program's lane discipline exists to prevent.

## 4. RESULTS

| Criterion | Result | Evidence |
| --- | --- | --- |
| AC-1 tap never extends | **PASS** | harness span 8 rows x 2 columns: 16 cells → 1; anchor equals focus |
| AC-2 mouse still extends at 390px | **PASS** | 24 cells across 8 rows x 3 columns, anchor held at `file.name` |
| AC-3 gesture read from the event | **PASS** | rest=mouse, touch=touch, mouse=mouse, pen=touch |
| AC-4 tap truth table | **PASS** | 5 of 5 rows |
| AC-5 whole title cell opens the record | **PASS** | press 40px left of the button → `open-record`; click → `select-cell`; cell 169x34 vs button 24x24 |
| AC-6 tap does not fight the sheet | **PASS** | cell centre resolves to `db-mobile-sheet-scrim`, `pointer-events: auto` |
| AC-6b tap does not scroll | **UNVERIFIED** | not measurable without a live Obsidian `App` |
| AC-7 long-press survives | **PASS** | 100ms → 0, 600ms → 1, `isTouchDevice(row)=true` |
| AC-8 gate | **FAIL** | exit 1, 12 of 13 green; `screenshots-fresh` red for another phase's stylesheet edit, §4.2 |

Placement at the last run: **79/80**, exit 0, the same single declared red as the 69/70 baseline. The
durable figure is this phase's own contribution — **seven checks added, seven green, no new red**.
The total moves as other phases add checks: it was 76/77 when this section was first written and
79/80 after `014-desktop-select-checkbox` added three, so the ratio is a reading of the file at a
moment rather than a fact about this phase.

AC-5's detail line reports the rendered cell as `169x34`, which is a **third** independent
confirmation of the 34px default row density — after the stylesheet (§1.5) and the screenshot's
pixel pitch (§1.1).

### 4.1 Every check was watched failing first

| Check | Control installed | Observed red |
| --- | --- | --- |
| AC-3 | reader hardcoded to `"touch"` | `at rest=touch after mouse=touch` |
| AC-1 | old branch restored: touch always extends | **16 cells, rows 2-9 x 2 columns** |
| AC-2 | `nextCellRange` always collapses | shift-extend fell to 1 |
| AC-4 | resolver returns `select-cell` always | 2 of 5 rows wrong |
| AC-5 | same, plus the mouse half of the pair | `tap=select-cell` |
| AC-7 | long-press delay raised to 5000ms | 600ms press fired 0 |
| AC-6 | `{ scrimCapturesPointer: false }` | `pointer-events=none ... resolves to <td>` |

**Corrected.** This paragraph previously read: *"AC-1's control reproduced the operator's screenshot
exactly — 8 rows by 2 columns, 16 cells."* That was an overclaim, and the word doing the damage was
"exactly". The control produces **8 rows by 2 columns, 16 cells**. The screenshot shows **7 rows by
2 columns, 14 cells** (§1.1, measured off the PNG). Those are two different numbers, and the
sentence asserted they were one.

What the control does establish, stated without the overclaim: restoring the old branch made the
shipped code path paint a contiguous multi-row, multi-column block from two taps, which is the
behaviour the screenshot shows. The geometry differs by one row because the harness taps rows 2 and
9, enclosing eight, while the operator's two taps enclosed seven — a difference in where the fingers
landed, not in what the code did with them.

**The fix's direction is unaffected.** The defect was never "the block is N rows tall"; it was "a
second tap keeps the anchor and extends" (§1.1). Seven rows and eight rows are the same defect, and
the repair — route the decision off per-event `pointerType` — is the same repair for both. Nothing
below AC-1 changes because of this correction.

### 4.2 The gate's remaining red is not this phase's

**The css-lane red recorded here is resolved.** `013-add-view-sheet` finished its follow-ups and
released the lane, and `check-lane` now reports the stylesheet unchanged since the lane was taken,
held by nobody, exit 0. Nothing is owed to this phase from that direction. No baseline hash is
written here on purpose: the lane has already changed hands once since the red was recorded, and a
hash in this document would be stale before anyone read it.

**A different check is red now.** `screenshots-fresh` reports **204 captures stale**, and every one
of the 204 is attributed to `styles.css` — zero to any `src/` file. The stylesheet moved after the
last capture run and was not recaptured. That is the same shape as the red it replaced: a CSS edit
by another phase in the same program, landing between this phase's work and this phase's gate.

**This phase made no CSS edit and never held the lane.** Claiming it now would absorb another
phase's unrecaptured edit, which is the failure this lane's own history names — see its
`010-sheet-reading-and-keyboard` entry: drift "is recorded rather than absorbed." It is recorded
here and left for its owner.

Two things follow that are worth stating plainly. AC-8 is **FAIL**, because the threshold is exit 0
and the observed exit is 1 — attribution explains a red, it does not clear one. And the fact that
zero of the 204 stale captures name a `src/` file is a second, independent confirmation of §4.3:
this phase's TypeScript edits are not what invalidated the captures.

### 4.3 Capture churn floor, measured rather than assumed

The verifier marked 20 captures stale against `src/views/cell-renderer.ts`. It fingerprints sources,
so an edit invalidates provenance whether or not a pixel moves.

| Run | Source change | PNGs whose bytes moved |
| --- | --- | --- |
| 1 | this phase's edits | 7 |
| 2 | **none** | 4 |

The movers were the same calendar, timeline and record-sheet family both times. **No table or field
capture moved in either run** — including all 20 the verifier had flagged. So the fingerprints were
refreshed and no pixel is attributable to this change, which matches the harness rendering static
markup that imports nothing from `src/`.

## 5. WHAT IS OUT OF SCOPE

- Row-checkbox range selection on touch (§1.6).
- The 760 versus 600 breakpoint numbers. §2 concludes they are correct as they stand.
- The long-press row menu's own behaviour beyond "it still fires".
- Desktop range selection, shift-click and drag-to-extend, which are correct.

### 5.1 Tap-to-open-record shipped in one pointer owner before both — closed during this pass

**The defect.** §1.2 concludes the contradiction risk is between two files and both are fixed
through one shared module. The shared module was shared; **the wiring was not.** `setupTitleCellTap`
was a private method on `DatabaseView`, bound only there. The embedded database renderer had no
equivalent, so an embedded title cell fell through to `cell-renderer`'s own click handler, which
passed `isTitleCell: false` as a constant. On a phone that resolved to `edit-cell` and opened the
inline rename editor — the very behaviour the main view routes to the sheet.

That is the failure mode `spec.md` §2 names in its first bullet, "binding a new meaning on top of an
old one rather than instead of it", arrived at from the other direction: the new meaning bound in
one place and not the other.

**Closed.** The code lane fixed it while these corrections were being written, and it was verified
by reading rather than taken on report. `setupTitleCellTap` now lives in the shared
`table-record-peek.ts` and is bound by **both** renderers. `isTitleCell` is no longer a constant: it
is `isMainItemColumn(colKey, visibleColumnKeys)` from `table-cell-gesture.ts`, wired in both views.
`cell-renderer`'s click handler defers on `open-record` so the capture-phase handler stays the
single path to the sheet.

**The landed fix is wider than the report.** Reading `false` was wrong even in the main view
whenever the note-name column is hidden, because the first visible column then becomes the row's
main item — one press would have opened the editor and the sheet at once. Keying off the visible
column order rather than off `file.name` closes the reported asymmetry and that second case
together.

This section is left in place rather than deleted. The gap was real, it is named, and the record
should show what changed rather than reading as though the two owners always agreed.

### 5.2 Two behaviours this phase removes from a phone

Recorded in `spec.md` §6 and cross-referenced here because both are removals and neither had a
criterion: a tap on the note name no longer opens the note (the sheet's expand control is the
replacement), and the title cell's rename editor has no reachable touch entry point at all. Neither
is measured by a check in §3 — they are established by reading the handlers, and they are stated at
that strength and no higher.

## 6. IMAGES OPENED

- `device-range-select-on-touch.png` — read the painted block as **7 rows by 2 columns, 14 cells**,
  bounded by a single outer border with a heavier double ring on the focus cell
  (`32 • Aug '27` / Income). The enclosed columns are Month and Income; `25 • Jan '27` sits directly
  above the block and `30 • Jun '27` directly below it, both outside the border. The Month column
  carries the `Aa` type glyph and a per-row expand icon; every row checkbox is unticked, which is
  what rules out the row-selection path in §1.6.

  The count was first written as 8 by 2 = 16 and is corrected here. It is now measured rather than
  counted: 1206 by 2622 device pixels at DPR 3, border box `y 1116-1829` = 714 device pixels = 238
  CSS pixels = seven 34px rows, and seven enclosed labels when read one by one. The same scan gives
  a 102-device-pixel row pitch, which is where §1.1's independent check of the 34px density comes
  from.
- `device-sheet-from-row.png` — the record sheet for `15 • Mar '26`: grab handle, title, expand and
  close controls, then 13 label-and-value rows. This is `openRecordDetailPanel` presenting through
  `applySheetChrome`, and it is the surface AC-4 routes a title tap to.
