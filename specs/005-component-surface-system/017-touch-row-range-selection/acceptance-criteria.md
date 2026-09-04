---
title: "Acceptance Criteria: Touch Row Range Selection"
description: "Every acceptance criterion for touch row range selection, each with its threshold, its recorded failing number and its negative control."
trigger_phrases:
  - "017 acceptance criteria"
  - "touch row range selection criteria"
  - "pointer gesture threshold"
importance_tier: "important"
contextType: "implementation"
---
# Acceptance Criteria: Touch Row Range Selection

Each criterion carries a number with a threshold, was demonstrated failing on a deliberately broken
tree with the failing number recorded, and is measured by driving the shipped gesture module with
`PointerEvent`s in a real browser.

**"Real" was doing work that word cannot do here, and the sentence has been narrowed.** The events
are constructed and dispatched at the element — `el.dispatchEvent(new PointerEvent(…))` — so they
are real objects reaching real listeners, but they are **not delivered through the browser's input
pipeline** and therefore skip hit-testing: nothing in this file can notice an overlay, a
`pointer-events` rule or a `touch-action` that would stop a thumb reaching the checkbox. Phase 016
drives Chrome DevTools `Input.dispatchTouchEvent` and does not have this gap.

**What is real, and it is most of it.** `applyRowSelectionPress`, `attachRowRangeGesture`,
`attachLongPress` and `isTouchDevice` are bundled from `src/`, so the algebra, the 450ms threshold,
the pointer-type guard and the click swallow at `table-cell-gesture.ts:233` are the shipped ones. The
table around them is hand-built, and its adapter was compared against `database-view.ts:8156` and
`:4475` and **matches** — same `heldPress` constants, same `ignoreTarget` predicate, and
`createCheckbox({ role: "row" })` really does emit the bare `input.db-checkbox-row[type=checkbox]`
that `isRowSelectionCheckbox` looks for. So these checks are not passing over a defect that exists;
they are blind to one introduced in `setupRowInteractions` alone, where no check would move.

Every negative control below was applied, run, observed red, then restored, and the restoration was
verified by SHA-256 rather than by reading the file. `src/views/table-cell-gesture.ts` returns to
`e87c7afd02fedcc3fcd27eaf62a76f75e2c286834cc914eb30c9bc6e03f46698` and
`src/data/touch-environment.ts` to `061bc7bdf8b8e773d48fdbb1c94e327a04a48656ce52b326a143ab59ffec3b4f`.

## The controls

| # | What was broken | Rule targeted |
|---|---|---|
| NC1 | `shouldExtendRowRange` returns `true` unconditionally | the repair itself — "shift is permanently held" restored |
| NC2 | `attachLongPress` stops screening on `pointerType` | the guard that keeps a mouse off the hold path |
| NC3 | the click after a completed hold is no longer swallowed | the release must not undo the range |
| NC4 | the row menu screens its target *after* the timer | the embedded call site's pre-fix shape |
| NC5 | the range gesture never arms on the checkbox | the gesture exists at all |
| NC6 | `shouldExtendRowRange` drops the `shiftKey` term | desktop shift-click is unchanged |

Each targets a distinct rule, and no control turned every check red — that is what makes them
discriminating rather than a global switch. NC1 left the hold checks green, NC6 left the hold checks
green, and NC5 left the desktop checks green.

## AC-1 — a tap on a row checkbox selects only that row

**Threshold.** Pressing row 2 then row 8 on a phone leaves exactly 2 rows selected, and they are rows
2 and 8.

**Failing first.** 7 rows: `note-2 … note-8`. That is the operator's report, reproduced.

**After.** 2 rows: `note-2.md, note-8.md`. 0 extensions fired.

**Check.** `a tap on a row checkbox selects only that row` (390x844, `hasTouch`, `isMobile`).

**Negative control.** NC1 → `FAIL … selected 7 row(s)`.

## AC-2 — a mouse click selects only that row, however narrow the pane

**Threshold.** The same two presses with `pointerType=mouse` on a 1440px window with a 700px leaf
leave exactly 2 rows selected — **and** `isTouchDevice(row)` must read `true`, or the check is
passing on a wide pane for a reason it is not testing.

**Failing first.** 7 rows, with `isTouchDevice(row)=true innerWidth=1440`. This is the half of the
defect that was never a phone defect.

**After.** 2 rows, `isTouchDevice(row)=true innerWidth=1440`.

**Check.** `a mouse click on a row checkbox selects only that row, however narrow the pane`.

**Negative control.** NC1 → `FAIL … selected 7 row(s)`.

## AC-3 — a held press on a second row checkbox extends the selection to it

**Threshold.** Tap row 2, hold row 8 for 520ms: 7 rows selected, exactly 1 extension fired, exactly
1 haptic.

**Failing first.** 1 row (`note-2.md`), 0 extensions, 0 haptics — the capability absent, which is
what a thumb had before this phase and would have again if the gesture stopped arming.

**After.** 7 rows (`note-2 … note-8`), 1 extension, 1 haptic.

**Check.** `a held press on a second row checkbox extends the selection to it`.

**Negative control.** NC5 → `FAIL … selected 1 row(s) … 0 extension(s) and 0 haptic(s)`.

## AC-4 — the click a completed hold releases does not undo the range it painted

**Threshold.** Lifting the finger after the hold leaves the selection exactly as the hold left it.

**Failing first.** 6 rows. The release produces a click on an already-selected checkbox, and
unswallowed it toggles row 8 straight back off — the range paints and then loses its own last row.
This is the difference between a gesture and a flicker, and it is invisible in any check that stops
measuring when the timer fires.

**After.** 7 rows, identical to the set at the moment the hold fired.

**Check.** `the click a completed hold releases does not undo the range it painted`.

**Negative control.** NC3 → `FAIL … left 6 row(s) selected`.

## AC-5 — a slow mouse click still toggles, because no hold completed to swallow it

**Threshold.** A 520ms mouse press on row 8, after row 2, releases to 2 rows.

**Why this criterion exists.** AC-4 and this one have opposite right answers for the same release. A
swallow keyed to "a long press happened" rather than "a hold fired" satisfies AC-4 and breaks every
slow mouse click there has ever been, silently, on desktop. Neither criterion is safe alone.

**After.** 2 rows: `note-2.md, note-8.md`.

**Check.** `a slow mouse click still toggles, because no hold completed to swallow it`.

**Negative controls.** NC2 and NC3 both take it red.

## AC-6 — a press released before the hold threshold selects one row, not a range

**Threshold.** A 300ms press fires 0 extensions against the shipped 450ms threshold, and releases to
2 rows.

**Failing first.** 7 rows under NC1. Without a real threshold, "held" is just another word for
"touch" — which is the defect this phase replaced, wearing a new name.

**After.** 0 extensions at 300ms; 2 rows after release. Measured on both pages.

**Check.** `a press released before the hold threshold selects one row, not a range`.

**Negative control.** NC1 → `FAIL`.

## AC-7 — a held mouse press never extends, however the pane measures

**Threshold.** A 520ms mouse press on the checkbox, in a leaf narrow enough that
`isTouchDevice(row)=true`, fires 0 extensions and 0 haptics and leaves 1 row selected.

**Failing first.** 7 rows, 1 extension, 1 haptic, at `innerWidth=1440`.

**After.** 1 row, 0 extensions, 0 haptics, with the predicate reading `true`.

**Why the narrow pane.** On a full-width desktop leaf `isTouchDevice` is false and `attachLongPress`
never arms, so the check would pass without ever exercising the pointer-type guard. The 700px leaf is
what forces the guard to be the thing doing the work.

**Check.** `a held mouse press never extends, however the pane measures`.

**Negative control.** NC2 → `FAIL … selected 7 row(s) … 1 extension(s) and 1 haptic(s)`.

## AC-8 — a shift-click on a row checkbox still extends the selection

**Threshold.** Click row 2, shift-click row 8: 7 rows, on **both** pages.

**Failing first.** 2 rows, on both pages.

**After.** 7 rows on both pages.

**Why it is measured on the phone too.** A rule keyed to the pointer could plausibly have taken
shift-click away from a device that reports touch, and no desktop check would have noticed.

**Check.** `a shift-click on a row checkbox still extends the selection` (both pages).

**Negative control.** NC6 → `FAIL … selected 2 row(s) — want 7` on both pages.

## AC-9 — a hold on the checkbox and a hold on the row body are one gesture with two answers — **WITHDRAWN on the row-menu term**

**Threshold.** On the checkbox: 1 extension, 0 row menus, 1 haptic. On the row body: 0 extensions,
1 row menu, 1 haptic. On the mouse page: 0/0/0 for both.

**Failing first.** **2 haptics** for one hold on the checkbox — the embedded renderer's pre-fix
shape, where the target was screened after the timer instead of before it, so the row menu's own hold
buzzed and swallowed the press before declining to open anything.

**After.** 1/0/1 on the checkbox and 0/1/1 on the row body.

**Why the haptic is counted.** It is the gesture's only outward signal. A hold that buzzes twice is
two gestures wearing one costume, and no selection assertion can see it. Counting it is also what
proves the row menu still answers — the phone's only route to several row actions — rather than
having been quietly displaced by the new gesture.

**Check.** `a hold on the checkbox and a hold on the row body are one gesture with two answers`.

**Negative control.** NC4 → `FAIL … on the checkbox: 1 extension(s), 0 row menu(s), 2 haptic(s)`.

**Withdrawn: the row-menu count is a counter, not a menu.** `verify-placement.mjs:2864` passes
`onLongPress: () => { menuCount += 1 }`; `database-view.ts:8155` passes
`(event) => this.rowMenu.show(event, row, context, tr)`. So "1 row menu" evidences that the hold
reached a handler, not that a menu was built, anchored or dismissable — the same shape that already
produced a false green in this program when `editFileName` was a counting stub and a check certified
a double-tap that created no editor. The rationale above says the count "proves the row menu still
answers"; a counter cannot carry that sentence.

**The other two terms hold.** The extension count comes from the shipped `attachRowRangeGesture`, and
the haptic is counted by intercepting `navigator.vibrate`, which the shipped `attachLongPress` really
calls — so the buzz-twice defect this criterion exists for is genuinely observable. The **2 haptics**
before-number, though, came from the embedded renderer, and this check pairs two harness-attached
`attachLongPress` instances instead: it reproduces the defect's shape, not its site.

**What would settle it.** `verify-placement` already bundles `RowMenu`. Assert a menu is in the
document and anchored to the row, rather than incrementing an integer.

## Run totals

| Run | verify-placement | Exit |
|---|---|---|
| Baseline, session start | 87/88, 1 declared red | 0 |
| This phase applied, before the tree moved | 99/100, 1 declared red | 0 |
| Current tree, best observed | 108/109, 1 declared red | 0 |
| Current tree, typical | 105/109, 1 declared red, 3 red in the stylesheet lane | 1 |

The 12 checks added here were green in **every** run taken after the change — including the runs
where the whole harness exited 1 — and green in both halves of all six negative controls except the
one control each was written to catch.

The last two rows are the same tree minutes apart. The stylesheet lane is editing `styles.css` live,
so its three geometry checks flip between runs; one run caught a moment when they all passed. That
oscillation is itself the cleanest evidence of ownership: nothing in this phase changed between those
two runs.

The three reds — `the switch control gives a finger at least 28px`, and the desktop and phone
`reorder button and the row checkbox do not overlap` — are not this phase's. They arrived mid-session
with `familyResults`, `touchResults` and `overlapResults`, arrays added to the harness by the
concurrent stylesheet lane, and they measure painted CSS geometry only: a 34x18 switch against a 28px
floor, and a -17px / -14px gap between two controls in the select cell. This phase edited no
stylesheet and changed no rendering. They fail identically with this phase's code fully restored,
which is the measurement that separates them.
